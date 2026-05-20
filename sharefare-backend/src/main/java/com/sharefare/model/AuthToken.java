package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "auth_tokens", indexes = {
    @Index(name = "idx_auth_token_token", columnList = "token", unique = true),
    @Index(name = "idx_auth_token_user_purpose", columnList = "user_id,purpose")
})
@EntityListeners(AuditingEntityListener.class)
public class AuthToken {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @Column(nullable = false, length = 96, unique = true)
  private String token;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 32)
  private AuthTokenPurpose purpose;

  @Column(nullable = false)
  private Instant expiresAt;

  @Column(nullable = false)
  private boolean used = false;

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  @PrePersist
  void prePersist() {
    if (createdAt == null) {
      createdAt = Instant.now();
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getUser() {
    return user;
  }

  public void setUser(User user) {
    this.user = user;
  }

  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  public AuthTokenPurpose getPurpose() {
    return purpose;
  }

  public void setPurpose(AuthTokenPurpose purpose) {
    this.purpose = purpose;
  }

  public Instant getExpiresAt() {
    return expiresAt;
  }

  public void setExpiresAt(Instant expiresAt) {
    this.expiresAt = expiresAt;
  }

  public boolean isUsed() {
    return used;
  }

  public void setUsed(boolean used) {
    this.used = used;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
