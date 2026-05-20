package com.sharefare.service;

import com.sharefare.dto.AdminDtos.AdminMetricsResponse;
import com.sharefare.dto.AdminDtos.AdminBookingSummary;
import com.sharefare.dto.AdminDtos.AdminRideSummary;
import com.sharefare.dto.AdminDtos.AdminUserSummary;
import com.sharefare.model.RideStatus;
import com.sharefare.repo.BookingRepository;
import com.sharefare.repo.RideRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AdminService {
  private final BookingRepository bookingRepository;
  private final RideRepository rideRepository;
  private final UserRepository userRepository;

  public AdminService(BookingRepository bookingRepository,
                      RideRepository rideRepository,
                      UserRepository userRepository) {
    this.bookingRepository = bookingRepository;
    this.rideRepository = rideRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public AdminMetricsResponse metrics() {
    long totalUsers = userRepository.count();
    long totalRides = rideRepository.count();
    long totalBookings = bookingRepository.count();
    long confirmed = bookingRepository.countConfirmed();
    long activeRides = rideRepository.countByStatus(RideStatus.OPEN) + rideRepository.countByStatus(RideStatus.FULL);
    BigDecimal income = bookingRepository.sumConfirmedIncome();
    var recentUsers = userRepository.findTop10ByOrderByIdDesc().stream()
        .map(u -> new AdminUserSummary(u.getId(), u.getEmail(), u.getFullName(), u.getRole().name(), u.isCollegeVerified(), u.isEmailVerified()))
        .toList();
    var recentRides = rideRepository.findTop10ByOrderByDepartureTimeDesc().stream()
        .map(r -> new AdminRideSummary(
            r.getId(),
            r.getOrigin(),
            r.getDestination(),
            r.getDepartureTime(),
            r.getSeatsAvailable(),
            r.getStatus().name(),
            r.getDriver().getEmail()
        ))
        .toList();
    var recentBookings = bookingRepository.findTop10ByOrderByCreatedAtDesc().stream()
        .map(b -> new AdminBookingSummary(
            b.getId(),
            b.getRide().getId(),
            b.getPassenger().getEmail(),
            b.getSeatsBooked(),
            b.getStatus().name()
        ))
        .toList();
    return new AdminMetricsResponse(
        totalUsers,
        totalRides,
        totalBookings,
        confirmed,
        activeRides,
        0,
        income == null ? BigDecimal.ZERO : income,
        recentUsers,
        recentRides,
        recentBookings
    );
  }
}
