package com.sharefare.repo;

import com.sharefare.model.VerificationAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationAuditLogRepository extends JpaRepository<VerificationAuditLog, Long> {
}
