package com.sharefare.service;

import com.sharefare.dto.NotificationDtos.NotificationResponse;
import com.sharefare.dto.NotificationDtos.UnreadCountResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.Notification;
import com.sharefare.model.User;
import com.sharefare.repo.NotificationRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;

  public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
    this.notificationRepository = notificationRepository;
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public List<NotificationResponse> listMine(String email) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    return notificationRepository.findTop50ByUserOrderByCreatedAtDesc(user).stream().map(this::toDto).toList();
  }

  @Transactional(readOnly = true)
  public UnreadCountResponse unreadCount(String email) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    return new UnreadCountResponse(notificationRepository.countByUserAndReadFlagFalse(user));
  }

  @Transactional
  public void markRead(Long id, String email) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var notif = notificationRepository.findByIdAndUser(id, user)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
    notif.setReadFlag(true);
    notificationRepository.save(notif);
  }

  @Transactional
  public void markAllRead(String email) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    var unread = notificationRepository.findByUserAndReadFlagFalse(user);
    for (var notification : unread) {
      notification.setReadFlag(true);
    }
    notificationRepository.saveAll(unread);
  }

  @Transactional
  public void create(User target, String type, String title, String message) {
    Notification n = new Notification();
    n.setUser(target);
    n.setType(type);
    n.setTitle(title);
    n.setMessage(message);
    n.setReadFlag(false);
    notificationRepository.save(n);
  }

  private NotificationResponse toDto(Notification n) {
    return new NotificationResponse(
        n.getId(),
        n.getType(),
        n.getTitle(),
        n.getMessage(),
        n.isReadFlag(),
        n.getCreatedAt()
    );
  }
}
