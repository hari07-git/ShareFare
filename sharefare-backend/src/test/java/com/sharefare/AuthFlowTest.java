package com.sharefare;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sharefare.model.AuthTokenPurpose;
import com.sharefare.model.UserRole;
import com.sharefare.repo.AuthTokenRepository;
import com.sharefare.repo.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
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
  @MockBean JavaMailSender mailSender;

  @Test
  void registerThenLogin() throws Exception {
    var register = Map.of(
        "email", "alice@example.edu",
        "password", "Password123!",
        "fullName", "Alice",
        "role", UserRole.USER.name()
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
        "role", UserRole.USER.name()
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
        .andExpect(jsonPath("$.message").value("No ShareFare account found for this email. Use the same email you registered with."));
  }

  @Test
  void invalidOtpReturnsBadRequestNotServerError() throws Exception {
    var register = Map.of(
        "email", "otp@example.edu",
        "password", "Password123!",
        "fullName", "Otp User",
        "role", UserRole.USER.name()
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
