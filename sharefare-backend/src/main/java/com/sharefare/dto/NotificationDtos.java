package com.sharefare.dto;

import java.time.Instant;

public class NotificationDtos {
  public record NotificationResponse(
      Long id,
      String type,
      String title,
      String message,
      boolean read,
      Instant createdAt
  ) {}

  public record UnreadCountResponse(long unread) {}
}

