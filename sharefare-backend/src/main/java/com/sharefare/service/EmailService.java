package com.sharefare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Email service backed by Brevo Transactional Email HTTP API.
 * Works on Render free tier (no SMTP port restrictions).
 * API docs: https://developers.brevo.com/reference/sendtransacemail
 */
@Service
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);
  private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

  private final String apiKey;
  private final boolean enabled;
  private final String fromEmail;
  private final String fromName;
  private final String supportEmail;
  private final RestTemplate rest = new RestTemplate();

  public EmailService(
      @Value("${app.brevo.apiKey:}") String apiKey,
      @Value("${app.mail.enabled:true}") boolean enabled,
      @Value("${app.mail.fromEmail:sharefaree@gmail.com}") String fromEmail,
      @Value("${app.mail.fromName:ShareFare}") String fromName,
      @Value("${app.mail.supportEmail:sharefaree@gmail.com}") String supportEmail) {
    this.apiKey = apiKey;
    this.enabled = enabled;
    this.fromEmail = fromEmail;
    this.fromName = fromName;
    this.supportEmail = supportEmail;
  }

  // ── Public send methods ──────────────────────────────────────────────────

  public void sendEmailVerificationOtp(String to, String name, String otp) {
    send(to, "Your ShareFare verification OTP", """
        Hi %s,

        Welcome to ShareFare! Use this OTP to verify your email:

        🔐 %s

        This OTP expires in 10 minutes.

        If you didn't create a ShareFare account, ignore this email.
        Support: %s
        """.formatted(safe(name), safe(otp), supportEmail));
  }

  public void sendEmailVerification(String to, String name, String verifyUrl) {
    send(to, "Verify your ShareFare email", """
        Hi %s,

        Welcome to ShareFare. Please verify your email to activate your account:

        %s

        This link expires in 24 hours.

        Support: %s
        """.formatted(safe(name), safe(verifyUrl), supportEmail));
  }

  public void sendPasswordReset(String to, String name, String resetUrl) {
    send(to, "Reset your ShareFare password", """
        Hi %s,

        Use this link to reset your ShareFare password:

        %s

        This link expires in 30 minutes.

        If you didn't request this, ignore this email.
        Support: %s
        """.formatted(safe(name), safe(resetUrl), supportEmail));
  }

  public void sendBookingConfirmedToPassenger(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime,
      int seats, String driverName, String driverEmail, String driverPhone) {
    send(to, "ShareFare booking confirmed (Ride #" + rideId + ")", """
        Hi %s,

        ✅ Your booking is confirmed!

        Ride: #%d
        Route: %s → %s
        Departure: %s
        Seats: %d

        Driver: %s (%s)%s

        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination),
        fmt(departureTime), seats, safe(driverName), safe(driverEmail),
        driverPhone != null && !driverPhone.isBlank() ? " • " + driverPhone : "",
        supportEmail));
  }

  public void sendBookingRequestToPassenger(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime,
      int seats, String driverName, String driverEmail, String driverPhone) {
    send(to, "Your ride request was sent", """
        Hi %s,

        Your booking request was sent — waiting for driver approval.

        Route: %s → %s
        Departure: %s
        Seats requested: %d
        Driver: %s

        We'll notify you once the driver responds!

        Support: %s
        """.formatted(safe(name), safe(origin), safe(destination),
        fmt(departureTime), seats, safe(driverName), supportEmail));
  }

  public void sendBookingRequestToDriver(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime,
      int seats, String passengerName, String passengerEmail, String passengerPhone) {
    send(to, "New booking request for your ride", """
        Hi %s,

        🎉 %s wants to join your ride!

        Route: %s → %s
        Departure: %s
        Seats requested: %d

        Open your ShareFare Driver Inbox to approve or reject.

        Support: %s
        """.formatted(safe(name), safe(passengerName), safe(origin), safe(destination),
        fmt(departureTime), seats, supportEmail));
  }

  public void sendBookingApprovedToPassenger(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime,
      int seats, String driverName, String driverEmail, String driverPhone) {
    send(to, "ShareFare booking approved (Ride #" + rideId + ")", """
        Hi %s,

        ✅ Your driver approved the booking!

        Ride: #%d
        Route: %s → %s
        Departure: %s
        Seats: %d

        Driver: %s (%s)%s

        Please be at the pickup point on time.
        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination),
        fmt(departureTime), seats, safe(driverName), safe(driverEmail),
        driverPhone != null && !driverPhone.isBlank() ? " • " + driverPhone : "",
        supportEmail));
  }

  public void sendBookingRejectedToPassenger(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime) {
    send(to, "ShareFare booking update (Ride #" + rideId + ")", """
        Hi %s,

        Your booking request for Ride #%d was rejected by the driver.

        Route: %s → %s
        Departure: %s

        Search for other rides on ShareFare.
        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination),
        fmt(departureTime), supportEmail));
  }

  public void sendNewBookingToDriver(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime,
      int seats, String passengerName, String passengerEmail, String passengerPhone) {
    send(to, "New ShareFare booking (Ride #" + rideId + ")", """
        Hi %s,

        You received a new booking.

        Ride: #%d
        Route: %s → %s
        Departure: %s
        Seats booked: %d

        Passenger: %s (%s)%s

        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination),
        fmt(departureTime), seats, safe(passengerName), safe(passengerEmail),
        passengerPhone != null && !passengerPhone.isBlank() ? " • " + passengerPhone : "",
        supportEmail));
  }

  public void sendRideReminder(String to, String name, long rideId,
      String origin, String destination, OffsetDateTime departureTime) {
    send(to, "ShareFare ride reminder (Ride #" + rideId + ")", """
        Hi %s,

        ⏰ Your ShareFare ride is coming up!

        Ride: #%d
        Route: %s → %s
        Departure: %s

        Keep your phone reachable.
        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination),
        fmt(departureTime), supportEmail));
  }

  public void sendRideCompleted(String to, String name, long rideId,
      String origin, String destination) {
    send(to, "ShareFare ride completed (Ride #" + rideId + ")", """
        Hi %s,

        Your ride #%d is marked completed.

        Route: %s → %s

        Please rate your experience on ShareFare!
        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination), supportEmail));
  }

  public void sendAdminVerified(String to, String name) {
    send(to, "ShareFare: Your account is verified! 🎉", """
        Hi %s,

        🎉 Great news! Your college ID has been verified by the ShareFare admin team.

        You now have full access — including offering rides and earning trust badges.

        Welcome to the verified campus community!

        ShareFare Team
        Support: %s
        """.formatted(safe(name), supportEmail));
  }

  public void sendVerificationRejected(String to, String name, String reason) {
    send(to, "ShareFare: Verification update", """
        Hi %s,

        We reviewed your college ID and unfortunately couldn't approve it.

        Reason: %s

        Please re-upload a clearer photo from your Profile → Settings → Verify Identity.

        ShareFare Team
        Support: %s
        """.formatted(safe(name), safe(reason), supportEmail));
  }

  public void sendReuploadRequired(String to, String name, String reason) {
    send(to, "ShareFare: Please re-upload your college ID", """
        Hi %s,

        We need a clearer photo of your college ID.

        Note from admin: %s

        Please log in and upload a clear, unedited photo of your physical ID card.

        ShareFare Team
        Support: %s
        """.formatted(safe(name), safe(reason), supportEmail));
  }

  public void sendNewVerificationRequestToAdmin(String studentName, String studentEmail,
      Instant uploadTimestamp) {
    send(supportEmail, "New Student Verification Request", """
        A student has uploaded their college ID for verification.

        Student: %s
        Email: %s
        Uploaded: %s

        Review at: https://sharefare-frontend.vercel.app/admin/verification-queue
        """.formatted(safe(studentName), safe(studentEmail),
        fmt(OffsetDateTime.ofInstant(uploadTimestamp, java.time.ZoneId.systemDefault()))));
  }

  // ── Core HTTP send via Brevo API ─────────────────────────────────────────

  private void send(String to, String subject, String textBody) {
    if (to == null || to.isBlank()) return;

    if (!enabled) {
      log.warn("Mail disabled — skipping email to={} subject={}", to, subject);
      return;  // silently skip, don't throw
    }

    if (apiKey == null || apiKey.isBlank()) {
      log.error("BREVO_API_KEY not configured — cannot send email to={}", to);
      return;
    }

    try {
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.set("api-key", apiKey);

      Map<String, Object> body = Map.of(
          "sender", Map.of("name", fromName, "email", fromEmail),
          "to", List.of(Map.of("email", to)),
          "subject", subject,
          "textContent", textBody
      );

      HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
      ResponseEntity<String> response = rest.postForEntity(BREVO_API_URL, request, String.class);

      if (response.getStatusCode().is2xxSuccessful()) {
        log.info("✅ Email sent via Brevo to={} subject={}", to, subject);
      } else {
        log.error("Brevo rejected email to={} status={} body={}", to,
            response.getStatusCode(), response.getBody());
      }
    } catch (Exception ex) {
      log.error("Failed to send email via Brevo to={} subject={}: {}", to, subject, ex.getMessage());
      // Don't throw — email failure should NOT block the main operation
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private static String fmt(OffsetDateTime dt) {
    if (dt == null) return "";
    return dt.format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a z"));
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }
}
