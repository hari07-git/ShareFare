package com.sharefare.repo;

import com.sharefare.model.ApprovedCollege;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ApprovedCollegeRepository extends JpaRepository<ApprovedCollege, Long> {
  Optional<ApprovedCollege> findByCollegeNameIgnoreCase(String collegeName);
}
