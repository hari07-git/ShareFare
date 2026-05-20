package com.sharefare.service;

import com.sharefare.model.VerificationAuditLog;
import com.sharefare.repo.VerificationAuditLogRepository;
import org.springframework.stereotype.Service;

@Service
public class VerificationAuditService {
  private final VerificationAuditLogRepository repo;

  public VerificationAuditService(VerificationAuditLogRepository repo) {
    this.repo = repo;
  }

  public void logAction(Long userId, String action, String performedBy, String performedByRole, String oldStatus, String newStatus, Double confidenceScore, Double fraudScore, String note) {
    VerificationAuditLog log = new VerificationAuditLog();
    log.setUserId(userId);
    log.setAction(action);
    log.setPerformedBy(performedBy);
    log.setPerformedByRole(performedByRole);
    log.setOldStatus(oldStatus);
    log.setNewStatus(newStatus);
    log.setConfidenceScore(confidenceScore);
    log.setFraudScore(fraudScore);
    log.setNote(note);
    repo.save(log);
  }
}
