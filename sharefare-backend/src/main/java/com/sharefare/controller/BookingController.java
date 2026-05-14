package com.sharefare.controller;

import com.sharefare.dto.BookingDtos.BookRideRequest;
import com.sharefare.dto.BookingDtos.BookingResponse;
import com.sharefare.dto.BookingDtos.MyBookingsResponse;
import com.sharefare.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {
  private final BookingService bookingService;

  public BookingController(BookingService bookingService) {
    this.bookingService = bookingService;
  }

  @PostMapping("/rides/{rideId}/bookings")
  public ResponseEntity<BookingResponse> book(@PathVariable Long rideId,
                                              @Valid @RequestBody BookRideRequest request,
                                              Authentication auth) {
    return ResponseEntity.ok(bookingService.bookRide(rideId, request, auth.getName()));
  }

  @GetMapping("/me/bookings")
  public ResponseEntity<List<MyBookingsResponse>> myBookings(Authentication auth) {
    return ResponseEntity.ok(bookingService.listMyBookings(auth.getName()));
  }

  @DeleteMapping("/bookings/{bookingId}")
  public ResponseEntity<Void> cancel(@PathVariable Long bookingId, Authentication auth) {
    bookingService.cancelBooking(bookingId, auth.getName());
    return ResponseEntity.noContent().build();
  }
}
