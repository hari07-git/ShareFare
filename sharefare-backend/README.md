# ShareFare Backend (Java / Spring Boot)

Student-focused ride sharing backend implementing auth (JWT), roles, rides, booking approvals, notifications, email updates, and profiles.

## Prereqs

- Java 21
- Maven 3.9+

## Run locally (default: H2 file DB)

By default the backend runs using an H2 file database (stored at `./data/sharefare`).

```bash
cd /Users/biyyani/ShareFare/sharefare-backend
mvn spring-boot:run
```

Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Run locally (PostgreSQL)

1) Start DB:

```bash
docker compose up -d
```

2) Start the API:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## Run locally (no Postgres, dev profile)

If Postgres isn’t running, you can start the API using the in-memory H2 dev profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Quick API flow (curl)

1) Register:

```bash
curl -s -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.edu","password":"Password123!","fullName":"Alice","role":"STUDENT"}'
```

After registration, ShareFare sends a 6-digit email OTP. Users must verify the OTP before login. Local/demo seeded users are already verified.

2) Login (copy the token):

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.edu","password":"Password123!"}'
```

3) Create a ride (register/login as a `DRIVER` user and set `TOKEN`):

```bash
curl -s -X POST http://localhost:8080/api/rides \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"origin":"Gachibowli","destination":"Hitech City","departureTime":"2030-01-01T10:00:00+05:30","seatsTotal":3,"pricePerSeat":50.0}'
```

4) Booking lifecycle:

- Rider requests: `POST /api/rides/{rideId}/bookings`
- Driver approves: `POST /api/me/driver/rides/{rideId}/bookings/{bookingId}/approve`
- Driver confirms pickup: `POST /api/me/driver/rides/{rideId}/bookings/{bookingId}/confirm`
- Driver starts ride: `POST /api/me/driver/rides/{rideId}/bookings/{bookingId}/start`
- Driver completes ride: `POST /api/me/driver/rides/{rideId}/bookings/{bookingId}/complete`
- Rider cancels: `DELETE /api/bookings/{bookingId}`

Statuses: `REQUESTED → DRIVER_APPROVED → CONFIRMED → ONGOING → COMPLETED`, or `REJECTED` / `CANCELLED`.

## Config

Environment variables:

- `DB_URL` (default `jdbc:h2:file:./data/sharefare;MODE=PostgreSQL;DB_CLOSE_DELAY=-1`)
- `DB_USER` (default `sa`)
- `DB_PASSWORD` (default empty)
- `JWT_SECRET` (default is insecure; set your own 32+ char secret)
- `JWT_TTL_SECONDS` (default `86400`)
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` (optional; if set, an admin account is created on first run)
- `MAIL_ENABLED` (set `true` to send real emails)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD` for Gmail SMTP
- `MAIL_FROM` and `MAIL_SUPPORT_EMAIL`
- `FRONTEND_BASE_URL` (used in password reset links)
- `REMINDERS_ENABLED` and `REMINDERS_FIXED_DELAY_MS` for scheduled ride reminders

Example (change before deploying):

```bash
export ADMIN_EMAIL="admin@sharefare.com"
export ADMIN_PASSWORD="YourStrongAdminPassword"
```

Gmail SMTP example:

```bash
export MAIL_ENABLED=true
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME="your-gmail@gmail.com"
export SMTP_PASSWORD="your-google-app-password"
export MAIL_FROM="ShareFare <your-gmail@gmail.com>"
export MAIL_SUPPORT_EMAIL="sharefaree@gmail.com"
export FRONTEND_BASE_URL="http://localhost:5173"
```

## Notes

- `/api/rides/{rideId}/tracking` is a placeholder response (Milestone 3) until Google Maps + real-time updates are added.
- CORS is enabled for `http://localhost:5173` for the React dev server.
- Admin metrics: `GET /api/admin/metrics` (requires `ADMIN` role).
