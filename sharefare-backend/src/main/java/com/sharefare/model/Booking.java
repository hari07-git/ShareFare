package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "bookings",
    uniqueConstraints = @UniqueConstraint(name = "uk_booking_ride_passenger", columnNames = {"ride_id", "passenger_id"}))
@EntityListeners(AuditingEntityListener.class)
public class Booking {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "ride_id", nullable = false, foreignKey = @ForeignKey(name = "fk_booking_ride"))
  private Ride ride;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "passenger_id", nullable = false, foreignKey = @ForeignKey(name = "fk_booking_passenger"))
  private User passenger;

  @Column(nullable = false)
  private int seatsBooked;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 24)
  private BookingStatus status = BookingStatus.CONFIRMED;

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

  public User getPassenger() {
    return passenger;
  }

  public void setPassenger(User passenger) {
    this.passenger = passenger;
  }

  public int getSeatsBooked() {
    return seatsBooked;
  }

  public void setSeatsBooked(int seatsBooked) {
    this.seatsBooked = seatsBooked;
  }

  public BookingStatus getStatus() {
    return status;
  }

  public void setStatus(BookingStatus status) {
    this.status = status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }
}
