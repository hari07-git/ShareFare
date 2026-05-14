package com.sharefare.service;

import com.sharefare.dto.AdminDtos.AdminMetricsResponse;
import com.sharefare.repo.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AdminService {
  private final BookingRepository bookingRepository;

  public AdminService(BookingRepository bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  @Transactional(readOnly = true)
  public AdminMetricsResponse metrics() {
    long total = bookingRepository.count();
    long confirmed = bookingRepository.countConfirmed();
    BigDecimal income = bookingRepository.sumConfirmedIncome();
    return new AdminMetricsResponse(total, confirmed, income == null ? BigDecimal.ZERO : income);
  }
}

