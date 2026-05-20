package com.sharefare.dto;

import com.sharefare.model.UserRole;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class ProfileDtos {
  public record MeResponse(
      Long id,
      String email,
      String fullName,
      String phone,
      String collegeId,
      boolean collegeVerified,
      boolean emailVerified,
      UserRole role,
      Instant createdAt,
      String verificationStatus,
      Double trustScore,
      com.sharefare.model.AccountStatus accountStatus,
      String gender,
      Double safetyScore,
      Integer totalCompletedRides,
      Double cancellationRate
  ) {}

  public record UpdateMeRequest(
      @NotBlank String fullName,
      String phone,
      String collegeId
  ) {}
}
