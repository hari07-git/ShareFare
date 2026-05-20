package com.sharefare.service;

import com.sharefare.exception.ApiException;
import com.sharefare.model.User;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class IdCardVerificationService {

  private final UserRepository userRepository;
  private final VerificationAuditService auditService;
  private final FileStorageService fileStorageService;
  private final EmailService emailService;

  public IdCardVerificationService(UserRepository userRepository,
                                   VerificationAuditService auditService,
                                   FileStorageService fileStorageService,
                                   EmailService emailService) {
    this.userRepository = userRepository;
    this.auditService = auditService;
    this.fileStorageService = fileStorageService;
    this.emailService = emailService;
  }

  @Transactional
  public void processIdCard(Long userId, String idCardFilename) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

    user.setIdCardUrl(idCardFilename);
    user.setIdCardUploadedAt(Instant.now());
    user.setUploadAttempts(user.getUploadAttempts() + 1);
    user.setLastUploadDate(Instant.now());

    // Set verification status to pending review
    user.setVerificationStatus("PENDING_REVIEW");
    user.setAccountStatus(com.sharefare.model.AccountStatus.PENDING_VERIFICATION);
    user.setRejectionReason(null);
    user.setVerificationRejectedReason(null);
    auditService.logAction(user.getId(), "UPLOAD_ID_MANUAL_FLOW", "USER", "SYSTEM", "UNVERIFIED", "PENDING_REVIEW", 0.0, 0.0, "Uploaded ID for manual review");

    userRepository.save(user);
    
    // Send email to admin
    try {
      emailService.sendNewVerificationRequestToAdmin(user.getFullName(), user.getEmail(), user.getIdCardUploadedAt());
    } catch (Exception e) {
      // Don't fail the upload if email fails
    }
  }


}
