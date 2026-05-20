package com.sharefare.controller;

import com.sharefare.model.SafetyReport;
import com.sharefare.repo.SafetyReportRepository;
import com.sharefare.security.JwtService;
import com.sharefare.repo.UserRepository;
import com.sharefare.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

  private final SafetyReportRepository reportRepository;
  private final JwtService jwtService;
  private final UserRepository userRepository;

  public SafetyController(SafetyReportRepository reportRepository, JwtService jwtService, UserRepository userRepository) {
    this.reportRepository = reportRepository;
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @PostMapping("/report")
  public ResponseEntity<?> submitReport(@RequestHeader("Authorization") String authHeader,
                                        @RequestBody Map<String, String> payload) {
    Long reporterId = getUserId(authHeader);
    Long reportedId = Long.parseLong(payload.get("reportedUserId"));

    SafetyReport report = new SafetyReport();
    report.setReporterUserId(reporterId);
    report.setReportedUserId(reportedId);
    report.setReportType(payload.get("reportType"));
    report.setDescription(payload.get("description"));
    report.setSeverity(payload.get("severity"));
    report.setStatus("OPEN");
    
    reportRepository.save(report);

    return ResponseEntity.ok(Map.of("message", "Safety report submitted successfully. Our Trust & Safety team will review it."));
  }

  private Long getUserId(String authHeader) {
    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
      throw new RuntimeException("Unauthorized");
    }
    String token = authHeader.substring(7);
    String email = jwtService.extractSubject(token);
    if (email == null) {
       throw new RuntimeException("Unauthorized");
    }
    User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new RuntimeException("User not found"));
    return user.getId();
  }
}
