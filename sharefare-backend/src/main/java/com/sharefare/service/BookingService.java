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

    if (!passengerEmail.equalsIgnoreCase("sharefaree@gmail.com") && (passenger.getAccountStatus() == com.sharefare.model.AccountStatus.PENDING_VERIFICATION ||
        passenger.getAccountStatus() == com.sharefare.model.AccountStatus.REJECTED ||
        passenger.getAccountStatus() == com.sharefare.model.AccountStatus.SUSPENDED)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Your student account is awaiting verification.");
    }

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
    booking.setStatus(BookingStatus.REQUESTED);
    bookingRepository.save(booking);

    notificationService.create(
        passenger,
        "BOOKING",
        "Booking request sent",
        "Your booking request was sent successfully."
    );
    notificationService.create(
        ride.getDriver(),
        "BOOKING",
        "New booking request",
        passenger.getFullName() + " requested to join your ride from " + ride.getOrigin() + " to " + ride.getDestination() + "."
    );

    emailService.sendBookingRequestToPassenger(
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
    emailService.sendBookingRequestToDriver(
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

  @Transactional
  public BookingResponse approveBooking(Long rideId, Long bookingId, String driverEmail) {
    var booking = getDriverBookingForUpdate(rideId, bookingId, driverEmail);
    if (booking.getStatus() != BookingStatus.REQUESTED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only requested bookings can be approved");
    }

    var ride = rideRepository.findForUpdate(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    if (ride.getStatus() != RideStatus.OPEN && ride.getStatus() != RideStatus.FULL) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Ride is not open for approvals");
    }
    if (ride.getSeatsAvailable() < booking.getSeatsBooked()) {
      throw new ApiException(HttpStatus.CONFLICT, "Not enough seats available");
    }

    booking.setStatus(BookingStatus.DRIVER_APPROVED);
    bookingRepository.save(booking);

    ride.setSeatsAvailable(ride.getSeatsAvailable() - booking.getSeatsBooked());
    ride.setStatus(ride.getSeatsAvailable() == 0 ? RideStatus.FULL : RideStatus.OPEN);
    rideRepository.save(ride);

    notificationService.create(
        booking.getPassenger(),
        "BOOKING",
        "Booking approved",
        "Your ride request #" + booking.getId() + " was approved. Driver contact is now available in My Bookings."
    );
    emailService.sendBookingApprovedToPassenger(
        booking.getPassenger().getEmail(),
        booking.getPassenger().getFullName(),
        ride.getId(),
        ride.getOrigin(),
        ride.getDestination(),
        ride.getDepartureTime(),
        booking.getSeatsBooked(),
        ride.getDriver().getFullName(),
        ride.getDriver().getEmail(),
        ride.getDriver().getPhone()
    );

    return toResponse(booking);
  }

  @Transactional
  public BookingResponse rejectBooking(Long rideId, Long bookingId, String driverEmail) {
    var booking = getDriverBookingForUpdate(rideId, bookingId, driverEmail);
    if (booking.getStatus() != BookingStatus.REQUESTED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only requested bookings can be rejected");
    }
    booking.setStatus(BookingStatus.REJECTED);
    bookingRepository.save(booking);

    var ride = booking.getRide();
    notificationService.create(
        booking.getPassenger(),
        "BOOKING",
        "Booking rejected",
        "Your request for ride #" + ride.getId() + " (" + ride.getOrigin() + " → " + ride.getDestination() + ") was rejected by the driver."
    );
    emailService.sendBookingRejectedToPassenger(
        booking.getPassenger().getEmail(),
        booking.getPassenger().getFullName(),
        ride.getId(),
        ride.getOrigin(),
        ride.getDestination(),
        ride.getDepartureTime()
    );

    return toResponse(booking);
  }

  @Transactional
  public BookingResponse startBooking(Long rideId, Long bookingId, String driverEmail) {
    var booking = getDriverBookingForUpdate(rideId, bookingId, driverEmail);
    if (booking.getStatus() != BookingStatus.CONFIRMED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only confirmed bookings can be started");
    }
    booking.setStatus(BookingStatus.ONGOING);
    bookingRepository.save(booking);
    notificationService.create(
        booking.getPassenger(),
        "RIDE",
        "Ride started",
        "Your ShareFare ride #" + rideId + " is now ongoing."
    );
    return toResponse(booking);
  }

  @Transactional
  public BookingResponse confirmBooking(Long rideId, Long bookingId, String driverEmail) {
    var booking = getDriverBookingForUpdate(rideId, bookingId, driverEmail);
    if (booking.getStatus() != BookingStatus.DRIVER_APPROVED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only approved bookings can be confirmed");
    }
    booking.setStatus(BookingStatus.CONFIRMED);
    bookingRepository.save(booking);
    notificationService.create(
        booking.getPassenger(),
        "BOOKING",
        "Booking confirmed",
        "Your ride #" + rideId + " is confirmed. Please reach the pickup point on time."
    );
    return toResponse(booking);
  }

  @Transactional
  public BookingResponse completeBooking(Long rideId, Long bookingId, String driverEmail) {
    var booking = getDriverBookingForUpdate(rideId, bookingId, driverEmail);
    if (booking.getStatus() != BookingStatus.ONGOING) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Only ongoing bookings can be completed");
    }
    booking.setStatus(BookingStatus.COMPLETED);
    bookingRepository.save(booking);
    var ride = booking.getRide();
    notificationService.create(
        booking.getPassenger(),
        "RIDE",
        "Ride completed",
        "Ride #" + ride.getId() + " is completed. You can now rate your driver."
    );
    emailService.sendRideCompleted(
        booking.getPassenger().getEmail(),
        booking.getPassenger().getFullName(),
        ride.getId(),
        ride.getOrigin(),
        ride.getDestination()
    );
    return toResponse(booking);
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
    if (booking.getStatus() == BookingStatus.REJECTED || booking.getStatus() == BookingStatus.COMPLETED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Booking cannot be cancelled");
    }
    var ride = rideRepository.findForUpdate(booking.getRide().getId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    BookingStatus previousStatus = booking.getStatus();
    booking.setStatus(BookingStatus.CANCELLED);
    bookingRepository.save(booking);

    if (usesSeat(previousStatus)) {
      ride.setSeatsAvailable(Math.min(ride.getSeatsTotal(), ride.getSeatsAvailable() + booking.getSeatsBooked()));
      if (ride.getStatus() == RideStatus.FULL) {
        ride.setStatus(RideStatus.OPEN);
      }
      rideRepository.save(ride);
    }

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

  private Booking getDriverBookingForUpdate(Long rideId, Long bookingId, String driverEmail) {
    var driver = userRepository.findByEmailIgnoreCase(driverEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
    if (!booking.getRide().getId().equals(rideId)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Booking does not belong to this ride");
    }
    if (!booking.getRide().getDriver().getId().equals(driver.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not your ride");
    }
    return booking;
  }

  private static boolean usesSeat(BookingStatus status) {
    return status == BookingStatus.DRIVER_APPROVED
        || status == BookingStatus.CONFIRMED
        || status == BookingStatus.ONGOING;
  }

  private static BookingResponse toResponse(Booking booking) {
    return new BookingResponse(
        booking.getId(),
        booking.getRide().getId(),
        booking.getSeatsBooked(),
        booking.getStatus(),
        booking.getCreatedAt()
    );
  }
}
