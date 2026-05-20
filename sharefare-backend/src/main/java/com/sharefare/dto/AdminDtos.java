package com.sharefare.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

public class AdminDtos {
  public record AdminMetricsResponse(
      long totalUsers,
      long totalRides,
      long totalBookings,
      long confirmedBookings,
      long activeRides,
      long openSafetyReports,
      BigDecimal totalIncome,
      List<AdminUserSummary> recentUsers,
      List<AdminRideSummary> recentRides,
      List<AdminBookingSummary> recentBookings
  ) {}

  public record AdminUserSummary(
      Long id,
      String email,
      String fullName,
      String role,
      boolean collegeVerified,
      boolean emailVerified
  ) {}

  public record AdminRideSummary(
      Long id,
      String origin,
      String destination,
      OffsetDateTime departureTime,
      int seatsAvailable,
      String status,
      String driverEmail
  ) {}

  public record AdminBookingSummary(
      Long id,
      Long rideId,
      String passengerEmail,
      int seatsBooked,
      String status
  ) {}
}
