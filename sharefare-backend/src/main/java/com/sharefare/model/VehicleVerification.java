package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "vehicle_verification")
@EntityListeners(AuditingEntityListener.class)
public class VehicleVerification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Long userId;

  @Column(length = 100)
  private String vehicleType;

  @Column(length = 50)
  private String vehicleNumber;

  @Column(length = 50)
  private String brand;

  @Column(length = 50)
  private String model;

  @Column(length = 30)
  private String color;

  @Column(nullable = false, columnDefinition = "int default 4")
  private int seats = 4;

  @Column(length = 500)
  private String rcDocumentUrl;

  @Column(length = 500)
  private String insuranceUrl;

  @Column(length = 50)
  private String approvalStatus = "PENDING";

  @CreatedDate
  @Column(updatable = false)
  private Instant createdAt;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }
  public Long getUserId() { return userId; }
  public void setUserId(Long userId) { this.userId = userId; }
  public String getVehicleType() { return vehicleType; }
  public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
  public String getVehicleNumber() { return vehicleNumber; }
  public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }
  public String getRcDocumentUrl() { return rcDocumentUrl; }
  public void setRcDocumentUrl(String rcDocumentUrl) { this.rcDocumentUrl = rcDocumentUrl; }
  public String getInsuranceUrl() { return insuranceUrl; }
  public void setInsuranceUrl(String insuranceUrl) { this.insuranceUrl = insuranceUrl; }
  public String getBrand() { return brand; }
  public void setBrand(String brand) { this.brand = brand; }
  public String getModel() { return model; }
  public void setModel(String model) { this.model = model; }
  public String getColor() { return color; }
  public void setColor(String color) { this.color = color; }
  public int getSeats() { return seats; }
  public void setSeats(int seats) { this.seats = seats; }
  public String getApprovalStatus() { return approvalStatus; }
  public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
