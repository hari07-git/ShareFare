package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "safety_report")
@EntityListeners(AuditingEntityListener.class)
public class SafetyReport {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long reporterUserId;

  @Column(nullable = false)
  private Long reportedUserId;

  @Column(length = 50)
  private String reportType;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(length = 500)
  private String evidenceUrl;

  @Column(length = 50)
  private String severity;

  @Column(length = 50)
  private String status = "OPEN";

  @CreatedDate
  @Column(updatable = false)
  private Instant createdAt;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getReporterUserId() { return reporterUserId; }
  public void setReporterUserId(Long reporterUserId) { this.reporterUserId = reporterUserId; }
  public Long getReportedUserId() { return reportedUserId; }
  public void setReportedUserId(Long reportedUserId) { this.reportedUserId = reportedUserId; }
  public String getReportType() { return reportType; }
  public void setReportType(String reportType) { this.reportType = reportType; }
  public String getDescription() { return description; }
  public void setDescription(String description) { this.description = description; }
  public String getEvidenceUrl() { return evidenceUrl; }
  public void setEvidenceUrl(String evidenceUrl) { this.evidenceUrl = evidenceUrl; }
  public String getSeverity() { return severity; }
  public void setSeverity(String severity) { this.severity = severity; }
  public String getStatus() { return status; }
  public void setStatus(String status) { this.status = status; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
