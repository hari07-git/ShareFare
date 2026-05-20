package com.sharefare.service;

import com.sharefare.model.User;
import com.sharefare.repo.UserRepository;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class FraudDetectionService {
  private final UserRepository userRepository;

  public FraudDetectionService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  public String hashValue(String value) {
    if (value == null) return null;
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      byte[] hash = digest.digest(value.trim().toLowerCase().getBytes());
      return HexFormat.of().formatHex(hash);
    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException(e);
    }
  }

  public boolean isDuplicateRollNumber(String rollNumber, Long excludeUserId) {
    if (rollNumber == null || rollNumber.isBlank()) return false;
    String hash = hashValue(rollNumber);
    return userRepository.countByHashedRollNumberAndIdNot(hash, excludeUserId) > 0;
  }
}
