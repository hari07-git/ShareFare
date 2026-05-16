package com.sharefare.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {
  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final boolean enabled;
  private final String from;
  private final String supportEmail;

  public EmailService(JavaMailSender mailSender,
                      @Value("${app.mail.enabled:false}") boolean enabled,
                      @Value("${app.mail.from:ShareFare <no-reply@sharefare.com>}") String from,
                      @Value("${app.mail.supportEmail:biyyanihari7@gmail.com}") String supportEmail) {
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
    send(passengerEmail, subject, body);
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
    send(driverEmail, subject, body);
  }

  private void send(String to, String subject, String body) {
    if (to == null || to.isBlank()) return;

    if (!enabled) {
      log.info("MAIL_DISABLED to={} subject={} body={}", to, subject, body.replace("\n", "\\n"));
      return;
    }

    try {
      SimpleMailMessage msg = new SimpleMailMessage();
      msg.setTo(to);
      if (supportEmail != null && !supportEmail.isBlank()) {
        msg.setCc(supportEmail);
      }
      msg.setFrom(from);
      msg.setSubject(subject);
      msg.setText(body);
      mailSender.send(msg);
    } catch (Exception ex) {
      log.warn("Failed to send email to={} subject={}", to, subject, ex);
    }
  }

  private static String fmt(OffsetDateTime dt) {
    if (dt == null) return "";
    return dt.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
  }

  private static String safe(String s) {
    return s == null ? "" : s;
  }
}

