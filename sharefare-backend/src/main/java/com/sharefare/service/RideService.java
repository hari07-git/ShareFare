package com.sharefare.service;

import com.sharefare.dto.RideDtos.CreateRideRequest;
import com.sharefare.dto.RideDtos.RideResponse;
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
import java.util.EnumSet;
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
    
    if (driver.getAccountStatus() != com.sharefare.model.AccountStatus.VERIFIED_STUDENT) {
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
    var statuses = EnumSet.of(RideStatus.OPEN, RideStatus.FULL);
    return rideRepository.search(origin.orElse(null), destination.orElse(null), from, to, statuses, femaleOnly, verifiedOnly, pageable)
        .map(r -> new SearchRideResponse(
            r.getId(), r.getOrigin(), r.getDestination(), r.getDepartureTime(),
            r.getSeatsAvailable(), r.getPricePerSeat(),
            r.getDriver().getFullName(), r.getDriver().getGender(), r.getDriver().getTrustScore(),
            r.isFemalePreferred(), r.isVerifiedOnly(), r.getSafetyLevel()
        ));
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
        r.isFemalePreferred(),
        r.isVerifiedOnly(),
        r.getSafetyLevel()
    );
  }
}
