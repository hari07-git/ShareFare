package com.sharefare;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sharefare.model.AuthTokenPurpose;
import com.sharefare.repo.AuthTokenRepository;
import com.sharefare.repo.UserRepository;
import com.sharefare.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper om;
  @Autowired AuthTokenRepository authTokenRepository;
  @Autowired UserRepository userRepository;

  @TestConfiguration
  static class EmailTestConfig {
    @Bean
    @Primary
    EmailService emailService() {
      return new EmailService("", "ShareFare Test <test@example.com>", "support@example.com", "http://localhost:5173") {
        @Override
        public void sendEmailVerificationOtp(String to, String name, String otp) {
        }

        @Override
        public void sendPasswordReset(String to, String name, String resetUrl) {
        }
      };
    }
  }

  @Test
  void registerThenLogin() throws Exception {
    var register = Map.of(
        "email", "alice@example.edu",
        "password", "Password123!",
        "fullName", "Alice",
        "phone", "9876543210",
        "gender", "Male",
        "collegeName", "Malla Reddy University"
    );
    mvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(register)))
        .andExpect(status().isOk());

    var login = Map.of("email", "alice@example.edu", "password", "Password123!");
    mvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(login)))
        .andExpect(status().isForbidden());

    var alice = userRepository.findByEmailIgnoreCase("alice@example.edu").orElseThrow();
    var verifyToken = authTokenRepository.findByUserAndTokenAndPurposeAndUsedFalse(
            alice,
            authTokenRepository.findAll().stream()
                .filter(token -> token.getUser().getId().equals(alice.getId()))
                .filter(token -> token.getPurpose() == AuthTokenPurpose.EMAIL_VERIFICATION)
                .findFirst()
                .orElseThrow()
                .getToken(),
            AuthTokenPurpose.EMAIL_VERIFICATION)
        .orElseThrow()
        .getToken();
    mvc.perform(post("/api/auth/verify-otp")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(Map.of("email", "alice@example.edu", "otp", verifyToken))))
        .andExpect(status().isOk());

    mvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(login)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isString());
  }

  @Test
  void forgotPasswordReturnsOkForKnownEmailAndNotFoundForUnknownEmail() throws Exception {
    var register = Map.of(
        "email", "reset@example.edu",
        "password", "Password123!",
        "fullName", "Reset User",
        "phone", "9876543211",
        "gender", "Female",
        "collegeName", "Malla Reddy University"
    );
    mvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(register)))
        .andExpect(status().isOk());

    mvc.perform(post("/api/auth/forgot-password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(Map.of("email", "reset@example.edu"))))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.message").isString());

    mvc.perform(post("/api/auth/forgot-password")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(Map.of("email", "missing@example.edu"))))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("No ShareFare account found for this email."));
  }

  @Test
  void invalidOtpReturnsBadRequestNotServerError() throws Exception {
    var register = Map.of(
        "email", "otp@example.edu",
        "password", "Password123!",
        "fullName", "Otp User",
        "phone", "9876543212",
        "gender", "Male",
        "collegeName", "Malla Reddy University"
    );
    mvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(register)))
        .andExpect(status().isOk());

    mvc.perform(post("/api/auth/verify-otp")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(Map.of("email", "otp@example.edu", "otp", "000000"))))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("Invalid or expired OTP"));
  }
}
