package com.sharefare.service;

import com.sharefare.dto.TrackingDtos.LocationResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.repo.RideRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TrackingService {
  private final RideRepository rideRepository;

  public TrackingService(RideRepository rideRepository) {
    this.rideRepository = rideRepository;
  }

  public LocationResponse latestLocation(Long rideId) {
    if (!rideRepository.existsById(rideId)) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Ride not found");
    }
    return new LocationResponse(rideId, null, null, Instant.now());
  }
}

