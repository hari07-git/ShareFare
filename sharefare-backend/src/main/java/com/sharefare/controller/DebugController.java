package com.sharefare.controller;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
public class DebugController {
  private final Environment environment;
  private final ObjectProvider<JavaMailSender> mailSenderProvider;

  public DebugController(Environment environment, ObjectProvider<JavaMailSender> mailSenderProvider) {
    this.environment = environment;
    this.mailSenderProvider = mailSenderProvider;
  }

  @GetMapping("/mail")
  public Map<String, Object> mail() {
    String smtpPassword = environment.getProperty("spring.mail.password", "");
    return Map.of(
        "mailEnabled", environment.getProperty("app.mail.enabled", Boolean.class, false),
        "smtpHost", environment.getProperty("spring.mail.host", ""),
        "smtpUser", environment.getProperty("spring.mail.username", ""),
        "smtpPasswordExists", smtpPassword != null && !smtpPassword.isBlank(),
        "mailSenderLoaded", mailSenderProvider.getIfAvailable() != null
    );
  }
}
