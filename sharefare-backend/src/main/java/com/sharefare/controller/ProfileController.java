package com.sharefare.controller;

import com.sharefare.dto.ProfileDtos.MeResponse;
import com.sharefare.dto.ProfileDtos.UpdateMeRequest;
import com.sharefare.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class ProfileController {
  private final ProfileService profileService;

  public ProfileController(ProfileService profileService) {
    this.profileService = profileService;
  }

  @GetMapping
  public ResponseEntity<MeResponse> me(Authentication auth) {
    return ResponseEntity.ok(profileService.getMe(auth.getName()));
  }

  @PutMapping
  public ResponseEntity<MeResponse> update(@Valid @RequestBody UpdateMeRequest request, Authentication auth) {
    return ResponseEntity.ok(profileService.updateMe(auth.getName(), request));
  }
}
