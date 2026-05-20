package com.sharefare.startup;

import com.sharefare.model.User;
import com.sharefare.model.UserRole;
import com.sharefare.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements ApplicationRunner {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final String adminEmail;
  private final String adminPassword;

  public AdminSeeder(UserRepository userRepository,
                     PasswordEncoder passwordEncoder,
                     @Value("${app.admin.email:}") String adminEmail,
                     @Value("${app.admin.password:}") String adminPassword) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.adminEmail = adminEmail == null ? "" : adminEmail.trim();
    this.adminPassword = adminPassword == null ? "" : adminPassword;
  }

  @Override
  public void run(ApplicationArguments args) {
    if (adminEmail.isBlank() || adminPassword.isBlank()) {
      return;
    }
    var existing = userRepository.findByEmailIgnoreCase(adminEmail);
    if (existing.isPresent()) {
      User admin = existing.get();
      if (admin.getRole() != UserRole.ADMIN) {
        return;
      }
      admin.setFullName("ShareFare Admin");
      admin.setPasswordHash(passwordEncoder.encode(adminPassword));
      admin.setCollegeVerified(true);
      admin.setEmailVerified(true);
      userRepository.save(admin);
      return;
    }

    User admin = new User();
    admin.setEmail(adminEmail.toLowerCase());
    admin.setFullName("ShareFare Admin");
    admin.setRole(UserRole.ADMIN);
    admin.setPasswordHash(passwordEncoder.encode(adminPassword));
    admin.setCollegeVerified(true);
    admin.setEmailVerified(true);
    userRepository.save(admin);
  }
}
