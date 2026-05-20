package com.sharefare.service;

import com.sharefare.dto.VerificationDtos.AdminPendingVerificationDTO;
import com.sharefare.dto.VerificationDtos.AdminVerificationActionDTO;
import com.sharefare.exception.ApiException;
import com.sharefare.model.User;
import com.sharefare.model.VehicleVerification;
import com.sharefare.repo.UserRepository;
import com.sharefare.repo.VehicleVerificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminVerificationService {

  private final UserRepository userRepository;
  private final VerificationAuditService auditService;
  private final EmailService emailService;
  private final VehicleVerificationRepository vehicleRepo;

  public AdminVerificationService(UserRepository userRepository,
                                  VerificationAuditService auditService,
                                  EmailService emailService,
                                  VehicleVerificationRepository vehicleRepo) {
    this.userRepository = userRepository;
    this.auditService = auditService;
    this.emailService = emailService;
    this.vehicleRepo = vehicleRepo;
  }

  @Transactional(readOnly = true)
  public List<AdminPendingVerificationDTO> getPendingVerifications() {
    return userRepository.findAll().stream()
        .filter(u -> "MANUAL_REVIEW".equals(u.getVerificationStatus()) || 
                     "PENDING_REVIEW".equals(u.getVerificationStatus()) ||
                     "AUTO_APPROVED_PENDING_ADMIN_REVIEW".equals(u.getVerificationStatus()))
        .map(u -> new AdminPendingVerificationDTO(
                u.getId(),
                u.getEmail(),
                u.getFullName(),
                u.getVerificationStatus(),
                u.getIdCardUrl(),
                u.getIdCardUploadedAt(),
                u.getUploadAttempts(),
                u.isEmailVerified(),
                u.getPhone() != null && !u.getPhone().isEmpty(),
                u.getCreatedAt()
            ))
        .collect(Collectors.toList());
  }

  @Transactional
  public void processAction(Long targetUserId, Long adminUserId, AdminVerificationActionDTO action) {
    User user = userRepository.findById(targetUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        
    String oldStatus = user.getVerificationStatus();
    user.setReviewedByAdminId(adminUserId);
    user.setAdminReviewedAt(Instant.now());
    user.setAdminNote(action.note());
    user.setVerificationSource("admin_manual");

    if ("APPROVE".equalsIgnoreCase(action.action())) {
      user.setVerificationStatus("ADMIN_VERIFIED");
      user.setAccountStatus(com.sharefare.model.AccountStatus.VERIFIED_STUDENT);
      user.setVerifiedStudent(true);
      user.setVerificationLevel(3);
      user.setCollegeVerified(true);
      user.setVerifiedAt(Instant.now());
      user.setTrustScore(user.getTrustScore() + 0.5); // Boost trust
      // Notify user
      emailService.sendAdminVerified(user.getEmail(), user.getFullName());
      
    } else if ("REJECT".equalsIgnoreCase(action.action())) {
      user.setVerificationStatus("REJECTED");
      user.setAccountStatus(com.sharefare.model.AccountStatus.REJECTED);
      user.setVerificationLevel(0);
      user.setRejectionReason(action.rejectionReason());
      user.setVerificationRejectedReason(action.rejectionReason());
      user.setCollegeVerified(false);
      emailService.sendVerificationRejected(user.getEmail(), user.getFullName(), action.rejectionReason());
      
    } else if ("REQUEST_REUPLOAD".equalsIgnoreCase(action.action())) {
      user.setVerificationStatus("UNVERIFIED");
      user.setVerificationLevel(0);
      user.setRejectionReason(action.rejectionReason());
      emailService.sendReuploadRequired(user.getEmail(), user.getFullName(), action.rejectionReason());
      
    } else {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Unknown action");
    }

    userRepository.save(user);
    auditService.logAction(targetUserId, action.action().toUpperCase(), "ADMIN_" + adminUserId, "ADMIN", oldStatus, user.getVerificationStatus(), 0.0, 0.0, action.note());
  }
}
