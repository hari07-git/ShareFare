package com.sharefare.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class ReviewDtos {
  public record CreateReviewRequest(
      @NotBlank @Email String revieweeEmail,
      @NotNull @Min(1) @Max(5) Integer rating,
      @Size(max = 500) String comment
  ) {}

  public record ReviewResponse(
      Long id,
      Long rideId,
      String reviewerEmail,
      String revieweeEmail,
      int rating,
      String comment,
      Instant createdAt
  ) {}
}

