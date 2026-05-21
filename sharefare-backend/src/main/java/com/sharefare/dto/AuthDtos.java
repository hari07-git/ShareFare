package com.sharefare.dto;

import com.sharefare.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AuthDtos {
  public record RegisterRequest(
      @NotBlank @Email String email,
      @NotBlank @Size(min = 8, max = 72) String password,
      @NotBlank String fullName,
      String phone,
      @NotBlank String gender
  ) {}

  public record LoginRequest(
      @NotBlank @Email String email,
      @NotBlank String password
  ) {}

  public record LoginResponse(String token) {}

  public record MessageResponse(String message) {}

  public record RegisterResponse(
      String message,
      String otp,          // non-null only when MAIL_ENABLED=false
      boolean emailVerified
  ) {}

  public record ForgotPasswordResponse(
      String message,
      String otp           // non-null only when MAIL_ENABLED=false
  ) {}

  public record EmailRequest(
      @NotBlank @Email String email
  ) {}

  public record VerifyEmailRequest(
      @NotBlank String token
  ) {}

  public record VerifyOtpRequest(
      @NotBlank @Email String email,
      @NotBlank @Size(min = 6, max = 6) String otp
  ) {}

  public record ResetPasswordRequest(
      @NotBlank String token,
      @NotBlank @Size(min = 8, max = 72) String password
  ) {}

  public record ResetPasswordOtpRequest(
      @NotBlank @Email String email,
      @NotBlank @Size(min = 6, max = 6) String otp,
      @NotBlank @Size(min = 8, max = 72) String password
  ) {}
}
