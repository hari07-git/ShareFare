package com.sharefare.service;

import com.sharefare.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.Instant;

@Service
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final boolean enabled;
  private final String from;
  private final String supportEmail;

  public EmailService(JavaMailSender mailSender,
                      @Value("${app.mail.enabled:true}") boolean enabled,
                      @Value("${app.mail.from:ShareFare <no-reply@sharefare.com>}") String from,
                      @Value("${app.mail.supportEmail:sharefaree@gmail.com}") String supportEmail) {
    this.mailSender = mailSender;
    this.enabled = enabled;
    this.from = from;
    this.supportEmail = supportEmail;
  }

  public void sendBookingConfirmedToPassenger(String passengerEmail,
                                              String passengerName,
                                              long rideId,
                                              String origin,
                                              String destination,
                                              OffsetDateTime departureTime,
                                              int seatsBooked,
                                              String driverName,
                                              String driverEmail,
                                              String driverPhone) {
    String subject = "ShareFare booking confirmed (Ride #" + rideId + ")";
    String body = """
        Hi %s,

        Your booking is confirmed.

        Ride: #%d
        Route: %s → %s
        Departure: %s
        Seats: %d

        Driver contact:
        %s (%s)%s

        Need help? Contact support: %s
        """.formatted(
        safe(passengerName),
        rideId,
        safe(origin),
        safe(destination),
        fmt(departureTime),
        seatsBooked,
        safe(driverName),
        safe(driverEmail),
        driverPhone != null && !driverPhone.isBlank() ? (" • " + driverPhone) : "",
        supportEmail
    );
    sendRequired(passengerEmail, subject, body);
  }

  public void sendBookingRequestToPassenger(String passengerEmail,
                                            String passengerName,
                                            long rideId,
                                            String origin,
                                            String destination,
                                            OffsetDateTime departureTime,
                                            int seatsBooked,
                                            String driverName,
                                            String driverEmail,
                                            String driverPhone) {
    String subject = "Your ride request was sent";
    String body = """
        Hi %s,

        Your booking request was sent successfully and is waiting for driver approval.

        Route: %s → %s
        Departure: %s
        Seats requested: %d

        Ride Owner: %s
        
        We'll notify you as soon as the driver responds!
        
        Thanks,
        ShareFare Team
        Support: %s
        """.formatted(
        safe(passengerName),
        safe(origin),
        safe(destination),
        fmt(departureTime),
        seatsBooked,
        safe(driverName),
        supportEmail
    );
    sendRequired(passengerEmail, subject, body);
  }

  public void sendBookingRequestToDriver(String driverEmail,
                                         String driverName,
                                         long rideId,
                                         String origin,
                                         String destination,
                                         OffsetDateTime departureTime,
                                         int seatsBooked,
                                         String passengerName,
                                         String passengerEmail,
                                         String passengerPhone) {
    String subject = "New booking request for your ride";
    String body = """
        Hi %s,

        Great news! %s has requested to join your ride.

        Route: %s → %s
        Departure: %s
        Seats requested: %d

        Please open your ShareFare Driver Inbox to approve or reject this request.

        Thanks,
        ShareFare Team
        Support: %s
        """.formatted(
        safe(driverName),
        safe(passengerName),
        safe(origin),
        safe(destination),
        fmt(departureTime),
        seatsBooked,
        supportEmail
    );
    sendRequired(driverEmail, subject, body);
  }

  public void sendBookingApprovedToPassenger(String passengerEmail,
                                             String passengerName,
                                             long rideId,
                                             String origin,
                                             String destination,
                                             OffsetDateTime departureTime,
                                             int seatsBooked,
                                             String driverName,
                                             String driverEmail,
                                             String driverPhone) {
    String subject = "ShareFare booking approved (Ride #" + rideId + ")";
    String body = """
        Hi %s,

        Good news — your driver approved the ride request.

        Ride: #%d
        Route: %s → %s
        Departure: %s
        Seats: %d

        Driver contact:
        %s (%s)%s

        Please be at the pickup point on time.
        Support: %s
        """.formatted(
        safe(passengerName),
        rideId,
        safe(origin),
        safe(destination),
        fmt(departureTime),
        seatsBooked,
        safe(driverName),
        safe(driverEmail),
        driverPhone != null && !driverPhone.isBlank() ? (" • " + driverPhone) : "",
        supportEmail
    );
    sendRequired(passengerEmail, subject, body);
  }

  public void sendBookingRejectedToPassenger(String passengerEmail,
                                             String passengerName,
                                             long rideId,
                                             String origin,
                                             String destination,
                                             OffsetDateTime departureTime) {
    String subject = "ShareFare booking update (Ride #" + rideId + ")";
    String body = """
        Hi %s,

        Your booking request was rejected by the driver.

        Ride: #%d
        Route: %s → %s
        Departure: %s

        You can search nearby rides from Gachibowli, HITEC City, JNTU, or Secunderabad.
        Support: %s
        """.formatted(
        safe(passengerName),
        rideId,
        safe(origin),
        safe(destination),
        fmt(departureTime),
        supportEmail
    );
    sendRequired(passengerEmail, subject, body);
  }

  public void sendRideReminder(String to,
                               String name,
                               long rideId,
                               String origin,
                               String destination,
                               OffsetDateTime departureTime) {
    String subject = "ShareFare ride reminder (Ride #" + rideId + ")";
    String body = """
        Hi %s,

        Reminder: your ShareFare ride is coming up.

        Ride: #%d
        Route: %s → %s
        Departure: %s

        Please keep your phone reachable.
        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination), fmt(departureTime), supportEmail);
    sendRequired(to, subject, body);
  }

  public void sendRideCompleted(String to,
                                String name,
                                long rideId,
                                String origin,
                                String destination) {
    String subject = "ShareFare ride completed (Ride #" + rideId + ")";
    String body = """
        Hi %s,

        Your ride is marked completed.

        Ride: #%d
        Route: %s → %s

        Please rate your ride experience in ShareFare.
        Support: %s
        """.formatted(safe(name), rideId, safe(origin), safe(destination), supportEmail);
    sendRequired(to, subject, body);
  }

  public void sendNewBookingToDriver(String driverEmail,
                                     String driverName,
                                     long rideId,
                                     String origin,
                                     String destination,
                                     OffsetDateTime departureTime,
                                     int seatsBooked,
                                     String passengerName,
                                     String passengerEmail,
                                     String passengerPhone) {
    String subject = "New ShareFare booking (Ride #" + rideId + ")";
    String body = """
        Hi %s,

        You received a new booking.

        Ride: #%d
        Route: %s → %s
        Departure: %s
        Seats booked: %d

        Passenger contact:
        %s (%s)%s

        Support: %s
        """.formatted(
        safe(driverName),
        rideId,
        safe(origin),
        safe(destination),
        fmt(departureTime),
        seatsBooked,
        safe(passengerName),
        safe(passengerEmail),
        passengerPhone != null && !passengerPhone.isBlank() ? (" • " + passengerPhone) : "",
        supportEmail
    );
    sendRequired(driverEmail, subject, body);
  }

  public void sendEmailVerification(String to, String name, String verifyUrl) {
    String subject = "Verify your ShareFare email";
    String body = """
        Hi %s,

        Welcome to ShareFare. Please verify your email to activate secure login:

        %s

        This link expires in 24 hours.

        If you did not create a ShareFare account, you can ignore this email.
        Support: %s
        """.formatted(safe(name), safe(verifyUrl), supportEmail);
    sendRequired(to, subject, body);
  }

  public void sendEmailVerificationOtp(String to, String name, String otp) {
    String subject = "Your ShareFare verification OTP";
    String body = """
        Hi %s,

        Welcome to ShareFare. Use this OTP to verify your email:

        %s

        This OTP expires in 10 minutes.

        If you did not create a ShareFare account, you can ignore this email.
        Support: %s
        """.formatted(safe(name), safe(otp), supportEmail);
    send(to, subject, body);
  }

  public void sendPasswordReset(String to, String name, String resetUrl) {
    String subject = "Reset your ShareFare password";
    String body = """
        Hi %s,

        Use this secure link to reset your ShareFare password:

        %s

        This link expires in 30 minutes.

        If you did not request this, you can ignore this email.
        Support: %s
        """.formatted(safe(name), safe(resetUrl), supportEmail);
    send(to, subject, body);
  }

  private void send(String to, String subject, String body) {
    if (to == null || to.isBlank()) return;
    log.info("Email send requested to={} subject={} mailEnabled={}", to, subject, enabled);

    if (!enabled) {
      log.error("MAIL_DISABLED: app.mail.enabled=false. Email was NOT sent to={} subject={}. Set MAIL_ENABLED=true and restart the backend.", to, subject);
      throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Email sending is disabled (MAIL_ENABLED=false).");
    }

    try {
      SimpleMailMessage msg = new SimpleMailMessage();
      msg.setTo(to);
      if (supportEmail != null && !supportEmail.isBlank()) {
        msg.setCc(supportEmail);
      }
      msg.setFrom(fromAddress(from));
      msg.setSubject(subject);
      msg.setText(body);
      mailSender.send(msg);
      log.info("Email sent successfully to={} subject={}", to, subject);
    } catch (Exception ex) {
      String rootCause = getRootCauseMessage(ex);
      log.error("Failed to send email to={} subject={}. Root cause: {}", to, subject, rootCause, ex);
      throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "SMTP Error: " + rootCause);
    }
  }

  private void sendRequired(String to, String subject, String body) {
    send(to, subject, body);
  }

  private static String getRootCauseMessage(Throwable ex) {
    Throwable root = ex;
    while (root.getCause() != null && root.getCause() != root) {
      root = root.getCause();
    }
    return root.getMessage() != null ? root.getMessage() : root.getClass().getSimpleName();
  }

  private static String fmt(OffsetDateTime dt) {
    if (dt == null) return "";
    return dt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }

  private static String fromAddress(String rawFrom) {
    if (rawFrom == null || rawFrom.isBlank()) return null;
    int start = rawFrom.indexOf('<');
    int end = rawFrom.indexOf('>');
    if (start >= 0 && end > start) {
      return rawFrom.substring(start + 1, end).trim();
    }
    return rawFrom.trim();
  }
  public void sendAdminVerified(String email, String name) {
    String subject = "ShareFare: Your account is verified!";
    String body = """
        Hi %s,

        Great news! Your college ID has been manually reviewed and verified by an admin.

        You now have full access to ShareFare, including the ability to offer rides and earn community trust badges.

        Thanks for keeping our campus community safe.

        ShareFare Team
        Support: %s
        """.formatted(safe(name), supportEmail);
    sendRequired(email, subject, body);
  }

  public void sendVerificationRejected(String email, String name, String reason) {
    String subject = "ShareFare: Verification update";
    String body = """
        Hi %s,

        We reviewed your college ID verification request. Unfortunately, it was not approved.

        Reason: %s

        If you believe this is a mistake, please reply to this email to contact our trust and safety team.

        ShareFare Team
        Support: %s
        """.formatted(safe(name), safe(reason), supportEmail);
    sendRequired(email, subject, body);
  }

  public void sendReuploadRequired(String email, String name, String reason) {
    String subject = "ShareFare: Please re-upload your college ID";
    String body = """
        Hi %s,

        We need a bit more help to verify your account. The ID you provided couldn't be accepted.

        Note from admin: %s

        Please log in and upload a clear, unedited photo of your physical college ID card.

        ShareFare Team
        Support: %s
        """.formatted(safe(name), safe(reason), supportEmail);
    sendRequired(email, subject, body);
  }
  public void sendNewVerificationRequestToAdmin(String studentName, String studentEmail, Instant uploadTimestamp) {
    String subject = "New Student Verification Request";
    String body = """
        A new student has uploaded their college ID for manual verification.

        Student Name: %s
        Student Email: %s
        Upload Time: %s
        
        Please log into the ShareFare Admin Dashboard to review the ID:
        http://localhost:5173/admin/verification-queue
        """.formatted(safe(studentName), safe(studentEmail), fmt(OffsetDateTime.ofInstant(uploadTimestamp, java.time.ZoneId.systemDefault())));
    sendRequired(supportEmail, subject, body);
  }
}
