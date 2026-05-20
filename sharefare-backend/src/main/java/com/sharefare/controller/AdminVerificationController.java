package com.sharefare.controller;

import com.sharefare.dto.VerificationDtos.AdminPendingVerificationDTO;
import com.sharefare.dto.VerificationDtos.AdminVerificationActionDTO;
import com.sharefare.exception.ApiException;
import com.sharefare.model.User;
import com.sharefare.model.UserRole;
import com.sharefare.repo.UserRepository;
import com.sharefare.security.JwtService;
import com.sharefare.service.AdminVerificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/verification")
public class AdminVerificationController {

  private final JwtService jwtService;
  private final UserRepository userRepository;
  private final AdminVerificationService adminVerificationService;

  public AdminVerificationController(JwtService jwtService,
                                     UserRepository userRepository,
                                     AdminVerificationService adminVerificationService) {
    this.jwtService = jwtService;
    this.userRepository = userRepository;
    this.adminVerificationService = adminVerificationService;
  }

  @GetMapping("/pending")
  public ResponseEntity<List<AdminPendingVerificationDTO>> getPending(@RequestHeader("Authorization") String authHeader) {
    Long adminId = verifyAdmin(authHeader);
    return ResponseEntity.ok(adminVerificationService.getPendingVerifications());
  }

  @PostMapping("/{userId}/action")
  public ResponseEntity<?> processAction(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable Long userId,
                                         @RequestBody AdminVerificationActionDTO action) {
    Long adminId = verifyAdmin(authHeader);
    adminVerificationService.processAction(userId, adminId, action);
    return ResponseEntity.ok(Map.of("message", "Action processed successfully"));
  }

  private Long verifyAdmin(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    String token = authHeader.substring(7);
    String email = jwtService.extractSubject(token);
    if (email == null) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    if (user.getRole() != UserRole.ADMIN) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Admin access required");
    }
    return user.getId();
  }
}
