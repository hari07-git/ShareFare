package com.sharefare.repo;

import com.sharefare.model.Booking;
import com.sharefare.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookingByRideRepository extends JpaRepository<Booking, Long> {
  @Query("select b from Booking b join fetch b.passenger p where b.ride.id = :rideId order by b.createdAt desc")
  List<Booking> findRideBookings(@Param("rideId") Long rideId);

  @Query("select b from Booking b join fetch b.passenger p where b.ride.id = :rideId and b.status = :status")
  List<Booking> findRideBookingsByStatus(@Param("rideId") Long rideId, @Param("status") BookingStatus status);
}
