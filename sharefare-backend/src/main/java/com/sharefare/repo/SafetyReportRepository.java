package com.sharefare.repo;

import com.sharefare.model.SafetyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SafetyReportRepository extends JpaRepository<SafetyReport, Long> {
  List<SafetyReport> findByReportedUserId(Long reportedUserId);
}
