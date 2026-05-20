package com.sharefare.dto;

import jakarta.validation.constraints.NotBlank;
import java.time.Instant;

public class ChatDtos {
  public record SendMessageRequest(
      @NotBlank(message = "Message content is required")
      String content
  ) {}

  public record ChatMessageResponse(
      Long id,
      Long senderId,
      String senderName,
      String content,
      Instant createdAt
  ) {}
}
