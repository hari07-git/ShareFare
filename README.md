<div align="center">

<img src="docs/logo.png" alt="ShareFare Logo" width="220" />

# ShareFare

### Verified Campus Mobility Platform for Hyderabad Students

**Offer and book rides with verified college peers. Split costs, travel safely, build trust.**

---

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.4-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

</div>

---

## 📖 Overview

**ShareFare** is a production-grade, full-stack campus mobility platform built for Hyderabad college students. It lets any **verified student** offer or book rides — eliminating the need for a separate "driver" account. The platform emphasises **identity trust**, **safety preferences**, and a **premium UX** inspired by BlaBlaCar, Uber, and modern fintech apps.

> Built as a real engineering project demonstrating full-stack architecture, JWT security, interactive maps, admin workflows, and scalable Spring Boot APIs.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎓 **Verified Campus Network** | Only students with verified campus IDs can publish or book rides |
| 🏫 **College Name Selector** | Searchable dropdown with top 10 Hyderabad colleges + custom college entry |
| 🔐 **JWT Authentication** | Secure sign-up, login, and session management with role-based access |
| 🛡️ **Duplicate Account Prevention** | Real-time email & phone uniqueness checks block duplicate registrations |
| 🔑 **Password Strength Meter** | Visual complexity indicator with 8+ chars, uppercase, lowercase, number rules |
| 👁️ **Password Visibility Toggles** | Eye/Eye-off icons on login, register, and change password pages |
| 🗺️ **Interactive Live Maps** | Leaflet.js maps with real road routing via OSRM, pickup/drop pin placement |
| 🚗 **Offer & Edit/Delete Rides** | Full ride CRUD operations — publish, search, update details, delete, request, confirm |
| 👩‍💼 **Admin Dashboard** | Verify student IDs, moderate content, manage users and ride data |
| 🤖 **AI Support Assistant** | Built-in conversational support widget answering registration, booking, and safety questions |
| 📋 **Booking Lifecycle** | REQUESTED → DRIVER_APPROVED → CONFIRMED → ONGOING → COMPLETED |
| 🔔 **In-App Notifications** | Ride updates, booking approvals, verification status changes |
| 📧 **Transactional Email** | Brevo-powered verification, password reset, booking, and ride reminder emails |
| 🚺 **Gender Safety Preferences** | Female-commuter-only filter for safer travel options |
| 💬 **Extended Profile** | Bio, emergency contact, gender preference, and daily commute routes |
| 📊 **Trust Score System** | Dynamic trust badges, campus rings, CO₂ saved tracker, reliability score |
| 🩹 **Crash Recovery Screen** | High-fidelity Error Boundary to diagnose frontend failures and resume with one click |
| 🧪 **Automated QA Pipeline** | Playwright E2E/mobile/visual checks, Lighthouse audits, and Sentry runtime monitoring |
| 📱 **Responsive Premium UI** | Glassmorphism, dark mode hero sections, Framer Motion micro-animations |

---

## 🖥️ Screenshots

| Landing Page | Find a Ride | Offer a Ride |
|---|---|---|
| ![Landing](docs/screenshots/landing.png) | ![Find Ride](docs/screenshots/find-ride.png) | ![Offer Ride](docs/screenshots/offer-ride.png) |

| Profile Dashboard | Admin Panel | My Bookings |
|---|---|---|
| ![Profile](docs/screenshots/profile.png) | ![Admin](docs/screenshots/admin.png) | ![My Bookings](docs/screenshots/my-bookings.png) |

---

## 🌟 Featured Highlights & Premium Capabilities

### 🤖 AI Support Assistant (Chatbot)
ShareFare includes an in-app conversational AI support agent designed to guide students and simplify carpooling logistics:
* **Instant Onboarding Help:** Answers common queries about student ID verification, ride booking, fare splitting, and platform rules.
* **High-Premium Solid UI:** Crafted with a deep indigo-900 solid header, dynamic bounce-entry animations, message scroll canvas, active green notification indicator pulse, and reset/minimize controls.
* **Always Reachable:** Floating pill widget in the bottom-right corner, adapting seamlessly across desktop and mobile screens.

### 🔒 Trust, Safety, & Identity Verification
Designed to foster a highly secure and trusted campus network, avoiding standard open-market vulnerabilities:
* **Verified Campus Badges:** Once verified by admins, a green `"Verified Campus Student"` badge appears on the student's profile, search listings, and ride cards.
* **Searchable Campus Selector:** A clean, searchable dropdown featuring the top 10 college hubs in Hyderabad (e.g., JNTU, CBIT, VNR VJIET, BITS, OU), with custom-entry support if their college isn't listed.
* **Strict Duplication Prevention:** Strong backend validation blocking registration of duplicate emails or phone numbers. Integrated with real-time API-driven frontend checkers for instant signup feedback.
* **Extended Profile Metadata:** Complete student bio, safety rules, emergency contacts, daily commute routes, and an active trust completeness meter.

### 🚗 Active Ride Management & Responsive Booking
Car owner drivers have full control over their listed rides, integrated into a sleek responsive interface:
* **Active Booking CTA:** Replaced flat disabled screens with a dynamic booking widget. Shows interactive blue **"Book Now"** buttons, green **"Request Sent"** indicators, and high-visibility red **"Ride Full"** statuses.
* **Complete Owner CRUD Controls:** Drivers can **Edit Ride** details (seats, price, time, vehicle, constraints) in real-time, **Cancel/Delete** with a secure confirmation modal, or quickly **Repost** completed/cancelled rides with a single click.
* **Adaptive Actions:** Renders a clean action dropdown (⋮) on desktop viewports and a sticky bottom sheet modal on mobile devices.
* **Sticky Layout Optimization:** Compressed layouts keep essential prices and booking CTAs floating and visible without excessive scrolling.

---

## 🏗️ Architecture

```
sharefare/
├── sharefare-frontend/          # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/          # Reusable UI components + design system
│   │   ├── pages/               # Route-level page components
│   │   ├── state/               # Auth context and global state
│   │   ├── lib/                 # API client, geocoding, routing utils
│   │   └── index.css            # Global styles + Tailwind directives
│   └── public/
│       └── images/              # Hero images and assets
│
├── sharefare-backend/           # Spring Boot REST API
│   └── src/main/java/com/sharefare/
│       ├── controller/          # REST endpoints
│       ├── service/             # Business logic
│       ├── model/               # JPA entities
│       ├── dto/                 # Request/Response DTOs
│       ├── repo/                # Spring Data JPA repositories
│       ├── security/            # JWT filter, UserDetailsService
│       ├── config/              # CORS, Security, JPA config
│       ├── exception/           # Global exception handler
│       └── startup/             # Seed data + migration runners
│
└── docs/                        # Architecture docs and screenshots
```

**Request flow:**
```
Browser → React SPA → Axios (JWT header) → Spring Boot REST API
                                          → JPA / Hibernate
                                          → H2 (dev) / PostgreSQL (prod)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | Component-based UI framework |
| TypeScript | 5 | Type-safe JavaScript |
| Vite | 5 | Build tool and dev server |
| Tailwind CSS | 3 | Utility-first CSS |
| Framer Motion | 11 | Animations and micro-interactions |
| Leaflet.js | 1.9 | Interactive maps |
| React Router | 6 | Client-side routing |
| Axios | 1.7 | HTTP client with interceptors |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Java | 21 | Core language (LTS) |
| Spring Boot | 3.4 | REST API framework |
| Spring Security | 6 | Authentication and authorization |
| Spring Data JPA | 3.4 | ORM and repositories |
| JJWT | 0.12 | JWT token generation and validation |
| H2 Database | 2 | Local development DB |
| PostgreSQL | 16 | Production database |
| Maven | 3.9 | Build and dependency management |
| SpringDoc OpenAPI | 2.8 | Auto-generated API docs (Swagger UI) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm
- **Java** 21+
- **Maven** 3.9+
- (Optional) **Docker** for PostgreSQL

### 1. Clone the repository

```bash
git clone https://github.com/hari07-git/sharefare.git
cd sharefare
```

### 2. Configure environment variables

```bash
# Copy the example file and fill in your values
cp .env.example .env
```

Open `.env` and replace placeholders with real values. See [Environment Variables](#-environment-variables) section.

---

### 3. Start the Backend

```bash
cd sharefare-backend

# Run with local H2 database (no setup needed)
mvn spring-boot:run

# API will be available at: http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui/index.html
# H2 Console: http://localhost:8080/h2-console
```

### 4. Start the Frontend

```bash
cd sharefare-frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# App will be available at: http://localhost:5173
```

### 5. Run Production QA Checks

```bash
cd sharefare-frontend

# Production build
npm run build

# Desktop browser E2E checks
npm run test:e2e

# Mobile viewport checks
npm run test:mobile

# Lighthouse performance/accessibility audits
npm run lighthouse
```

Full QA, visual regression, CI, and Sentry setup details are in [`docs/testing-monitoring.md`](docs/testing-monitoring.md).

---

## 🔧 Environment Variables

Create a `.env` file in the project root by copying `.env.example`:

| Variable | Description | Example |
|---|---|---|
| `PORT` | Backend server port | `8080` |
| `DB_URL` | JDBC database URL | `jdbc:h2:file:./data/sharefare-local` |
| `DB_USER` | Database username | `sa` |
| `DB_PASSWORD` | Database password | *(empty for H2)* |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-random-secret-here` |
| `JWT_TTL_SECONDS` | Token expiry in seconds | `86400` |
| `ADMIN_EMAIL` | Initial admin account email | `admin@yourdomain.com` |
| `ADMIN_PASSWORD` | Initial admin account password | `StrongPassword@123` |
| `BREVO_API_KEY` | Brevo transactional email API key | `xkeysib-...` |
| `BREVO_SENDER` | Verified Brevo sender identity | `ShareFare <no-reply@yourdomain.com>` |
| `MAIL_SUPPORT_EMAIL` | Support email shown in outgoing emails | `support@yourdomain.com` |
| `VITE_API_BASE_URL` | Backend URL for the frontend | `http://localhost:8080` |
| `FRONTEND_BASE_URL` | Frontend URL for email links | `http://localhost:5173` |

> **Email delivery:** ShareFare uses Brevo transactional email only. Configure a verified sender in Brevo, then set `BREVO_API_KEY` and `BREVO_SENDER`.

---

## 📡 API Overview

The backend exposes a full REST API documented via **Swagger UI** at `/swagger-ui/index.html`.

| Module | Endpoint Prefix | Description |
|---|---|---|
| Auth | `POST /api/auth/register` | Register a new student account |
| Auth | `POST /api/auth/login` | Login and receive JWT |
| Profile | `GET /api/me` | Get current user profile |
| Rides | `POST /api/rides` | Publish a new ride |
| Rides | `GET /api/rides/search` | Search available rides |
| Rides | `PUT /api/rides/{id}` | Update ride details (seats, vehicle, price, departure) |
| Rides | `DELETE /api/rides/{id}` | Delete / cancel a ride |
| Bookings | `POST /api/bookings` | Book a ride |
| Bookings | `PATCH /api/bookings/{id}/confirm` | Confirm a booking |
| Admin | `GET /api/admin/verifications` | View pending verifications |
| Admin | `POST /api/admin/verify/{userId}` | Approve student verification |
| Notifications | `GET /api/me/notifications` | Get user notifications |

Full interactive docs: `http://localhost:8080/swagger-ui/index.html`

---

## 🌐 Deployment

### Frontend → Vercel / Netlify

```bash
cd sharefare-frontend
npm run build          # Builds to dist/
```

**Vercel deployment:**
1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Set root directory to `sharefare-frontend`
3. Add environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com`
4. Deploy

**Netlify deployment:**
1. Build command: `npm run build`
2. Publish directory: `sharefare-frontend/dist`

---

### Backend → Render / Railway

**Render:**
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect GitHub repo, set root directory to `sharefare-backend`
3. Build command: `mvn package -DskipTests`
4. Start command: `java -jar target/sharefare-backend-*.jar`
5. Add all environment variables from `.env.example`
6. Add a **PostgreSQL** database service and set `DB_URL`

**Railway:**
1. Create project, connect repo
2. Add PostgreSQL plugin
3. Set `DB_URL` from Railway's PostgreSQL connection string

**Required production environment variables:**
```
DB_URL=jdbc:postgresql://...
DB_USER=...
DB_PASSWORD=...
JWT_SECRET=<strong-random-secret-minimum-64-chars>
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>
BREVO_API_KEY=...
BREVO_SENDER=ShareFare <no-reply@yourdomain.com>
MAIL_SUPPORT_EMAIL=support@yourdomain.com
FRONTEND_BASE_URL=https://your-app.vercel.app
SAMPLE_DATA_ENABLED=false
```

---

## 📁 Project Structure

```
sharefare/
├── .env.example                        # Environment variables template
├── .gitignore                          # Security-focused gitignore
├── README.md                           # This file
│
├── sharefare-frontend/                 # React SPA
│   ├── public/
│   │   └── images/                    # Hero images and brand assets
│   ├── src/
│   │   ├── components/                # UI components
│   │   │   ├── AuthShell.tsx          # Auth page layout
│   │   │   ├── DarkMap.tsx            # Interactive Leaflet map
│   │   │   ├── LiveRideTracker.tsx    # Real-time route simulation
│   │   │   ├── Navbar.tsx             # Top navigation
│   │   │   └── design-system.tsx      # Design tokens & layout
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Public hero page
│   │   │   ├── HomePage.tsx           # Authenticated dashboard
│   │   │   ├── FindRidePage.tsx       # Search + map view
│   │   │   ├── OfferRidePage.tsx      # Publish a ride
│   │   │   ├── RideDetailsPage.tsx    # Ride detail + booking
│   │   │   ├── ProfilePage.tsx        # User profile dashboard
│   │   │   ├── NotificationsPage.tsx  # Notifications inbox
│   │   │   └── AdminPage.tsx          # Admin moderation panel
│   │   ├── state/
│   │   │   └── auth.tsx               # Auth context (JWT, user state)
│   │   └── lib/
│   │       ├── api.ts                 # Axios client with JWT interceptor
│   │       ├── geocode.ts             # Nominatim place search
│   │       └── route.ts               # Distance and fare estimation
│   └── package.json
│
├── sharefare-backend/                  # Spring Boot API
│   ├── src/main/java/com/sharefare/
│   │   ├── controller/                # REST controllers
│   │   ├── service/                   # Business logic
│   │   ├── model/                     # JPA entities
│   │   ├── dto/                       # Request/Response objects
│   │   ├── repo/                      # JPA repositories
│   │   ├── security/                  # JWT + Spring Security
│   │   ├── config/                    # App configuration
│   │   ├── exception/                 # Error handling
│   │   └── startup/                   # Data seeding + migration
│   ├── src/main/resources/
│   │   └── application.yml            # App config (uses env vars)
│   ├── docker-compose.yml             # PostgreSQL for local dev
│   └── pom.xml
│
└── docs/
    └── screenshots/                   # App screenshots
```

---

## 🗺️ Roadmap

- [x] JWT authentication with role-based access
- [x] Student verification workflow (admin approval)
- [x] Offer and book rides with map-first UI
- [x] Complete booking lifecycle management
- [x] In-app notifications + email reminders
- [x] Trust score and profile ecosystem
- [x] Gender safety preferences
- [x] Admin moderation dashboard
- [x] AI support assistant chat widget
- [x] Ride CRUD updates (editing and deleting published rides)
- [x] Searchable college name dropdown with top Hyderabad colleges
- [x] Strict duplicate email/phone prevention at backend + frontend
- [x] Password strength meter and visibility toggles
- [x] Extended profile (bio, emergency contact, commute routes)
- [x] College verification badge on profile and ride cards
- [x] Open Graph / SEO meta tags for social sharing
- [ ] Real-time WebSocket ride tracking
- [ ] Rating and review system post-ride
- [ ] Push notifications (Firebase)
- [ ] React Native mobile app
- [ ] Recurring route / commute subscriptions
- [ ] Payment integration (UPI via Razorpay)
- [ ] College-level leaderboards and rewards

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes with clear, atomic commits
4. Ensure the backend compiles: `mvn compile`
5. Ensure the frontend builds: `npm run build`
6. Open a Pull Request with a clear description

**Commit message format:**
```
feat: add ride cancellation endpoint
fix: correct JWT expiry calculation
chore: update spring boot to 3.4.6
docs: add deployment guide for Railway
```

---

## 🔒 Security

- **Never commit your `.env` file** — it's git-ignored for your protection
- JWT secrets must be at least 32 characters (64+ for production)
- Admin passwords must be changed after first login
- Use Gmail **App Passwords**, not your actual Google password
- Student ID images in `/uploads` are git-ignored (privacy)
- H2 database files (`.mv.db`) are git-ignored

Found a security issue? Email [sharefaree@gmail.com](mailto:sharefaree@gmail.com) privately.

---

## 📜 License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

**Hari Biyyani**

[![GitHub](https://img.shields.io/badge/GitHub-hari07--git-181717?style=flat-square&logo=github)](https://github.com/hari07-git)

---

<div align="center">

Built with ❤️ for the Hyderabad student community.

**ShareFare** — *Move smarter. Travel verified.*

</div>
