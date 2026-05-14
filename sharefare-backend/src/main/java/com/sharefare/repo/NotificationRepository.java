package com.sharefare.repo;

import com.sharefare.model.Notification;
import com.sharefare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findTop50ByUserOrderByCreatedAtDesc(User user);

  long countByUserAndReadFlagFalse(User user);

  Optional<Notification> findByIdAndUser(Long id, User user);
}

