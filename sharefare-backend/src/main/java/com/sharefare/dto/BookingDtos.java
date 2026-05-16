package com.sharefare.dto;

import com.sharefare.model.BookingStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.time.OffsetDateTime;

public class BookingDtos {
  public record BookRideRequest(
      @NotNull @Min(1) @Max(4) Integer seats
  ) {}

  public record BookingResponse(
      Long bookingId,
      Long rideId,
      int seatsBooked,
      BookingStatus status,
      Instant createdAt
  ) {}

  public record MyBookingsResponse(
      Long bookingId,
      Long rideId,
      String origin,
      String destination,
      OffsetDateTime departureTime,
      String driverName,
      String driverEmail,
      String driverPhone,
      int seatsBooked,
      BookingStatus status
  ) {}
}
