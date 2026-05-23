package com.sharefare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class MailDiagnosticsRunner implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(MailDiagnosticsRunner.class);

  private final Environment environment;

  public MailDiagnosticsRunner(Environment environment) {
    this.environment = environment;
  }

  @Override
  public void run(ApplicationArguments args) {
    String apiKey = environment.getProperty("app.brevo.apiKey", "");
    String sender = environment.getProperty("app.brevo.sender", "");
    String supportEmail = environment.getProperty("app.mail.supportEmail", "");

    log.info("Brevo transactional email enabled=true");
    log.info("BREVO_API_KEY exists={}", apiKey != null && !apiKey.isBlank());
    log.info("BREVO_SENDER={}", blankToUnset(sender));
    log.info("Support email={}", blankToUnset(supportEmail));

    if (apiKey == null || apiKey.isBlank()) {
      log.warn("BREVO_API_KEY is not configured. Email-triggering API calls will return 503 instead of fake success.");
    }
  }

  private static String blankToUnset(String value) {
    return value == null || value.isBlank() ? "<unset>" : value;
  }
}
