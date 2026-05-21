# ShareFare Frontend (React + Tailwind)

## Setup

```bash
cd /Users/biyyani/ShareFare/sharefare-frontend
npm install
```

## Run

Make sure the backend is running on `http://localhost:8080`:

```bash
cd /Users/biyyani/ShareFare/sharefare-backend
mvn spring-boot:run
```

Then start the frontend:

```bash
cd /Users/biyyani/ShareFare/sharefare-frontend
npm run dev
```

## Config

- `VITE_API_BASE_URL` (default `http://localhost:8080`)

## Features covered (MVP)

- Landing page with real-world photos
- Auth: register/login (JWT stored in localStorage)
- Rides: search, details, offer (driver only)
- Bookings: create + cancel + history
- Booking lifecycle: request, driver approve/reject, confirm, start, complete
- Profile: view + update
- Reviews: list + create
- Notifications: grouped unread history with mark-as-read actions
- Admin: users, rides, bookings, activity, and income dashboard
- Maps: OpenStreetMap + Leaflet pins and OSRM road-following route previews
- Live ride tracking simulation with moving driver marker
