package com.sharefare.controller;

import com.sharefare.dto.TrackingDtos.LocationResponse;
import com.sharefare.service.TrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rides")
public class TrackingController {
  private final TrackingService trackingService;

  public TrackingController(TrackingService trackingService) {
    this.trackingService = trackingService;
  }

  @GetMapping("/{rideId}/tracking")
  public ResponseEntity<LocationResponse> latest(@PathVariable Long rideId) {
    return ResponseEntity.ok(trackingService.latestLocation(rideId));
  }
}
