package com.sharefare.dto;

import com.sharefare.model.BookingStatus;
import com.sharefare.model.RideStatus;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class DriverInboxDtos {
  public record MyRidesResponse(
      Long id,
      String origin,
      String destination,
      OffsetDateTime departureTime,
      int seatsTotal,
      int seatsAvailable,
      BigDecimal pricePerSeat,
      RideStatus status
  ) {}

  public record MyRideBookingsResponse(
      Long bookingId,
      Long rideId,
      String passengerEmail,
      String passengerName,
      String passengerPhone,
      int seatsBooked,
      BookingStatus status,
      OffsetDateTime createdAt
  ) {}
}

