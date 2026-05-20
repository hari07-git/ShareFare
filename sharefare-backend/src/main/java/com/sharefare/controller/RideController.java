package com.sharefare.controller;

import com.sharefare.dto.RideDtos.CreateRideRequest;
import com.sharefare.dto.RideDtos.RideResponse;
import com.sharefare.dto.RideDtos.SearchRideResponse;
import com.sharefare.service.RideService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/rides")
public class RideController {
  private final RideService rideService;

  public RideController(RideService rideService) {
    this.rideService = rideService;
  }

  @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
  @PostMapping
  public ResponseEntity<RideResponse> create(@Valid @RequestBody CreateRideRequest request, Authentication auth) {
    return ResponseEntity.ok(rideService.createRide(request, auth.getName()));
  }

  @GetMapping("/{id}")
  public ResponseEntity<RideResponse> get(@PathVariable Long id) {
    return ResponseEntity.ok(rideService.getRide(id));
  }

  @GetMapping("/search")
  public ResponseEntity<Page<SearchRideResponse>> search(
      @RequestParam Optional<String> origin,
      @RequestParam Optional<String> destination,
      @RequestParam Optional<LocalDate> date,
      @RequestParam(defaultValue = "false") boolean femaleOnly,
      @RequestParam(defaultValue = "false") boolean verifiedOnly,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size) {
    return ResponseEntity.ok(
        rideService.search(origin, destination, date, femaleOnly, verifiedOnly,
            PageRequest.of(page, size)));
  }
}
