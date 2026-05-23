package com.sharefare.dto;

import com.sharefare.model.RideStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class RideDtos {
  public record CreateRideRequest(
      @NotBlank String origin,
      @NotBlank String destination,
      @NotNull @Future OffsetDateTime departureTime,
      @NotNull @Min(1) @Max(6) Integer seatsTotal,
      @NotNull @DecimalMin("0.0") BigDecimal pricePerSeat,
      Double originLat,
      Double originLng,
      Double destinationLat,
      Double destinationLng,
      String vehicleType,
      String vehicleNumber,
      String pickupNote,
      boolean femalePreferred,
      boolean verifiedOnly
  ) {}

  public record UpdateRideRequest(
      OffsetDateTime departureTime,
      @Min(1) @Max(6) Integer seatsTotal,
      @DecimalMin("0.0") BigDecimal pricePerSeat,
      String vehicleType,
      String vehicleNumber,
      String pickupNote,
      Boolean femalePreferred,
      Boolean verifiedOnly
  ) {}

  public record RideResponse(
      Long id,
      String driverEmail,
      String driverName,
      String driverPhone,
      String origin,
      String destination,
      Double originLat,
      Double originLng,
      Double destinationLat,
      Double destinationLng,
      OffsetDateTime departureTime,
      int seatsTotal,
      int seatsAvailable,
      BigDecimal pricePerSeat,
      RideStatus status,
      String vehicleType,
      String vehicleNumber,
      String pickupNote,
      String driverGender,
      Double driverTrustScore,
      boolean femalePreferred,
      boolean verifiedOnly,
      String safetyLevel
  ) {}

  public record SearchRideResponse(
      Long id,
      String origin,
      String destination,
      OffsetDateTime departureTime,
      int seatsAvailable,
      BigDecimal pricePerSeat,
      String driverName,
      String driverGender,
      Double driverTrustScore,
      boolean femalePreferred,
      boolean verifiedOnly,
      String safetyLevel
  ) {}
}
