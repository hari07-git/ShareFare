export const testUser = {
  id: 7,
  email: "hari.qa@sharefare.test",
  fullName: "Hari QA",
  role: "USER",
  emailVerified: true,
  accountStatus: "ACTIVE",
  collegeVerified: true,
  phone: "9876543210",
  gender: "Male",
  collegeName: "Malla Reddy University",
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
    pricePerSeat: 75,
    status: "OPEN",
    driverName: "Ananya Reddy",
    driverEmail: "ananya@sharefare.test",
    driverPhone: "9876500001",
    vehicleName: "Hyundai i20",
    vehicleNumber: "TS09QA1234",
    driverRating: 4.9,
    pickupLat: 17.4401,
    pickupLng: 78.3489,
    dropLat: 17.4486,
    dropLng: 78.3908,
    pickupNote: "Near DLF gate",
    dropNote: "Cyber Towers entrance"
  },
  {
    id: 102,
    origin: "JNTU Hyderabad",
    destination: "Madhapur",
    departureTime: "2026-05-28T10:15:00+05:30",
    availableSeats: 2,
    totalSeats: 4,
    pricePerSeat: 90,
    status: "OPEN",
    driverName: "Rahul Varma",
    driverEmail: "rahul@sharefare.test",
    driverPhone: "9876500002",
    vehicleName: "Honda City",
    vehicleNumber: "TS10QA5678",
    driverRating: 4.7,
    pickupLat: 17.4933,
    pickupLng: 78.3915,
    dropLat: 17.4483,
    dropLng: 78.3915
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
    status: "REQUESTED",
    createdAt: "2026-05-24T10:00:00+05:30"
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
