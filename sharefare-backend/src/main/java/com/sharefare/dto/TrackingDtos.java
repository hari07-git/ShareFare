package com.sharefare.dto;

import java.time.Instant;

public class TrackingDtos {
  public record LocationResponse(
      Long rideId,
      Double lat,
      Double lng,
      Instant asOf
  ) {}
}

