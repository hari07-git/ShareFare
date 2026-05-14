package com.sharefare.service;

import com.sharefare.dto.DriverInboxDtos.MyRideBookingsResponse;
import com.sharefare.dto.DriverInboxDtos.MyRidesResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.BookingStatus;
import com.sharefare.model.RideStatus;
import com.sharefare.repo.BookingByRideRepository;
import com.sharefare.repo.RideByDriverRepository;
import com.sharefare.repo.RideRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DriverInboxService {
  private final UserRepository userRepository;
  private final RideByDriverRepository rideByDriverRepository;
  private final BookingByRideRepository bookingByRideRepository;
  private final RideRepository rideRepository;
  private final NotificationService notificationService;

  public DriverInboxService(UserRepository userRepository,
                            RideByDriverRepository rideByDriverRepository,
                            BookingByRideRepository bookingByRideRepository,
                            RideRepository rideRepository,
                            NotificationService notificationService) {
    this.userRepository = userRepository;
    this.rideByDriverRepository = rideByDriverRepository;
    this.bookingByRideRepository = bookingByRideRepository;
    this.rideRepository = rideRepository;
    this.notificationService = notificationService;
  }

  @Transactional(readOnly = true)
  public List<MyRidesResponse> listMyRides(String driverEmail) {
    var driver = userRepository.findByEmailIgnoreCase(driverEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    return rideByDriverRepository.findByDriverOrderByDepartureTimeDesc(driver).stream()
        .map(r -> new MyRidesResponse(
            r.getId(),
            r.getOrigin(),
            r.getDestination(),
            r.getDepartureTime(),
            r.getSeatsTotal(),
            r.getSeatsAvailable(),
            r.getPricePerSeat(),
            r.getStatus()
        ))
        .toList();
  }

  @Transactional(readOnly = true)
  public List<MyRideBookingsResponse> listRideBookings(Long rideId, String driverEmail) {
    var driver = userRepository.findByEmailIgnoreCase(driverEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var ride = rideRepository.findById(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    if (!ride.getDriver().getId().equals(driver.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not your ride");
    }
    return bookingByRideRepository.findRideBookings(rideId).stream()
        .map(b -> new MyRideBookingsResponse(
            b.getId(),
            b.getRide().getId(),
            b.getPassenger().getEmail(),
            b.getPassenger().getFullName(),
            b.getSeatsBooked(),
            b.getStatus()
        )).toList();
  }

  @Transactional
  public void cancelRide(Long rideId, String driverEmail) {
    var driver = userRepository.findByEmailIgnoreCase(driverEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var ride = rideRepository.findById(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    boolean isOwner = ride.getDriver().getId().equals(driver.getId());
    if (!isOwner) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Not your ride");
    }
    if (ride.getStatus() == RideStatus.CANCELLED) return;
    ride.setStatus(RideStatus.CANCELLED);
    rideRepository.save(ride);

    var confirmedBookings = bookingByRideRepository.findRideBookingsByStatus(rideId, BookingStatus.CONFIRMED);
    for (var b : confirmedBookings) {
      notificationService.create(
          b.getPassenger(),
          "RIDE",
          "Ride cancelled",
          "Ride #" + ride.getId() + " (" + ride.getOrigin() + " → " + ride.getDestination() + ") was cancelled by the driver."
      );
    }
  }
}
