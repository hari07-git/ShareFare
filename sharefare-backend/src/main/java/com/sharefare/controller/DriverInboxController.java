package com.sharefare.controller;

import com.sharefare.dto.DriverInboxDtos.MyRideBookingsResponse;
import com.sharefare.dto.DriverInboxDtos.MyRidesResponse;
import com.sharefare.service.DriverInboxService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me/driver")
public class DriverInboxController {
  private final DriverInboxService driverInboxService;

  public DriverInboxController(DriverInboxService driverInboxService) {
    this.driverInboxService = driverInboxService;
  }

  @PreAuthorize("hasAnyRole('DRIVER','ADMIN')")
  @GetMapping("/rides")
  public ResponseEntity<List<MyRidesResponse>> myRides(Authentication auth) {
    return ResponseEntity.ok(driverInboxService.listMyRides(auth.getName()));
  }

  @PreAuthorize("hasAnyRole('DRIVER','ADMIN')")
  @GetMapping("/rides/{rideId}/bookings")
  public ResponseEntity<List<MyRideBookingsResponse>> rideBookings(@PathVariable Long rideId, Authentication auth) {
    return ResponseEntity.ok(driverInboxService.listRideBookings(rideId, auth.getName()));
  }

  @PreAuthorize("hasAnyRole('DRIVER','ADMIN')")
  @PostMapping("/rides/{rideId}/cancel")
  public ResponseEntity<Void> cancelRide(@PathVariable Long rideId, Authentication auth) {
    driverInboxService.cancelRide(rideId, auth.getName());
    return ResponseEntity.noContent().build();
  }
}
