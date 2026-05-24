# ShareFare Testing & Monitoring

This document describes the production QA pipeline for the ShareFare React + Vite frontend.

## Tooling

- **Playwright** catches broken pages, failed user journeys, browser runtime crashes, console errors, failed API responses, visual regressions, and responsive layout overflows.
- **Lighthouse** audits performance, accessibility, best practices, SEO, and mobile usability on production-like Vite preview builds.
- **Sentry** captures production frontend crashes, API failures, browser/device context, session replay, and performance traces.

## Frontend Scripts

Run from `sharefare-frontend`:

```bash
npm run build
npm run test:e2e
npm run test:mobile
npm run test:visual
npm run lighthouse
npm run test:all
```

Reports and artifacts:

- `playwright-report/` — interactive HTML report
- `test-results/` — videos, traces, screenshots, JSON report
- `lighthouse-report/` — Lighthouse HTML/JSON reports and summary

## Playwright Coverage

The suite currently covers:

- authentication: signup, duplicate prevention, login, invalid password, password visibility, logout, token persistence
- ride search: Find Ride page, filters, ride cards, route details
- offer ride: form validation, pickup/drop inputs, map panel, publish success
- booking: ride detail, seat selection, booking request creation
- booking request management: accept/reject, passenger details, status changes
- profile: profile data, edit save path, safety/account sections
- mobile responsiveness: iPhone 14, iPhone SE, Pixel 7, Samsung Galaxy-sized viewports
- visual captures: Home, Find Ride, Ride Details, Offer Ride, Profile, Booking Requests

Quality guards fail tests when:

- a React/runtime crash appears
- unexpected browser console errors occur
- an uncaught page error occurs
- `/api/` responses return `5xx`
- horizontal page overflow exceeds 2px

## Visual Regression

By default, visual tests attach full-page screenshots without failing on pixel differences.

To enable strict baselines:

```bash
VISUAL_BASELINE=1 npm run test:visual
```

Commit generated baseline snapshots only after manually reviewing them.

## Lighthouse

`npm run lighthouse` builds the app, starts `vite preview` on `127.0.0.1:4173`, and audits:

- `/`
- `/rides/find`
- `/auth/login`

Default thresholds:

- Performance: 85+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 80+

Override thresholds when needed:

```bash
LH_PERFORMANCE_MIN=0.8 LH_ACCESSIBILITY_MIN=0.9 npm run lighthouse
```

## Sentry

Runtime monitoring is enabled only when `VITE_SENTRY_DSN` is set.

Frontend environment variables:

```bash
VITE_SENTRY_DSN=
VITE_SENTRY_RELEASE=sharefare-web@0.1.0
VITE_SENTRY_TRACES_SAMPLE_RATE=0.2
VITE_SENTRY_REPLAY_SESSION_SAMPLE_RATE=0.05
VITE_SENTRY_REPLAY_ERROR_SAMPLE_RATE=1.0
```

CI/deploy source-map upload variables:

```bash
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=sharefare-web
```

Do not expose `SENTRY_AUTH_TOKEN` in the browser. It is only for CI/deployment source-map uploads.

## GitHub Actions

`.github/workflows/qa.yml` runs on pushes and pull requests:

1. backend Maven tests
2. frontend production build
3. desktop Playwright tests
4. mobile Playwright tests
5. Lighthouse audits
6. artifact upload for Playwright and Lighthouse reports

If any required QA step fails, the workflow fails.
