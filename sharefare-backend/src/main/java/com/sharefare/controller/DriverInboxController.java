package com.sharefare.controller;

import com.sharefare.dto.DriverInboxDtos.MyRideBookingsResponse;
import com.sharefare.dto.DriverInboxDtos.MyRidesResponse;
import com.sharefare.dto.BookingDtos.BookingResponse;
import com.sharefare.service.BookingService;
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
  private final BookingService bookingService;

  public DriverInboxController(DriverInboxService driverInboxService, BookingService bookingService) {
    this.driverInboxService = driverInboxService;
    this.bookingService = bookingService;
  }

  @GetMapping("/rides")
  public ResponseEntity<List<MyRidesResponse>> myRides(Authentication auth) {
    return ResponseEntity.ok(driverInboxService.listMyRides(auth.getName()));
  }

  @GetMapping("/rides/{rideId}/bookings")
  public ResponseEntity<List<MyRideBookingsResponse>> rideBookings(@PathVariable Long rideId, Authentication auth) {
    return ResponseEntity.ok(driverInboxService.listRideBookings(rideId, auth.getName()));
  }

  @PostMapping("/rides/{rideId}/cancel")
  public ResponseEntity<Void> cancelRide(@PathVariable Long rideId, Authentication auth) {
    driverInboxService.cancelRide(rideId, auth.getName());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/rides/{rideId}/bookings/{bookingId}/approve")
  public ResponseEntity<BookingResponse> approveBooking(@PathVariable Long rideId,
                                                        @PathVariable Long bookingId,
                                                        Authentication auth) {
    return ResponseEntity.ok(bookingService.approveBooking(rideId, bookingId, auth.getName()));
  }

  @PostMapping("/rides/{rideId}/bookings/{bookingId}/reject")
  public ResponseEntity<BookingResponse> rejectBooking(@PathVariable Long rideId,
                                                       @PathVariable Long bookingId,
                                                       Authentication auth) {
    return ResponseEntity.ok(bookingService.rejectBooking(rideId, bookingId, auth.getName()));
  }

  @PostMapping("/rides/{rideId}/bookings/{bookingId}/start")
  public ResponseEntity<BookingResponse> startBooking(@PathVariable Long rideId,
                                                      @PathVariable Long bookingId,
                                                      Authentication auth) {
    return ResponseEntity.ok(bookingService.startBooking(rideId, bookingId, auth.getName()));
  }

  @PostMapping("/rides/{rideId}/bookings/{bookingId}/confirm")
  public ResponseEntity<BookingResponse> confirmBooking(@PathVariable Long rideId,
                                                        @PathVariable Long bookingId,
                                                        Authentication auth) {
    return ResponseEntity.ok(bookingService.confirmBooking(rideId, bookingId, auth.getName()));
  }

  @PostMapping("/rides/{rideId}/bookings/{bookingId}/complete")
  public ResponseEntity<BookingResponse> completeBooking(@PathVariable Long rideId,
                                                         @PathVariable Long bookingId,
                                                         Authentication auth) {
    return ResponseEntity.ok(bookingService.completeBooking(rideId, bookingId, auth.getName()));
  }
}
