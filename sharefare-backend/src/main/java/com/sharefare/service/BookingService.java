package com.sharefare.service;

import com.sharefare.dto.BookingDtos.BookRideRequest;
import com.sharefare.dto.BookingDtos.BookingResponse;
import com.sharefare.dto.BookingDtos.MyBookingsResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.Booking;
import com.sharefare.model.BookingStatus;
import com.sharefare.model.RideStatus;
import com.sharefare.repo.BookingRepository;
import com.sharefare.repo.RideRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BookingService {
  private final RideRepository rideRepository;
  private final BookingRepository bookingRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final EmailService emailService;

  public BookingService(RideRepository rideRepository,
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        NotificationService notificationService,
                        EmailService emailService) {
    this.rideRepository = rideRepository;
    this.bookingRepository = bookingRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
    this.emailService = emailService;
  }

  @Transactional
  public BookingResponse bookRide(Long rideId, BookRideRequest request, String passengerEmail) {
    var passenger = userRepository.findByEmailIgnoreCase(passengerEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

    var ride = rideRepository.findForUpdate(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));

    if (ride.getStatus() != RideStatus.OPEN) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Ride not open for booking");
    }
    if (ride.getSeatsAvailable() < request.seats()) {
      throw new ApiException(HttpStatus.CONFLICT, "Not enough seats available");
    }
    if (ride.getDriver().getId().equals(passenger.getId())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Driver cannot book own ride");
    }

    Booking booking = new Booking();
    booking.setRide(ride);
    booking.setPassenger(passenger);
    booking.setSeatsBooked(request.seats());
    booking.setStatus(BookingStatus.CONFIRMED);
    bookingRepository.save(booking);

    ride.setSeatsAvailable(ride.getSeatsAvailable() - request.seats());
    if (ride.getSeatsAvailable() == 0) {
      ride.setStatus(RideStatus.FULL);
    }
    rideRepository.save(ride);

    notificationService.create(
        passenger,
        "BOOKING",
        "Booking confirmed",
        "You booked " + booking.getSeatsBooked() + " seat(s) for ride #" + ride.getId() + " (" + ride.getOrigin() + " → " + ride.getDestination() + ")."
    );
    notificationService.create(
        ride.getDriver(),
        "BOOKING",
        "New booking received",
        passenger.getFullName() + " booked " + booking.getSeatsBooked() + " seat(s) for your ride #" + ride.getId() + "."
    );

    emailService.sendBookingConfirmedToPassenger(
        passenger.getEmail(),
        passenger.getFullName(),
        ride.getId(),
        ride.getOrigin(),
        ride.getDestination(),
        ride.getDepartureTime(),
        booking.getSeatsBooked(),
        ride.getDriver().getFullName(),
        ride.getDriver().getEmail(),
        ride.getDriver().getPhone()
    );
    emailService.sendNewBookingToDriver(
        ride.getDriver().getEmail(),
        ride.getDriver().getFullName(),
        ride.getId(),
        ride.getOrigin(),
        ride.getDestination(),
        ride.getDepartureTime(),
        booking.getSeatsBooked(),
        passenger.getFullName(),
        passenger.getEmail(),
        passenger.getPhone()
    );

    return new BookingResponse(booking.getId(), ride.getId(), booking.getSeatsBooked(), booking.getStatus(),
        booking.getCreatedAt());
  }

  @Transactional(readOnly = true)
  public List<MyBookingsResponse> listMyBookings(String passengerEmail) {
    var passenger = userRepository.findByEmailIgnoreCase(passengerEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    return bookingRepository.findByPassengerOrderByCreatedAtDesc(passenger).stream().map(b ->
        new MyBookingsResponse(
            b.getId(),
            b.getRide().getId(),
            b.getRide().getOrigin(),
            b.getRide().getDestination(),
            b.getRide().getDepartureTime(),
            b.getRide().getDriver().getFullName(),
            b.getRide().getDriver().getEmail(),
            b.getRide().getDriver().getPhone(),
            b.getSeatsBooked(),
            b.getStatus()
        )
    ).toList();
  }

  @Transactional
  public void cancelBooking(Long bookingId, String passengerEmail) {
    var passenger = userRepository.findByEmailIgnoreCase(passengerEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var booking = bookingRepository.findByIdAndPassenger(bookingId, passenger)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
    if (booking.getStatus() == BookingStatus.CANCELLED) {
      return;
    }
    var ride = rideRepository.findForUpdate(booking.getRide().getId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    booking.setStatus(BookingStatus.CANCELLED);
    bookingRepository.save(booking);

    ride.setSeatsAvailable(ride.getSeatsAvailable() + booking.getSeatsBooked());
    if (ride.getStatus() == RideStatus.FULL) {
      ride.setStatus(RideStatus.OPEN);
    }
    rideRepository.save(ride);

    notificationService.create(
        passenger,
        "BOOKING",
        "Booking cancelled",
        "You cancelled booking #" + booking.getId() + " for ride #" + ride.getId() + "."
    );
    notificationService.create(
        ride.getDriver(),
        "BOOKING",
        "Booking cancelled",
        passenger.getFullName() + " cancelled booking #" + booking.getId() + " for your ride #" + ride.getId() + "."
    );
  }
}
