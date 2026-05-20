package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;



@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(name = "uk_user_email", columnNames = "email"))
@EntityListeners(AuditingEntityListener.class)
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 254)
  private String email;

  @Column(nullable = false, length = 120)
  private String fullName;

  @Column(nullable = false, length = 72)
  private String passwordHash;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 24)
  private UserRole role = UserRole.USER;

  @Column(length = 30)
  private String phone;

  @Column(length = 64)
  private String collegeId;

  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean collegeVerified = false;

  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean emailVerified = false;

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @Column(length = 20)
  private String gender;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 30, columnDefinition = "varchar(30) default 'PENDING_VERIFICATION'")
  private AccountStatus accountStatus = AccountStatus.PENDING_VERIFICATION;

  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean verifiedStudent = false;

  private Double safetyScore = 100.0;
  
  @Column(columnDefinition = "TEXT")
  private String verificationRejectedReason;

  @Column(nullable = false, columnDefinition = "int default 0")
  private int totalCompletedRides = 0;

  private Double cancellationRate = 0.0;

  @Column(length = 500)
  private String idCardUrl;

  @Column(length = 50)
  private String verificationStatus = "UNVERIFIED";

  @Column(nullable = false, columnDefinition = "int default 0")
  private int verificationLevel = 0;

  private Instant idCardUploadedAt;

  @Column(columnDefinition = "TEXT")
  private String rejectionReason;

  @Column(length = 200)
  private String collegeName;

  private Instant verifiedAt;

  @Column(nullable = false, columnDefinition = "int default 0")
  private int uploadAttempts = 0;

  private Instant lastUploadDate;

  private Long reviewedByAdminId;
  private Instant adminReviewedAt;

  @Column(columnDefinition = "TEXT")
  private String adminNote;

  @Column(length = 50)
  private String verificationSource;

  @Column(length = 255)
  private String hashedRollNumber;

  @Column(length = 255)
  private String hashedIdSignature;

  @Column(nullable = false, columnDefinition = "boolean default false")
  private boolean duplicateSuspected = false;

  private Double trustScore = 0.0;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getFullName() {
    return fullName;
  }

  public void setFullName(String fullName) {
    this.fullName = fullName;
  }

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String passwordHash) {
    this.passwordHash = passwordHash;
  }

  public UserRole getRole() {
    return role;
  }

  public void setRole(UserRole role) {
    this.role = role;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getCollegeId() {
    return collegeId;
  }

  public void setCollegeId(String collegeId) {
    this.collegeId = collegeId;
  }

  public boolean isCollegeVerified() {
    return collegeVerified;
  }

  public void setCollegeVerified(boolean collegeVerified) {
    this.collegeVerified = collegeVerified;
  }

  public boolean isEmailVerified() {
    return emailVerified;
  }

  public void setEmailVerified(boolean emailVerified) {
    this.emailVerified = emailVerified;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public String getIdCardUrl() { return idCardUrl; }
  public void setIdCardUrl(String idCardUrl) { this.idCardUrl = idCardUrl; }



  public String getVerificationStatus() { return verificationStatus; }
  public void setVerificationStatus(String verificationStatus) { this.verificationStatus = verificationStatus; }

  public int getVerificationLevel() { return verificationLevel; }
  public void setVerificationLevel(int verificationLevel) { this.verificationLevel = verificationLevel; }

  public Instant getIdCardUploadedAt() { return idCardUploadedAt; }
  public void setIdCardUploadedAt(Instant idCardUploadedAt) { this.idCardUploadedAt = idCardUploadedAt; }

  public String getRejectionReason() { return rejectionReason; }
  public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

  public String getCollegeName() { return collegeName; }
  public void setCollegeName(String collegeName) { this.collegeName = collegeName; }

  public Instant getVerifiedAt() { return verifiedAt; }
  public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

  public int getUploadAttempts() { return uploadAttempts; }
  public void setUploadAttempts(int uploadAttempts) { this.uploadAttempts = uploadAttempts; }

  public Instant getLastUploadDate() { return lastUploadDate; }
  public void setLastUploadDate(Instant lastUploadDate) { this.lastUploadDate = lastUploadDate; }

  public Long getReviewedByAdminId() { return reviewedByAdminId; }
  public void setReviewedByAdminId(Long reviewedByAdminId) { this.reviewedByAdminId = reviewedByAdminId; }

  public Instant getAdminReviewedAt() { return adminReviewedAt; }
  public void setAdminReviewedAt(Instant adminReviewedAt) { this.adminReviewedAt = adminReviewedAt; }

  public String getAdminNote() { return adminNote; }
  public void setAdminNote(String adminNote) { this.adminNote = adminNote; }

  public String getVerificationSource() { return verificationSource; }
  public void setVerificationSource(String verificationSource) { this.verificationSource = verificationSource; }

  public String getHashedRollNumber() { return hashedRollNumber; }
  public void setHashedRollNumber(String hashedRollNumber) { this.hashedRollNumber = hashedRollNumber; }

  public String getHashedIdSignature() { return hashedIdSignature; }
  public void setHashedIdSignature(String hashedIdSignature) { this.hashedIdSignature = hashedIdSignature; }

  public boolean isDuplicateSuspected() { return duplicateSuspected; }
  public void setDuplicateSuspected(boolean duplicateSuspected) { this.duplicateSuspected = duplicateSuspected; }

  public Double getTrustScore() { return trustScore; }
  public void setTrustScore(Double trustScore) { this.trustScore = trustScore; }

  public String getGender() { return gender; }
  public void setGender(String gender) { this.gender = gender; }

  public AccountStatus getAccountStatus() { return accountStatus; }
  public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }

  public boolean isVerifiedStudent() { return verifiedStudent; }
  public void setVerifiedStudent(boolean verifiedStudent) { this.verifiedStudent = verifiedStudent; }

  public Double getSafetyScore() { return safetyScore; }
  public void setSafetyScore(Double safetyScore) { this.safetyScore = safetyScore; }

  public String getVerificationRejectedReason() { return verificationRejectedReason; }
  public void setVerificationRejectedReason(String verificationRejectedReason) { this.verificationRejectedReason = verificationRejectedReason; }

  public int getTotalCompletedRides() { return totalCompletedRides; }
  public void setTotalCompletedRides(int totalCompletedRides) { this.totalCompletedRides = totalCompletedRides; }

  public Double getCancellationRate() { return cancellationRate; }
  public void setCancellationRate(Double cancellationRate) { this.cancellationRate = cancellationRate; }
}
