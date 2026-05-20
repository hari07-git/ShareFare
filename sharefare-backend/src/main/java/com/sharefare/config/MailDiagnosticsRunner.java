package com.sharefare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
public class MailDiagnosticsRunner implements ApplicationRunner {
  private static final Logger log = LoggerFactory.getLogger(MailDiagnosticsRunner.class);

  private final Environment environment;
  private final ObjectProvider<JavaMailSender> mailSenderProvider;

  public MailDiagnosticsRunner(Environment environment, ObjectProvider<JavaMailSender> mailSenderProvider) {
    this.environment = environment;
    this.mailSenderProvider = mailSenderProvider;
  }

  @Override
  public void run(ApplicationArguments args) {
    String mailEnabled = environment.getProperty("app.mail.enabled", "false");
    String smtpHost = environment.getProperty("spring.mail.host", "");
    String smtpUsername = environment.getProperty("spring.mail.username", "");
    String smtpPassword = environment.getProperty("spring.mail.password", "");
    String mailFrom = environment.getProperty("app.mail.from", "ShareFare <no-reply@sharefare.com>");
    boolean mailSenderLoaded = mailSenderProvider.getIfAvailable() != null;

    log.info("MAIL_ENABLED={}", mailEnabled);
    log.info("SMTP host={}", blankToUnset(smtpHost));
    log.info("SMTP username={}", blankToUnset(smtpUsername));
    log.info("SMTP password exists={}", smtpPassword != null && !smtpPassword.isBlank());
    log.info("Sender email={}", mailFrom);
    log.info("JavaMailSender loaded={}", mailSenderLoaded);

    if (Boolean.parseBoolean(mailEnabled) && (smtpHost == null || smtpHost.isBlank() || smtpUsername == null || smtpUsername.isBlank() || smtpPassword == null || smtpPassword.isBlank())) {
      log.warn("MAIL_ENABLED=true but SMTP configuration is incomplete. OTP/reset emails will fail until MAIL_HOST, MAIL_USERNAME, and MAIL_PASSWORD are set.");
    }
  }

  private static String blankToUnset(String value) {
    return value == null || value.isBlank() ? "<unset>" : value;
  }
}
