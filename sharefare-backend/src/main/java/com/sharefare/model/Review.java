package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "reviews",
    uniqueConstraints = @UniqueConstraint(name = "uk_review_ride_reviewer_reviewee",
        columnNames = {"ride_id", "reviewer_id", "reviewee_id"}))
@EntityListeners(AuditingEntityListener.class)
public class Review {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "ride_id", nullable = false, foreignKey = @ForeignKey(name = "fk_review_ride"))
  private Ride ride;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_review_reviewer"))
  private User reviewer;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "reviewee_id", nullable = false, foreignKey = @ForeignKey(name = "fk_review_reviewee"))
  private User reviewee;

  @Column(nullable = false)
  private int rating; // 1..5

  @Column(length = 500)
  private String comment;

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Ride getRide() {
    return ride;
  }

  public void setRide(Ride ride) {
    this.ride = ride;
  }

  public User getReviewer() {
    return reviewer;
  }

  public void setReviewer(User reviewer) {
    this.reviewer = reviewer;
  }

  public User getReviewee() {
    return reviewee;
  }

  public void setReviewee(User reviewee) {
    this.reviewee = reviewee;
  }

  public int getRating() {
    return rating;
  }

  public void setRating(int rating) {
    this.rating = rating;
  }

  public String getComment() {
    return comment;
  }

  public void setComment(String comment) {
    this.comment = comment;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
