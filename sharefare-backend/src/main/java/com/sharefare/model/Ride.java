package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "rides", indexes = {
    @Index(name = "idx_ride_departure", columnList = "departureTime"),
    @Index(name = "idx_ride_origin", columnList = "origin"),
    @Index(name = "idx_ride_destination", columnList = "destination")
})
@EntityListeners(AuditingEntityListener.class)
public class Ride {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "driver_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ride_driver"))
  private User driver;

  @Column(nullable = false, length = 200)
  private String origin;

  @Column(nullable = false, length = 200)
  private String destination;

  @Column
  private Double originLat;

  @Column
  private Double originLng;

  @Column
  private Double destinationLat;

  @Column
  private Double destinationLng;

  @Column(nullable = false)
  private OffsetDateTime departureTime;

  @Column(nullable = false)
  private int seatsTotal;

  @Column(nullable = false)
  private int seatsAvailable;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal pricePerSeat;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 24)
  private RideStatus status = RideStatus.OPEN;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public User getDriver() {
    return driver;
  }

  public void setDriver(User driver) {
    this.driver = driver;
  }

  public String getOrigin() {
    return origin;
  }

  public void setOrigin(String origin) {
    this.origin = origin;
  }

  public String getDestination() {
    return destination;
  }

  public void setDestination(String destination) {
    this.destination = destination;
  }

  public OffsetDateTime getDepartureTime() {
    return departureTime;
  }

  public void setDepartureTime(OffsetDateTime departureTime) {
    this.departureTime = departureTime;
  }

  public Double getOriginLat() {
    return originLat;
  }

  public void setOriginLat(Double originLat) {
    this.originLat = originLat;
  }

  public Double getOriginLng() {
    return originLng;
  }

  public void setOriginLng(Double originLng) {
    this.originLng = originLng;
  }

  public Double getDestinationLat() {
    return destinationLat;
  }

  public void setDestinationLat(Double destinationLat) {
    this.destinationLat = destinationLat;
  }

  public Double getDestinationLng() {
    return destinationLng;
  }

  public void setDestinationLng(Double destinationLng) {
    this.destinationLng = destinationLng;
  }

  public int getSeatsTotal() {
    return seatsTotal;
  }

  public void setSeatsTotal(int seatsTotal) {
    this.seatsTotal = seatsTotal;
  }

  public int getSeatsAvailable() {
    return seatsAvailable;
  }

  public void setSeatsAvailable(int seatsAvailable) {
    this.seatsAvailable = seatsAvailable;
  }

  public BigDecimal getPricePerSeat() {
    return pricePerSeat;
  }

  public void setPricePerSeat(BigDecimal pricePerSeat) {
    this.pricePerSeat = pricePerSeat;
  }

  public RideStatus getStatus() {
    return status;
  }

  public void setStatus(RideStatus status) {
    this.status = status;
  }
}
