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
      UserRole role,
      Instant createdAt
  ) {}

  public record UpdateMeRequest(
      @NotBlank String fullName,
      String phone,
      String collegeId
  ) {}
}

