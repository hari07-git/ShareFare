package com.sharefare.dto;

import java.math.BigDecimal;

public class AdminDtos {
  public record AdminMetricsResponse(
      long totalBookings,
      long confirmedBookings,
      BigDecimal totalIncome
  ) {}
}

