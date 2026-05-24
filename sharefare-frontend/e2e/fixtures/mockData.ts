export const testUser = {
  id: 7,
  email: "hari.qa@sharefare.test",
  fullName: "Hari QA",
  role: "USER",
  emailVerified: true,
  accountStatus: "VERIFIED_STUDENT",
  collegeVerified: true,
  phone: "9876543210",
  gender: "Male",
  collegeName: "Malla Reddy University",
  collegeId: "malla-reddy-university",
  verificationStatus: "APPROVED",
  trustScore: 94,
  safetyScore: 96,
  totalCompletedRides: 14,
  cancellationRate: 2,
  bio: "Daily Hyderabad campus commuter.",
  genderPreference: "NO_PREFERENCE",
  emergencyContact: "9876500000",
  dailyCommuteRoutes: "Gachibowli → HITEC City",
  rating: 4.8
};

export const adminUser = {
  ...testUser,
  id: 1,
  email: "admin@sharefare.test",
  fullName: "Admin QA",
  role: "ADMIN"
};

export const rides = [
  {
    id: 101,
    origin: "Gachibowli",
    destination: "HITEC City",
    departureTime: "2026-05-28T09:30:00+05:30",
    availableSeats: 3,
    totalSeats: 4,
    seatsAvailable: 3,
    seatsTotal: 4,
    pricePerSeat: 75,
    status: "ACTIVE",
    driverName: "Ananya Reddy",
    driverEmail: "ananya@sharefare.test",
    driverPhone: "9876500001",
    driverGender: "Female",
    driverTrustScore: 9.6,
    driverCollegeName: "Malla Reddy University",
    femalePreferred: false,
    verifiedOnly: true,
    safetyLevel: "HIGH",
    vehicleName: "Hyundai i20",
    vehicleType: "Hyundai i20",
    vehicleNumber: "TS09QA1234",
    driverRating: 4.9,
    pickupLat: 17.4401,
    pickupLng: 78.3489,
    dropLat: 17.4486,
    dropLng: 78.3908,
    originLat: 17.4401,
    originLng: 78.3489,
    destinationLat: 17.4486,
    destinationLng: 78.3908,
    pickupNote: "Near DLF gate",
    dropNote: "Cyber Towers entrance",
    passengerCount: 1,
    earningsPreview: 75,
    bookingRequestCount: 1
  },
  {
    id: 102,
    origin: "JNTU Hyderabad",
    destination: "Madhapur",
    departureTime: "2026-05-28T10:15:00+05:30",
    availableSeats: 2,
    totalSeats: 4,
    seatsAvailable: 2,
    seatsTotal: 4,
    pricePerSeat: 90,
    status: "ACTIVE",
    driverName: "Rahul Varma",
    driverEmail: "rahul@sharefare.test",
    driverPhone: "9876500002",
    driverGender: "Male",
    driverTrustScore: 9.1,
    driverCollegeName: "JNTU Hyderabad",
    femalePreferred: false,
    verifiedOnly: false,
    safetyLevel: "MEDIUM",
    vehicleName: "Honda City",
    vehicleType: "Honda City",
    vehicleNumber: "TS10QA5678",
    driverRating: 4.7,
    pickupLat: 17.4933,
    pickupLng: 78.3915,
    dropLat: 17.4483,
    dropLng: 78.3915,
    originLat: 17.4933,
    originLng: 78.3915,
    destinationLat: 17.4483,
    destinationLng: 78.3915,
    pickupNote: "JNTU metro gate",
    dropNote: "Madhapur main road",
    passengerCount: 2,
    earningsPreview: 180,
    bookingRequestCount: 0
  }
];

export const bookingRequests = [
  {
    bookingId: 501,
    rideId: 101,
    passengerName: "Sana Khan",
    passengerEmail: "sana@sharefare.test",
    passengerPhone: "9876500999",
    seats: 1,
    seatsBooked: 1,
    status: "REQUESTED",
    createdAt: "2026-05-24T10:00:00+05:30",
    passengerGender: "Female",
    passengerTrustScore: 92,
    passengerSafetyScore: 95,
    passengerTotalCompletedRides: 8,
    passengerCancellationRate: 0,
    passengerVerified: true,
    passengerCollegeName: "Malla Reddy University"
  }
];

export const bookings = [
  {
    id: 401,
    status: "REQUESTED",
    seats: 1,
    ride: rides[0],
    createdAt: "2026-05-24T10:00:00+05:30"
  }
];

export const notifications = [
  {
    id: 301,
    title: "Booking request sent",
    message: "Your request for Gachibowli → HITEC City is pending driver approval.",
    category: "BOOKINGS",
    read: false,
    createdAt: "2026-05-24T10:05:00+05:30"
  }
];
