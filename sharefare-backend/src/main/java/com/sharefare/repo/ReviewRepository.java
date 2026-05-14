package com.sharefare.repo;

import com.sharefare.model.Review;
import com.sharefare.model.Ride;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  List<Review> findByRideOrderByCreatedAtDesc(Ride ride);
}

