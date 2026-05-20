package com.sharefare.dto;

import java.time.Instant;
import java.util.List;

public class VerificationDtos {

  public record VerificationStatusDTO(
      String verificationStatus,
      int verificationLevel,
      Instant idCardUploadedAt,
      String rejectionReason,
      String collegeName,
      Instant verifiedAt,
      boolean collegeVerified
  ) {}

  public record AdminVerificationActionDTO(
      String action, // "APPROVE", "REJECT", "REQUEST_REUPLOAD"
      String note,
      String rejectionReason
  ) {}

  public record AdminPendingVerificationDTO(
      Long userId,
      String email,
      String fullName,
      String verificationStatus,
      String idCardUrl,
      Instant idCardUploadedAt,
      int uploadAttempts,
      boolean emailVerified,
      boolean phoneVerified,
      Instant joinedDate
  ) {}

}
