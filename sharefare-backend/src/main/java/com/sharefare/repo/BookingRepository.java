package com.sharefare.repo;

import com.sharefare.model.Booking;
import com.sharefare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
  List<Booking> findByPassengerOrderByCreatedAtDesc(User passenger);

  Optional<Booking> findByIdAndPassenger(Long id, User passenger);

  List<Booking> findTop10ByOrderByCreatedAtDesc();

  @Query("""
      select count(b) from Booking b
      where b.status in (
        com.sharefare.model.BookingStatus.DRIVER_APPROVED,
        com.sharefare.model.BookingStatus.CONFIRMED,
        com.sharefare.model.BookingStatus.ONGOING,
        com.sharefare.model.BookingStatus.COMPLETED
      )
      """)
  long countConfirmed();

  @Query("""
      select coalesce(sum((b.seatsBooked * r.pricePerSeat)), 0)
      from Booking b join b.ride r
      where b.status in (
        com.sharefare.model.BookingStatus.DRIVER_APPROVED,
        com.sharefare.model.BookingStatus.CONFIRMED,
        com.sharefare.model.BookingStatus.ONGOING,
        com.sharefare.model.BookingStatus.COMPLETED
      )
      """)
  BigDecimal sumConfirmedIncome();

  @Query("""
      select b from Booking b
      join fetch b.passenger p
      join fetch b.ride r
      join fetch r.driver d
      where b.status = com.sharefare.model.BookingStatus.CONFIRMED
        and b.reminderSentAt is null
        and r.departureTime >= :now
        and r.departureTime <= :until
      """)
  List<Booking> findConfirmedBookingsDueForReminder(OffsetDateTime now, OffsetDateTime until);
}
