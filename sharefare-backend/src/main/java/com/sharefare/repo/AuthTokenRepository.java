package com.sharefare.repo;

import com.sharefare.model.AuthToken;
import com.sharefare.model.AuthTokenPurpose;
import com.sharefare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthTokenRepository extends JpaRepository<AuthToken, Long> {
  Optional<AuthToken> findByTokenAndPurposeAndUsedFalse(String token, AuthTokenPurpose purpose);

  Optional<AuthToken> findByUserAndTokenAndPurposeAndUsedFalse(User user, String token, AuthTokenPurpose purpose);

  void deleteByUserAndPurposeAndUsedFalse(User user, AuthTokenPurpose purpose);
}
