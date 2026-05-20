package com.sharefare.startup;

import com.sharefare.model.Booking;
import com.sharefare.model.BookingStatus;
import com.sharefare.model.Ride;
import com.sharefare.model.RideStatus;
import com.sharefare.model.User;
import com.sharefare.model.UserRole;
import com.sharefare.repo.BookingRepository;
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
  private final BookingRepository bookingRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final boolean enabled;
  private final int ridesToCreate;

  public SampleDataSeeder(RideRepository rideRepository,
                          BookingRepository bookingRepository,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.sampleData.enabled:true}") boolean enabled,
                          @Value("${app.sampleData.rides:8}") int ridesToCreate) {
    this.rideRepository = rideRepository;
    this.bookingRepository = bookingRepository;
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
        tpl("JNTU College", "HITEC City", 17.4936, 78.3912, 17.4456, 78.3772, 3, 55, "Hyundai i20", "TS09 SF 2147", "Pickup outside JNTU metro gate"),
        tpl("Gachibowli", "Madhapur", 17.4401, 78.3489, 17.4483, 78.3915, 2, 45, "Honda Activa", "TS08 SF 9132", "Near DLF Cyber City signal"),
        tpl("Kukatpally Metro", "Financial District", 17.4940, 78.3990, 17.4148, 78.3418, 4, 85, "Maruti Swift", "TS10 SF 7781", "Metro pillar KPHB-2"),
        tpl("LB Nagar", "Ameerpet", 17.3457, 78.5522, 17.4375, 78.4483, 3, 65, "Tata Nexon", "TS11 SF 4208", "LB Nagar metro entry B"),
        tpl("Secunderabad", "Gachibowli", 17.4399, 78.4983, 17.4401, 78.3489, 2, 90, "Toyota Glanza", "TS07 SF 1066", "Secunderabad clock tower"),
        tpl("Miyapur", "Kondapur", 17.4965, 78.3576, 17.4630, 78.3628, 3, 50, "Kia Sonet", "TS12 SF 5580", "Miyapur metro parking"),
        tpl("Uppal", "Habsiguda", 17.4065, 78.5591, 17.4088, 78.5457, 2, 30, "TVS Jupiter", "TS13 SF 6201", "Uppal metro bus bay"),
        tpl("University of Hyderabad", "Raheja Mindspace", 17.4584, 78.3301, 17.4416, 78.3818, 4, 60, "Mahindra XUV300", "TS09 SF 8824", "UoH main gate security point")
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
      r.setDepartureTime(base.plusMinutes(i * 45L));
      r.setSeatsTotal(t.seats);
      r.setSeatsAvailable(Math.max(1, t.seats - (i % 2)));
      r.setPricePerSeat(BigDecimal.valueOf(t.price));
      r.setVehicleType(t.vehicleType);
      r.setVehicleNumber(t.vehicleNumber);
      r.setPickupNote(t.pickupNote);
      r.setStatus(RideStatus.OPEN);
      rideRepository.save(r);
    }

    // Create a sample rider + 1 booking so "My bookings" isn't empty.
    User rider = ensureRider();
    var firstRide = rideRepository.findAll().stream().findFirst().orElse(null);
    if (firstRide != null && firstRide.getSeatsAvailable() > 0) {
      Booking b = new Booking();
      b.setRide(firstRide);
      b.setPassenger(rider);
      b.setSeatsBooked(1);
      b.setStatus(BookingStatus.CONFIRMED);
      bookingRepository.save(b);
      firstRide.setSeatsAvailable(firstRide.getSeatsAvailable() - 1);
      if (firstRide.getSeatsAvailable() == 0) firstRide.setStatus(RideStatus.FULL);
      rideRepository.save(firstRide);
    }
  }

  private User ensureDriver() {
    String email = "driver@sharefare.com";
    return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
      User u = new User();
      u.setEmail(email);
      u.setFullName("ShareFare Driver");
      u.setPhone("+91 98765 43210");
      u.setRole(UserRole.USER);
      u.setAccountStatus(com.sharefare.model.AccountStatus.VERIFIED_STUDENT);
      u.setCollegeVerified(true);
      u.setEmailVerified(true);
      u.setPasswordHash(passwordEncoder.encode("Driver@12345"));
      return userRepository.save(u);
    });
  }

  private User ensureRider() {
    String email = "student@sharefare.com";
    return userRepository.findByEmailIgnoreCase(email).orElseGet(() -> {
      User u = new User();
      u.setEmail(email);
      u.setFullName("ShareFare Student");
      u.setPhone("+91 91234 56789");
      u.setRole(UserRole.USER);
      u.setAccountStatus(com.sharefare.model.AccountStatus.VERIFIED_STUDENT);
      u.setCollegeVerified(true);
      u.setEmailVerified(true);
      u.setPasswordHash(passwordEncoder.encode("Student@12345"));
      return userRepository.save(u);
    });
  }

  private static RideTemplate tpl(String origin,
                                 String destination,
                                 double oLat, double oLng,
                                 double dLat, double dLng,
                                 int seats,
                                 int price,
                                 String vehicleType,
                                 String vehicleNumber,
                                 String pickupNote) {
    return new RideTemplate(origin, destination, oLat, oLng, dLat, dLng, seats, price, vehicleType, vehicleNumber, pickupNote);
  }

  private record RideTemplate(String origin, String destination,
                              double oLat, double oLng,
                              double dLat, double dLng,
                              int seats,
                              int price,
                              String vehicleType,
                              String vehicleNumber,
                              String pickupNote) {}
}
