package com.sharefare.model;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "chat_messages")
@EntityListeners(AuditingEntityListener.class)
public class ChatMessage {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "booking_id", nullable = false)
  private Booking booking;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "sender_id", nullable = false)
  private User sender;

  @Column(nullable = false, length = 1000)
  private String content;

  @CreatedDate
  @Column(nullable = false, updatable = false)
  private Instant createdAt;

  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public Booking getBooking() { return booking; }
  public void setBooking(Booking booking) { this.booking = booking; }

  public User getSender() { return sender; }
  public void setSender(User sender) { this.sender = sender; }

  public String getContent() { return content; }
  public void setContent(String content) { this.content = content; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
