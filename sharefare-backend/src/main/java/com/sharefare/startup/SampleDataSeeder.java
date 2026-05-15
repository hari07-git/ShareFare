package com.sharefare.startup;

import com.sharefare.model.Ride;
import com.sharefare.model.RideStatus;
import com.sharefare.model.User;
import com.sharefare.model.UserRole;
import com.sharefare.repo.RideRepository;
import com.sharefare.repo.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class SampleDataSeeder implements ApplicationRunner {
  private final RideRepository rideRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final boolean enabled;
  private final int ridesToCreate;

  public SampleDataSeeder(RideRepository rideRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.sampleData.enabled:true}") boolean enabled,
                          @Value("${app.sampleData.rides:8}") int ridesToCreate) {
    this.rideRepository = rideRepository;
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.enabled = enabled;
    this.ridesToCreate = Math.max(0, ridesToCreate);
  }

  @Override
  public void run(ApplicationArguments args) {
    if (!enabled || ridesToCreate <= 0) return;
    if (rideRepository.count() > 0) return;

    User driver = ensureDriver();

    OffsetDateTime base = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1).withHour(8).withMinute(30).withSecond(0).withNano(0);
    var templates = List.of(
        tpl("Gachibowli", "Hitech City", 17.4401, 78.3489, 17.4456, 78.3772, 59),
        tpl("Kukatpally Metro", "JNTU College", 17.4940, 78.3990, 17.4936, 78.3912, 40),
        tpl("Miyapur", "Kondapur", 17.4965, 78.3576, 17.4630, 78.3628, 55),
        tpl("Secunderabad", "Ameerpet", 17.4399, 78.4983, 17.4375, 78.4483, 35),
        tpl("LB Nagar", "Dilsukhnagar", 17.3457, 78.5522, 17.3684, 78.5247, 30),
        tpl("Uppal", "Habsiguda", 17.4065, 78.5591, 17.4088, 78.5457, 25),
        tpl("HITEC City", "Financial District", 17.4456, 78.3772, 17.4148, 78.3418, 70),
        tpl("Mehdipatnam", "Golconda", 17.3953, 78.4400, 17.3833, 78.4011, 45)
    );

    for (int i = 0; i < ridesToCreate; i++) {
      var t = templates.get(i % templates.size());
      Ride r = new Ride();
      r.setDriver(driver);
      r.setOrigin(t.origin);
      r.setDestination(t.destination);
      r.setOriginLat(t.oLat);
      r.setOriginLng(t.oLng);
      r.setDestinationLat(t.dLat);
      r.setDestinationLng(t.dLng);
      r.setDepartureTime(base.plusHours(i));
      r.setSeatsTotal(3);
      r.setSeatsAvailable(3);
      r.setPricePerSeat(BigDecimal.valueOf(t.price));
      r.setStatus(RideStatus.OPEN);
      rideRepository.save(r);
    }
  }

  private User ensureDriver() {
    String email = "driver@sharefare.com";
    return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
      User u = new User();
      u.setEmail(email);
      u.setFullName("ShareFare Driver");
      u.setRole(UserRole.DRIVER);
      u.setCollegeVerified(true);
      u.setPasswordHash(passwordEncoder.encode("Driver@12345"));
      return userRepository.save(u);
    });
  }

  private static RideTemplate tpl(String origin,
                                 String destination,
                                 double oLat, double oLng,
                                 double dLat, double dLng,
                                 int price) {
    return new RideTemplate(origin, destination, oLat, oLng, dLat, dLng, price);
  }

  private record RideTemplate(String origin, String destination,
                              double oLat, double oLng,
                              double dLat, double dLng,
                              int price) {}
}

