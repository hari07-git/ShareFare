package com.sharefare;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sharefare.model.UserRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
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

  @Test
  void registerThenLogin() throws Exception {
    var register = Map.of(
        "email", "alice@example.edu",
        "password", "Password123!",
        "fullName", "Alice",
        "role", UserRole.STUDENT.name()
    );
    mvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(register)))
        .andExpect(status().isOk());

    var login = Map.of("email", "alice@example.edu", "password", "Password123!");
    mvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .content(om.writeValueAsString(login)))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token").isString());
  }
}

