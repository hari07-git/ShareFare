package com.sharefare.repo;

import com.sharefare.model.Ride;
import com.sharefare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RideByDriverRepository extends JpaRepository<Ride, Long> {
  List<Ride> findByDriverOrderByDepartureTimeDesc(User driver);
}

