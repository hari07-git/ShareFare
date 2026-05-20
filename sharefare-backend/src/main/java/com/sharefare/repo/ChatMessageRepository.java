package com.sharefare.repo;

import com.sharefare.model.Booking;
import com.sharefare.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
  List<ChatMessage> findByBookingOrderByCreatedAtAsc(Booking booking);
}
