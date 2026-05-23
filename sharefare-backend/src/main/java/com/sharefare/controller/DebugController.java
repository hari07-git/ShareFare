package com.sharefare.controller;

import org.springframework.core.env.Environment;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
  private final Environment environment;

  public DebugController(Environment environment) {
    this.environment = environment;
  }

  @GetMapping("/mail")
  public Map<String, Object> mail() {
    String apiKey = environment.getProperty("app.brevo.apiKey", "");
    return Map.of(
        "provider", "brevo",
        "brevoApiKeyExists", apiKey != null && !apiKey.isBlank(),
        "brevoSender", environment.getProperty("app.brevo.sender", ""),
        "supportEmail", environment.getProperty("app.mail.supportEmail", "")
    );
  }
}
