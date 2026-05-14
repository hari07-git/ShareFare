package com.sharefare.controller;

import com.sharefare.dto.AdminDtos.AdminMetricsResponse;
import com.sharefare.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final AdminService adminService;

  public AdminController(AdminService adminService) {
    this.adminService = adminService;
  }

  @PreAuthorize("hasRole('ADMIN')")
  @GetMapping("/metrics")
  public ResponseEntity<AdminMetricsResponse> metrics() {
    return ResponseEntity.ok(adminService.metrics());
  }
}

