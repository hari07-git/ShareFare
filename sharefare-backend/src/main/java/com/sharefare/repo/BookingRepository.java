package com.sharefare.repo;

import com.sharefare.model.Booking;
import com.sharefare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
  List<Booking> findByPassengerOrderByCreatedAtDesc(User passenger);

  Optional<Booking> findByIdAndPassenger(Long id, User passenger);

  @Query("select count(b) from Booking b where b.status = com.sharefare.model.BookingStatus.CONFIRMED")
  long countConfirmed();

  @Query("select coalesce(sum((b.seatsBooked * r.pricePerSeat)), 0) from Booking b join b.ride r where b.status = com.sharefare.model.BookingStatus.CONFIRMED")
  BigDecimal sumConfirmedIncome();
}
