package com.sharefare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

@SpringBootApplication
@EnableScheduling
public class ShareFareApplication {
  public static void main(String[] args) {
    loadDotenv();
    SpringApplication.run(ShareFareApplication.class, args);
  }

  private static void loadDotenv() {
    List<Path> candidates = List.of(
        Path.of(".env"),
        Path.of("..", ".env")
    );
    candidates.stream()
        .filter(Files::isRegularFile)
        .findFirst()
        .ifPresent(ShareFareApplication::loadDotenvFile);
  }

  private static void loadDotenvFile(Path path) {
    try {
      int loaded = 0;
      for (String rawLine : Files.readAllLines(path)) {
        String line = rawLine.trim();
        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) continue;
        String key = line.substring(0, line.indexOf('=')).trim();
        String value = line.substring(line.indexOf('=') + 1).trim();
        if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length() - 1);
        }
        if (!key.isBlank() && isBlank(System.getenv(key)) && isBlank(System.getProperty(key))) {
          System.setProperty(key, value);
          loaded++;
        }
      }
      applyMailAliases();
      System.out.println("Loaded ShareFare environment from " + path.toAbsolutePath().normalize()
          + " (" + loaded + " values, SMTP host=" + safeVisible(readConfig("spring.mail.host"))
          + ", SMTP user=" + safeVisible(readConfig("spring.mail.username"))
          + ", SMTP password exists=" + !isBlank(readConfig("spring.mail.password")) + ")");
    } catch (IOException ex) {
      throw new IllegalStateException("Could not load .env file: " + path.toAbsolutePath(), ex);
    }
  }

  private static void applyMailAliases() {
    Map<String, List<String>> aliases = Map.of(
        "app.mail.enabled", List.of("MAIL_ENABLED"),
        "app.mail.from", List.of("MAIL_FROM"),
        "app.mail.supportEmail", List.of("MAIL_SUPPORT_EMAIL"),
        "spring.mail.host", List.of("SPRING_MAIL_HOST", "SMTP_HOST", "MAIL_HOST"),
        "spring.mail.port", List.of("SPRING_MAIL_PORT", "SMTP_PORT", "MAIL_PORT"),
        "spring.mail.username", List.of("SPRING_MAIL_USERNAME", "SMTP_USERNAME", "MAIL_USERNAME"),
        "spring.mail.password", List.of("SPRING_MAIL_PASSWORD", "SMTP_PASSWORD", "MAIL_PASSWORD"),
        "spring.mail.properties.mail.smtp.auth", List.of("SPRING_MAIL_PROPERTIES_MAIL_SMTP_AUTH", "SMTP_AUTH", "MAIL_SMTP_AUTH"),
        "spring.mail.properties.mail.smtp.starttls.enable", List.of("SPRING_MAIL_PROPERTIES_MAIL_SMTP_STARTTLS_ENABLE", "SMTP_STARTTLS", "MAIL_SMTP_STARTTLS_ENABLE")
    );

    aliases.forEach((target, sources) -> {
      if (!isBlank(readConfig(target))) return;
      sources.stream()
          .map(ShareFareApplication::readConfig)
          .filter(value -> !isBlank(value))
          .findFirst()
          .ifPresent(value -> System.setProperty(target, value));
    });
  }

  private static String readConfig(String key) {
    String systemValue = System.getProperty(key);
    if (!isBlank(systemValue)) return systemValue;
    return System.getenv(key);
  }

  private static boolean isBlank(String value) {
    return value == null || value.isBlank();
  }

  private static String safeVisible(String value) {
    return value == null || value.isBlank() ? "<unset>" : value;
  }
}
