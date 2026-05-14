package com.sharefare.controller;

import com.sharefare.dto.ReviewDtos.CreateReviewRequest;
import com.sharefare.dto.ReviewDtos.ReviewResponse;
import com.sharefare.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {
  private final ReviewService reviewService;

  public ReviewController(ReviewService reviewService) {
    this.reviewService = reviewService;
  }

  @PostMapping("/rides/{rideId}/reviews")
  public ResponseEntity<ReviewResponse> create(@PathVariable Long rideId,
                                               @Valid @RequestBody CreateReviewRequest request,
                                               Authentication auth) {
    return ResponseEntity.ok(reviewService.createReview(rideId, auth.getName(), request));
  }

  @GetMapping("/rides/{rideId}/reviews")
  public ResponseEntity<List<ReviewResponse>> list(@PathVariable Long rideId) {
    return ResponseEntity.ok(reviewService.listRideReviews(rideId));
  }
}
