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
    
    // Auto-fix raw postgresql:// URLs from Render (handles credential parsing)
    String dbUrl = System.getenv("DB_URL");
    if (dbUrl == null || dbUrl.isBlank()) {
      dbUrl = System.getProperty("DB_URL");
    }
    if (dbUrl != null && !dbUrl.isBlank()) {
      if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
        if (dbUrl.contains("@")) {
          try {
            int protocolIdx = dbUrl.indexOf("://");
            String rest = dbUrl.substring(protocolIdx + 3);
            int atIdx = rest.lastIndexOf("@");
            
            String credentialsSection = rest.substring(0, atIdx);
            String hostSection = rest.substring(atIdx + 1);
            
            String username = credentialsSection;
            String password = "";
            if (credentialsSection.contains(":")) {
              int colonIdx = credentialsSection.indexOf(":");
              username = credentialsSection.substring(0, colonIdx);
              password = credentialsSection.substring(colonIdx + 1);
            }
            
            String jdbcUrl = "jdbc:postgresql://" + hostSection;
            if (!jdbcUrl.contains("sslmode=")) {
              jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
            }
            
            System.setProperty("DB_URL", jdbcUrl);
            System.setProperty("DB_USER", username);
            System.setProperty("DB_PASSWORD", password);
            
            System.out.println("⚙️ Parsed database credentials from URL successfully!");
          } catch (Exception e) {
            System.err.println("❌ Failed to parse DB_URL: " + e.getMessage());
          }
        } else {
          String jdbcUrl = "jdbc:" + dbUrl;
          if (!jdbcUrl.contains("sslmode=")) {
            jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
          }
          System.setProperty("DB_URL", jdbcUrl);
          System.out.println("⚙️ Auto-converted DB_URL to JDBC: " + jdbcUrl);
        }
      }
    }
    
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
      applyBrevoAliases();
      System.out.println("Loaded ShareFare environment from " + path.toAbsolutePath().normalize()
          + " (" + loaded + " values, Brevo API key exists=" + !isBlank(readConfig("app.brevo.apiKey"))
          + ", Brevo sender=" + safeVisible(readConfig("app.brevo.sender")) + ")");
    } catch (IOException ex) {
      throw new IllegalStateException("Could not load .env file: " + path.toAbsolutePath(), ex);
    }
  }

  private static void applyBrevoAliases() {
    Map<String, List<String>> aliases = Map.of(
        "app.brevo.apiKey", List.of("BREVO_API_KEY"),
        "app.brevo.sender", List.of("BREVO_SENDER"),
        "app.mail.supportEmail", List.of("MAIL_SUPPORT_EMAIL"),
        "app.frontendBaseUrl", List.of("FRONTEND_BASE_URL")
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
