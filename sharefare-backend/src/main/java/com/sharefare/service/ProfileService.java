package com.sharefare.service;

import com.sharefare.dto.ProfileDtos.MeResponse;
import com.sharefare.dto.ProfileDtos.UpdateMeRequest;
import com.sharefare.exception.ApiException;
import com.sharefare.repo.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {
  private final UserRepository userRepository;

  public ProfileService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Transactional(readOnly = true)
  public MeResponse getMe(String email) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    return new MeResponse(
        user.getId(),
        user.getEmail(),
        user.getFullName(),
        user.getPhone(),
        user.getCollegeId(),
        user.isCollegeVerified(),
        user.isEmailVerified(),
        user.getRole(),
        user.getCreatedAt(),
        user.getVerificationStatus(),
        user.getTrustScore(),
        user.getAccountStatus(),
        user.getGender(),
        user.getSafetyScore(),
        user.getTotalCompletedRides(),
        user.getCancellationRate()
    );
  }

  @Transactional
  public MeResponse updateMe(String email, UpdateMeRequest request) {
    var user = userRepository.findByEmailIgnoreCase(email)
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    user.setFullName(request.fullName());
    user.setPhone(request.phone());
    user.setCollegeId(request.collegeId());
    userRepository.save(user);
    return getMe(email);
  }
}
