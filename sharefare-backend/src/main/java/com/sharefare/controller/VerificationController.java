package com.sharefare.controller;

import com.sharefare.dto.VerificationDtos.VerificationStatusDTO;
import com.sharefare.model.User;
import com.sharefare.repo.UserRepository;
import com.sharefare.security.JwtService;
import com.sharefare.service.FileStorageService;
import com.sharefare.service.IdCardVerificationService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/verification")
public class VerificationController {

  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final FileStorageService fileStorageService;
  private final IdCardVerificationService idCardVerificationService;


  public VerificationController(JwtService jwtService,
                                UserRepository userRepository,
                                FileStorageService fileStorageService,
                                IdCardVerificationService idCardVerificationService) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.fileStorageService = fileStorageService;
    this.idCardVerificationService = idCardVerificationService;
  }

  @GetMapping("/status")
  public ResponseEntity<VerificationStatusDTO> getStatus(@RequestHeader("Authorization") String authHeader) {
    Long userId = getUserId(authHeader);
    User user = userRepository.findById(userId).orElseThrow();
    
    return ResponseEntity.ok(new VerificationStatusDTO(
        user.getVerificationStatus(),
        user.getVerificationLevel(),
        user.getIdCardUploadedAt(),
        user.getRejectionReason(),
        user.getCollegeName(),
        user.getVerifiedAt(),
        user.isCollegeVerified()
    ));
  }

  @PostMapping("/upload-id")
  public ResponseEntity<?> uploadIdCard(@RequestHeader("Authorization") String authHeader,
                                        @RequestParam("idCard") MultipartFile file) {
    Long userId = getUserId(authHeader);
    
    try {
      if (file.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Unable to process ID card", "reason", "File is empty"));
      }

      if (file.getSize() > 5 * 1024 * 1024) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Unable to process ID card", "reason", "File exceeds 5MB limit"));
      }
      
      String contentType = file.getContentType();
      if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png") && !contentType.equals("image/webp"))) {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Unable to process ID card", "reason", "Only JPG, PNG, and WebP are allowed"));
      }

      User user = userRepository.findById(userId).orElseThrow();
      
      // Rate limiting: max 3 attempts per day
      if (user.getLastUploadDate() != null) {
         long hoursSinceLastUpload = java.time.Duration.between(user.getLastUploadDate(), java.time.Instant.now()).toHours();
         if (hoursSinceLastUpload < 24 && user.getUploadAttempts() >= 3) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Unable to process ID card", "reason", "Maximum 3 upload attempts allowed per day"));
         }
         if (hoursSinceLastUpload >= 24) {
            user.setUploadAttempts(0); // Reset attempts
         }
      }

      String filename = fileStorageService.storeFile(file, "id_" + userId);
      idCardVerificationService.processIdCard(userId, filename);
      
      return ResponseEntity.ok(Map.of("success", true, "message", "ID Card uploaded successfully and processing started."));
    } catch (com.sharefare.exception.ApiException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("success", false, "message", e.getMessage()));
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.badRequest()
          .body(Map.of("success", false, "message", e.getMessage()));
    }
  }



  private Long getUserId(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new RuntimeException("Unauthorized");
    }
    String token = authHeader.substring(7);
    String email = jwtService.extractSubject(token);
    if (email == null) throw new RuntimeException("Unauthorized");
    User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
  }
}
