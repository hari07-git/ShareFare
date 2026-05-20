package com.sharefare.controller;

import com.sharefare.dto.AuthDtos.LoginRequest;
import com.sharefare.dto.AuthDtos.LoginResponse;
import com.sharefare.dto.AuthDtos.EmailRequest;
import com.sharefare.dto.AuthDtos.MessageResponse;
import com.sharefare.dto.AuthDtos.RegisterRequest;
import com.sharefare.dto.AuthDtos.ResetPasswordRequest;
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
  public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
    authService.register(request);
    return ResponseEntity.ok(new MessageResponse("Account created. We sent a 6-digit OTP to your email."));
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
  public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody EmailRequest request) {
    authService.requestPasswordReset(request.email());
    return ResponseEntity.ok(new MessageResponse("Password reset email sent. Please check Gmail and spam."));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request.token(), request.password());
    return ResponseEntity.ok(new MessageResponse("Password updated. You can now login."));
  }
}
