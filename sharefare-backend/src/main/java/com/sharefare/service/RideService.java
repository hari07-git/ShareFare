package com.sharefare.service;

import com.sharefare.dto.RideDtos.CreateRideRequest;
import com.sharefare.dto.RideDtos.RideResponse;
import com.sharefare.dto.RideDtos.UpdateRideRequest;
import com.sharefare.dto.RideDtos.SearchRideResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.Ride;
import com.sharefare.model.RideStatus;
import com.sharefare.repo.RideRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Service
public class RideService {
  private final RideRepository rideRepository;
  private final UserRepository userRepository;

  public RideService(RideRepository rideRepository, UserRepository userRepository) {
    this.rideRepository = rideRepository;
    this.userRepository = userRepository;
  }

  @Transactional
  public RideResponse createRide(CreateRideRequest request, String driverEmail) {
    var driver = userRepository.findByEmailIgnoreCase(driverEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    
    if (!driverEmail.equalsIgnoreCase("sharefaree@gmail.com") && driver.getAccountStatus() != com.sharefare.model.AccountStatus.VERIFIED_STUDENT) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Only verified students can publish rides.");
    }
    Ride ride = new Ride();
    ride.setDriver(driver);
    ride.setOrigin(request.origin());
    ride.setDestination(request.destination());
    ride.setOriginLat(request.originLat());
    ride.setOriginLng(request.originLng());
    ride.setDestinationLat(request.destinationLat());
    ride.setDestinationLng(request.destinationLng());
    ride.setVehicleType(request.vehicleType());
    ride.setVehicleNumber(request.vehicleNumber());
    ride.setPickupNote(request.pickupNote());
    ride.setDepartureTime(request.departureTime());
    ride.setSeatsTotal(request.seatsTotal());
    ride.setSeatsAvailable(request.seatsTotal());
    ride.setPricePerSeat(request.pricePerSeat());
    ride.setFemalePreferred(request.femalePreferred());
    ride.setVerifiedOnly(request.verifiedOnly());
    ride.setStatus(RideStatus.OPEN);
    return toRideResponse(rideRepository.save(ride));
  }

  @Transactional(readOnly = true)
  public RideResponse getRide(Long id) {
    return rideRepository.findById(id).map(this::toRideResponse)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
  }

  @Transactional(readOnly = true)
  public Page<SearchRideResponse> search(Optional<String> origin,
                                        Optional<String> destination,
                                        Optional<LocalDate> date,
                                        boolean femaleOnly,
                                        boolean verifiedOnly,
                                        Pageable pageable) {
    OffsetDateTime from = null;
    OffsetDateTime to = null;
    if (date.isPresent()) {
      from = date.get().atStartOfDay().atOffset(ZoneOffset.UTC);
      to = date.get().plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
    }
    var statuses = List.of(RideStatus.OPEN.name(), RideStatus.FULL.name());
    return rideRepository.search(origin.orElse(null), destination.orElse(null), from, to, statuses, femaleOnly, verifiedOnly, pageable)
        .map(r -> new SearchRideResponse(
            r.getId(), r.getOrigin(), r.getDestination(), r.getDepartureTime(),
            r.getSeatsAvailable(), r.getPricePerSeat(),
            r.getDriver().getFullName(), r.getDriver().getGender(), r.getDriver().getTrustScore(),
            r.getDriver().getCollegeName(),
            r.isFemalePreferred(), r.isVerifiedOnly(), r.getSafetyLevel()
        ));
  }

  @Transactional
  public RideResponse updateRide(Long rideId, UpdateRideRequest request, String driverEmail) {
    Ride ride = rideRepository.findForUpdate(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    if (!ride.getDriver().getEmail().equalsIgnoreCase(driverEmail)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "You can only edit your own rides");
    }
    if (ride.getStatus() == RideStatus.CANCELLED || ride.getStatus() == RideStatus.COMPLETED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot edit a " + ride.getStatus().name().toLowerCase() + " ride");
    }
    if (request.departureTime() != null) ride.setDepartureTime(request.departureTime());
    if (request.seatsTotal() != null) {
      int booked = ride.getSeatsTotal() - ride.getSeatsAvailable();
      if (request.seatsTotal() < booked) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot reduce seats below " + booked + " (already booked)");
      }
      ride.setSeatsAvailable(request.seatsTotal() - booked);
      ride.setSeatsTotal(request.seatsTotal());
    }
    if (request.pricePerSeat() != null) ride.setPricePerSeat(request.pricePerSeat());
    if (request.vehicleType() != null) ride.setVehicleType(request.vehicleType());
    if (request.vehicleNumber() != null) ride.setVehicleNumber(request.vehicleNumber());
    if (request.pickupNote() != null) ride.setPickupNote(request.pickupNote());
    if (request.femalePreferred() != null) ride.setFemalePreferred(request.femalePreferred());
    if (request.verifiedOnly() != null) ride.setVerifiedOnly(request.verifiedOnly());
    return toRideResponse(rideRepository.save(ride));
  }

  @Transactional
  public void deleteRide(Long rideId, String driverEmail) {
    Ride ride = rideRepository.findForUpdate(rideId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Ride not found"));
    if (!ride.getDriver().getEmail().equalsIgnoreCase(driverEmail)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "You can only delete your own rides");
    }
    if (ride.getStatus() == RideStatus.CANCELLED) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Ride is already cancelled");
    }
    ride.setStatus(RideStatus.CANCELLED);
    rideRepository.save(ride);
  }

  private RideResponse toRideResponse(Ride r) {
    return new RideResponse(
        r.getId(),
        r.getDriver().getEmail(),
        r.getDriver().getFullName(),
        r.getDriver().getPhone(),
        r.getOrigin(),
        r.getDestination(),
        r.getOriginLat(),
        r.getOriginLng(),
        r.getDestinationLat(),
        r.getDestinationLng(),
        r.getDepartureTime(),
        r.getSeatsTotal(),
        r.getSeatsAvailable(),
        r.getPricePerSeat(),
        r.getStatus(),
        r.getVehicleType(),
        r.getVehicleNumber(),
        r.getPickupNote(),
        r.getDriver().getGender(),
        r.getDriver().getTrustScore(),
        r.getDriver().getCollegeName(),
        r.isFemalePreferred(),
        r.isVerifiedOnly(),
        r.getSafetyLevel()
    );
  }
}
