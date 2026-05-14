package com.sharefare.controller;

import com.sharefare.dto.NotificationDtos.NotificationResponse;
import com.sharefare.dto.NotificationDtos.UnreadCountResponse;
import com.sharefare.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/me/notifications")
public class NotificationController {
  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public ResponseEntity<List<NotificationResponse>> list(Authentication auth) {
    return ResponseEntity.ok(notificationService.listMine(auth.getName()));
  }

  @GetMapping("/unread-count")
  public ResponseEntity<UnreadCountResponse> unreadCount(Authentication auth) {
    return ResponseEntity.ok(notificationService.unreadCount(auth.getName()));
  }

  @PostMapping("/{id}/read")
  public ResponseEntity<Void> markRead(@PathVariable Long id, Authentication auth) {
    notificationService.markRead(id, auth.getName());
    return ResponseEntity.noContent().build();
  }
}

