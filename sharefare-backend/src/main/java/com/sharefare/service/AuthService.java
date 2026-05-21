package com.sharefare.service;

import com.sharefare.dto.AuthDtos.LoginRequest;
import com.sharefare.dto.AuthDtos.LoginResponse;
import com.sharefare.dto.AuthDtos.RegisterRequest;
import com.sharefare.dto.AuthDtos.RegisterResponse;
import com.sharefare.dto.AuthDtos.ForgotPasswordResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.AuthToken;
import com.sharefare.model.AuthTokenPurpose;
import com.sharefare.model.User;
import com.sharefare.model.UserRole;
import com.sharefare.repo.AuthTokenRepository;
import com.sharefare.repo.UserRepository;
import com.sharefare.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Locale;

@Service
public class AuthService {
  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private final UserRepository userRepository;
  private final AuthTokenRepository authTokenRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtService jwtService;
  private final EmailService emailService;
  private final String frontendBaseUrl;
  private final boolean mailEnabled;

  public AuthService(UserRepository userRepository,
                     AuthTokenRepository authTokenRepository,
                     PasswordEncoder passwordEncoder,
                     AuthenticationManager authenticationManager,
                     JwtService jwtService,
                     EmailService emailService,
                     @Value("${app.frontendBaseUrl:http://localhost:5173}") String frontendBaseUrl,
                     @Value("${app.mail.enabled:true}") boolean mailEnabled) {
    this.userRepository = userRepository;
    this.authTokenRepository = authTokenRepository;
    this.passwordEncoder = passwordEncoder;
    this.authenticationManager = authenticationManager;
    this.jwtService = jwtService;
    this.emailService = emailService;
    this.frontendBaseUrl = frontendBaseUrl == null || frontendBaseUrl.isBlank()
        ? "http://localhost:5173"
        : frontendBaseUrl.replaceAll("/+$", "");
    this.mailEnabled = mailEnabled;
  }

  @Transactional
  public RegisterResponse register(RegisterRequest request) {
    if (userRepository.existsByEmailIgnoreCase(request.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
    }
    User user = new User();
    user.setEmail(request.email().toLowerCase());
    user.setFullName(request.fullName());
    user.setPhone(request.phone());
    user.setGender(request.gender());
    user.setEmailVerified(!mailEnabled);  // auto-verify when mail is disabled
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    userRepository.save(user);

    if (!mailEnabled) {
      // Mail disabled — create OTP token and return it directly in the response
      String otp = createOtpToken(user, java.time.Instant.now().plusSeconds(30 * 60));
      return new RegisterResponse(
          "Account created! Use the OTP shown below to verify your account.",
          otp,
          false
      );
    }

    try {
      sendVerification(user);
      return new RegisterResponse(
          "Account created! We sent a 6-digit OTP to your email.",
          null,
          false
      );
    } catch (Exception e) {
      // SMTP blocked — auto-verify and inform user they can login directly
      user.setEmailVerified(true);
      userRepository.save(user);
      System.err.println("⚠️ Email send failed, auto-verified: " + e.getMessage());
      return new RegisterResponse(
          "Account created! You can log in directly — email verification skipped.",
          null,
          true
      );
    }
  }

  @Transactional
  public LoginResponse login(LoginRequest request) {
    authenticationManager.authenticate(
        new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password()));
    var user = userRepository.findByEmailIgnoreCase(request.email())
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    if (!user.isEmailVerified()) {
      if (!mailEnabled) {
        // Mail is disabled — auto-verify so user can log in immediately
        user.setEmailVerified(true);
        userRepository.save(user);
      } else {
        try {
          sendVerification(user);
        } catch (Exception ignored) { }
        throw new ApiException(HttpStatus.FORBIDDEN, "Please verify your email with the OTP we sent to your Gmail.");
      }
    }
    return new LoginResponse(jwtService.issueToken(user.getEmail().toLowerCase()));
  }

  @Transactional
  public void verifyEmail(String token) {
    var authToken = validToken(token, AuthTokenPurpose.EMAIL_VERIFICATION);
    User user = authToken.getUser();
    user.setEmailVerified(true);
    authToken.setUsed(true);
    userRepository.save(user);
    authTokenRepository.save(authToken);
  }

  @Transactional
  public void verifyOtp(String email, String otp) {
    User user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP"));
    var authToken = authTokenRepository.findByUserAndTokenAndPurposeAndUsedFalse(
            user,
            normalizeOtp(otp),
            AuthTokenPurpose.EMAIL_VERIFICATION)
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP"));
    if (authToken.getExpiresAt().isBefore(Instant.now())) {
      authToken.setUsed(true);
      authTokenRepository.save(authToken);
      throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP");
    }
    user.setEmailVerified(true);
    authToken.setUsed(true);
    userRepository.save(user);
    authTokenRepository.save(authToken);
  }

  @Transactional
  public void resendVerification(String email) {
    User user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No ShareFare account found for this email. Please create an account first."));
    if (user.isEmailVerified()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "This email is already verified. Please login.");
    }
    sendVerification(user);
  }

  @Transactional
  public ForgotPasswordResponse requestPasswordReset(String email) {
    User user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
            "No ShareFare account found for this email."));
    // Always use OTP-based reset (works without email too)
    String otp = createOtpToken(user, Instant.now().plusSeconds(30 * 60));
    if (!mailEnabled) {
      return new ForgotPasswordResponse(
          "Account found! Use the OTP shown below to reset your password.",
          otp
      );
    }
    try {
      emailService.sendPasswordReset(user.getEmail(), user.getFullName(),
          frontendBaseUrl + "/auth/reset-password?token=" + otp);
      return new ForgotPasswordResponse(
          "Reset OTP sent to your email. Check your inbox.",
          null
      );
    } catch (Exception e) {
      System.err.println("⚠️ Reset email failed: " + e.getMessage());
      return new ForgotPasswordResponse(
          "Email unavailable. Use the OTP shown below to reset your password.",
          otp
      );
    }
  }

  @Transactional
  public void resetPasswordByOtp(String email, String otp, String newPassword) {
    User user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found"));
    var authToken = authTokenRepository
        .findByUserAndTokenAndPurposeAndUsedFalse(user, normalizeOtp(otp), AuthTokenPurpose.EMAIL_VERIFICATION)
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired OTP"));
    if (authToken.getExpiresAt().isBefore(Instant.now())) {
      authToken.setUsed(true);
      authTokenRepository.save(authToken);
      throw new ApiException(HttpStatus.BAD_REQUEST, "OTP expired. Please request a new one.");
    }
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    user.setEmailVerified(true);
    authToken.setUsed(true);
    userRepository.save(user);
    authTokenRepository.save(authToken);
  }

  private void sendVerification(User user) {
    var otp = createOtpToken(user, Instant.now().plusSeconds(10 * 60));
    emailService.sendEmailVerificationOtp(user.getEmail(), user.getFullName(), otp);
  }

  private String createOtpToken(User user, Instant expiresAt) {
    authTokenRepository.deleteByUserAndPurposeAndUsedFalse(user, AuthTokenPurpose.EMAIL_VERIFICATION);
    AuthToken authToken = new AuthToken();
    authToken.setUser(user);
    authToken.setPurpose(AuthTokenPurpose.EMAIL_VERIFICATION);
    authToken.setToken(newOtp());
    authToken.setExpiresAt(expiresAt);
    authTokenRepository.save(authToken);
    return authToken.getToken();
  }

  private String createToken(User user, AuthTokenPurpose purpose, Instant expiresAt) {
    authTokenRepository.deleteByUserAndPurposeAndUsedFalse(user, purpose);
    AuthToken authToken = new AuthToken();
    authToken.setUser(user);
    authToken.setPurpose(purpose);
    authToken.setToken(newToken());
    authToken.setExpiresAt(expiresAt);
    authTokenRepository.save(authToken);
    return authToken.getToken();
  }

  private AuthToken validToken(String token, AuthTokenPurpose purpose) {
    var authToken = authTokenRepository.findByTokenAndPurposeAndUsedFalse(token, purpose)
        .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired link"));
    if (authToken.getExpiresAt().isBefore(Instant.now())) {
      authToken.setUsed(true);
      authTokenRepository.save(authToken);
      throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid or expired link");
    }
    return authToken;
  }

  private static String newToken() {
    byte[] bytes = new byte[32];
    SECURE_RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private static String newOtp() {
    return String.format(Locale.ROOT, "%06d", SECURE_RANDOM.nextInt(1_000_000));
  }

  private static String normalizeOtp(String otp) {
    return otp == null ? "" : otp.replaceAll("\\D", "");
  }
}
