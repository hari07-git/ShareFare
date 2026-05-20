package com.sharefare.service;

import com.sharefare.model.User;
import org.springframework.stereotype.Service;

@Service
public class TrustScoringService {

  public int calculateTrustScore(User user, int completedRides, int canceledRides, int activeReports) {
    int score = 50; // Base score

    if (user.isEmailVerified()) score += 10;
    if (user.isCollegeVerified()) score += 20;
    if ("ADMIN_VERIFIED".equals(user.getVerificationStatus())) score += 10;

    // Add for completed rides
    score += Math.min(completedRides * 2, 20);

    // Penalize for cancellations
    score -= Math.min(canceledRides * 5, 20);

    // Major penalty for safety reports
    score -= Math.min(activeReports * 30, 80);

    // Normalize 0-100
    return Math.max(0, Math.min(100, score));
  }

  public String getTrustLevel(int score) {
    if (score >= 90) return "TRUSTED_RIDER";
    if (score >= 70) return "GOLD";
    if (score >= 50) return "SILVER";
    return "BRONZE";
  }
}
