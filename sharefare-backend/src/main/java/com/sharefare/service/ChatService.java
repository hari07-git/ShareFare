package com.sharefare.service;

import com.sharefare.dto.ChatDtos.ChatMessageResponse;
import com.sharefare.exception.ApiException;
import com.sharefare.model.Booking;
import com.sharefare.model.ChatMessage;
import com.sharefare.model.User;
import com.sharefare.repo.BookingRepository;
import com.sharefare.repo.ChatMessageRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ChatService {

  private final ChatMessageRepository chatMessageRepository;
  private final BookingRepository bookingRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;

  public ChatService(ChatMessageRepository chatMessageRepository,
                     BookingRepository bookingRepository,
                     UserRepository userRepository,
                     NotificationService notificationService) {
    this.chatMessageRepository = chatMessageRepository;
    this.bookingRepository = bookingRepository;
    this.userRepository = userRepository;
    this.notificationService = notificationService;
  }

  @Transactional(readOnly = true)
  public List<ChatMessageResponse> getMessages(Long bookingId, String userEmail) {
    Booking booking = getAccessibleBooking(bookingId, userEmail);
    return chatMessageRepository.findByBookingOrderByCreatedAtAsc(booking)
        .stream()
        .map(msg -> new ChatMessageResponse(
            msg.getId(),
            msg.getSender().getId(),
            msg.getSender().getFullName(),
            msg.getContent(),
            msg.getCreatedAt()
        )).toList();
  }

  @Transactional
  public ChatMessageResponse sendMessage(Long bookingId, String userEmail, String content) {
    Booking booking = getAccessibleBooking(bookingId, userEmail);
    User sender = userRepository.findByEmailIgnoreCase(userEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

    ChatMessage message = new ChatMessage();
    message.setBooking(booking);
    message.setSender(sender);
    message.setContent(content);
    chatMessageRepository.save(message);

    User recipient = booking.getPassenger().getId().equals(sender.getId()) 
        ? booking.getRide().getDriver() 
        : booking.getPassenger();

    notificationService.create(
        recipient,
        "MESSAGE",
        "New message from " + sender.getFullName(),
        "\"" + content + "\""
    );

    return new ChatMessageResponse(
        message.getId(),
        sender.getId(),
        sender.getFullName(),
        message.getContent(),
        message.getCreatedAt()
    );
  }

  private Booking getAccessibleBooking(Long bookingId, String userEmail) {
    User user = userRepository.findByEmailIgnoreCase(userEmail)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    
    Booking booking = bookingRepository.findById(bookingId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));

    boolean isPassenger = booking.getPassenger().getId().equals(user.getId());
    boolean isDriver = booking.getRide().getDriver().getId().equals(user.getId());

    if (!isPassenger && !isDriver) {
      throw new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this booking chat");
    }

    return booking;
  }
}
