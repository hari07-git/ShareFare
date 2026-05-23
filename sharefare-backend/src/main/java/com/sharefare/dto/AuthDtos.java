package com.sharefare.dto;

import com.sharefare.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class AuthDtos {
  public record RegisterRequest(
      @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
      @NotBlank(message = "Password is required")
      @Size(min = 8, max = 72, message = "Password must be between 8 and 72 characters")
      @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$", message = "Password must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number")
      String password,
      @NotBlank(message = "Full name is required") String fullName,
      @NotBlank(message = "Phone number is required") String phone,
      @NotBlank(message = "Gender is required") String gender,
      @NotBlank(message = "College name is required") String collegeName
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
