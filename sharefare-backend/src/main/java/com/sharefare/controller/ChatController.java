package com.sharefare.controller;

import com.sharefare.dto.ChatDtos.ChatMessageResponse;
import com.sharefare.dto.ChatDtos.SendMessageRequest;
import com.sharefare.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings/{bookingId}/messages")
public class ChatController {

  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
  }

  @GetMapping
  public ResponseEntity<List<ChatMessageResponse>> getMessages(@PathVariable Long bookingId,
                                                               Authentication auth) {
    return ResponseEntity.ok(chatService.getMessages(bookingId, auth.getName()));
  }

  @PostMapping
  public ResponseEntity<ChatMessageResponse> sendMessage(@PathVariable Long bookingId,
                                                         @Valid @RequestBody SendMessageRequest request,
                                                         Authentication auth) {
    return ResponseEntity.ok(chatService.sendMessage(bookingId, auth.getName(), request.content()));
  }
}
