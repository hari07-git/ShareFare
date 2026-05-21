package com.sharefare.controller;

import com.sharefare.dto.AuthDtos.LoginRequest;
import com.sharefare.dto.AuthDtos.LoginResponse;
import com.sharefare.dto.AuthDtos.EmailRequest;
import com.sharefare.dto.AuthDtos.ForgotPasswordResponse;
import com.sharefare.dto.AuthDtos.MessageResponse;
import com.sharefare.dto.AuthDtos.RegisterRequest;
import com.sharefare.dto.AuthDtos.RegisterResponse;
import com.sharefare.dto.AuthDtos.ResetPasswordRequest;
import com.sharefare.dto.AuthDtos.ResetPasswordOtpRequest;
import com.sharefare.dto.AuthDtos.VerifyEmailRequest;
import com.sharefare.dto.AuthDtos.VerifyOtpRequest;
import com.sharefare.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(authService.login(request));
  }

  @PostMapping("/verify-email")
  public ResponseEntity<MessageResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
    authService.verifyEmail(request.token());
    return ResponseEntity.ok(new MessageResponse("Email verified. You can now login."));
  }

  @PostMapping("/verify-otp")
  public ResponseEntity<MessageResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
    authService.verifyOtp(request.email(), request.otp());
    return ResponseEntity.ok(new MessageResponse("Email verified. You can now login."));
  }

  @PostMapping("/resend-verification")
  public ResponseEntity<MessageResponse> resendVerification(@Valid @RequestBody EmailRequest request) {
    authService.resendVerification(request.email());
    return ResponseEntity.ok(new MessageResponse("Fresh OTP sent. Please check Gmail and spam."));
  }

  @PostMapping("/forgot-password")
  public ResponseEntity<ForgotPasswordResponse> forgotPassword(@Valid @RequestBody EmailRequest request) {
    return ResponseEntity.ok(authService.requestPasswordReset(request.email()));
  }

  @PostMapping("/reset-password-otp")
  public ResponseEntity<MessageResponse> resetPasswordOtp(
      @Valid @RequestBody ResetPasswordOtpRequest request) {
    authService.resetPasswordByOtp(request.email(), request.otp(), request.password());
    return ResponseEntity.ok(new MessageResponse("Password updated! You can now login."));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPasswordByOtp("", request.token(), request.password());
    return ResponseEntity.ok(new MessageResponse("Password updated. You can now login."));
  }
}
