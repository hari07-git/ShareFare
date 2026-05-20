package com.sharefare.service;

import com.sharefare.repo.BookingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class RideReminderService {
  private final BookingRepository bookingRepository;
  private final NotificationService notificationService;
  private final EmailService emailService;
  private final boolean enabled;

  public RideReminderService(BookingRepository bookingRepository,
                             NotificationService notificationService,
                             EmailService emailService,
                             @Value("${app.reminders.enabled:true}") boolean enabled) {
    this.bookingRepository = bookingRepository;
    this.notificationService = notificationService;
    this.emailService = emailService;
    this.enabled = enabled;
  }

  @Scheduled(fixedDelayString = "${app.reminders.fixedDelayMs:900000}")
  @Transactional
  public void sendUpcomingRideReminders() {
    if (!enabled) return;

    OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
    OffsetDateTime until = now.plusHours(2);
    var bookings = bookingRepository.findConfirmedBookingsDueForReminder(now, until);

    for (var booking : bookings) {
      var ride = booking.getRide();
      notificationService.create(
          booking.getPassenger(),
          "RIDE",
          "Ride reminder",
          "Your ride #" + ride.getId() + " from " + ride.getOrigin() + " to " + ride.getDestination() + " starts soon."
      );
      notificationService.create(
          ride.getDriver(),
          "RIDE",
          "Ride reminder",
          "Your passenger pickup for ride #" + ride.getId() + " starts soon."
      );
      emailService.sendRideReminder(
          booking.getPassenger().getEmail(),
          booking.getPassenger().getFullName(),
          ride.getId(),
          ride.getOrigin(),
          ride.getDestination(),
          ride.getDepartureTime()
      );
      emailService.sendRideReminder(
          ride.getDriver().getEmail(),
          ride.getDriver().getFullName(),
          ride.getId(),
          ride.getOrigin(),
          ride.getDestination(),
          ride.getDepartureTime()
      );
      booking.setReminderSentAt(Instant.now());
      bookingRepository.save(booking);
    }
  }
}
