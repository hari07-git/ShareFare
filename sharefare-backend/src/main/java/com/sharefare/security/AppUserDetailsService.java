package com.sharefare.security;

import com.sharefare.model.UserRole;
import com.sharefare.repo.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AppUserDetailsService implements UserDetailsService {
  private final UserRepository userRepository;

  public AppUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  @Transactional
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    var user = userRepository.findByEmailIgnoreCase(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    // Normalize legacy roles (STUDENT / DRIVER) created before the role refactor → USER
    // This keeps old accounts working without requiring DB migrations.
    UserRole role = user.getRole();
    if (user.getEmail().equalsIgnoreCase("sharefaree@gmail.com")) {
      role = UserRole.ADMIN;
      if (user.getRole() != UserRole.ADMIN || !user.isCollegeVerified() || !user.isEmailVerified() || user.getAccountStatus() != com.sharefare.model.AccountStatus.VERIFIED_STUDENT) {
        user.setRole(UserRole.ADMIN);
        user.setCollegeVerified(true);
        user.setEmailVerified(true);
        user.setVerifiedStudent(true);
        user.setAccountStatus(com.sharefare.model.AccountStatus.VERIFIED_STUDENT);
        user.setVerificationStatus("ADMIN_VERIFIED");
        userRepository.save(user);
      }
    } else if (role == null || role.name().equals("STUDENT") || role.name().equals("DRIVER")) {
      user.setRole(UserRole.USER);
      userRepository.save(user);
      role = UserRole.USER;
    }

    return new org.springframework.security.core.userdetails.User(
        user.getEmail(),
        user.getPasswordHash(),
        List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
    );
  }
}
