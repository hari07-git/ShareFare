package com.sharefare.repo;

import com.sharefare.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  boolean existsByPhone(String phone);

  boolean existsByPhoneAndIdNot(String phone, Long id);

  boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

  int countByHashedRollNumberAndIdNot(String hashedRollNumber, Long id);

  List<User> findTop10ByOrderByIdDesc();
}
