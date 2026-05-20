package com.sharefare.repo;

import com.sharefare.model.VehicleVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VehicleVerificationRepository extends JpaRepository<VehicleVerification, Long> {
  Optional<VehicleVerification> findByUserId(Long userId);
}
