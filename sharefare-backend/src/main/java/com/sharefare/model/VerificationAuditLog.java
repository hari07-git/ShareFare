package com.sharefare.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "verification_audit_log")
public class VerificationAuditLog {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long userId;

  @Column(nullable = false, length = 50)
  private String action;

  @Column(length = 100)
  private String performedBy;

  @Column(length = 50)
  private String performedByRole;

  @Column(length = 50)
  private String oldStatus;

  @Column(length = 50)
  private String newStatus;

  private Double confidenceScore;
  private Double fraudScore;

  @Column(columnDefinition = "TEXT")
  private String note;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }
  public String getAction() { return action; }
  public void setAction(String action) { this.action = action; }
  public String getPerformedBy() { return performedBy; }
  public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
  public String getPerformedByRole() { return performedByRole; }
  public void setPerformedByRole(String performedByRole) { this.performedByRole = performedByRole; }
  public String getOldStatus() { return oldStatus; }
  public void setOldStatus(String oldStatus) { this.oldStatus = oldStatus; }
  public String getNewStatus() { return newStatus; }
  public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
  public Double getConfidenceScore() { return confidenceScore; }
  public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }
  public Double getFraudScore() { return fraudScore; }
  public void setFraudScore(Double fraudScore) { this.fraudScore = fraudScore; }
  public String getNote() { return note; }
  public void setNote(String note) { this.note = note; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
