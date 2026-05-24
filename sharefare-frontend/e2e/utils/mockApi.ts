import { Page } from "@playwright/test";
import { adminUser, bookingRequests, bookings, notifications, rides, testUser } from "../fixtures/mockData";

function json(body: unknown, status = 200) {
  return {
    status,
    contentType: "application/json",
    body: JSON.stringify(body)
  };
}

export async function mockApi(page: Page) {
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (method === "POST" && path === "/api/auth/register") {
      const payload = await request.postDataJSON().catch(() => ({}));
      if (payload.email === "existing@sharefare.test") {
        return route.fulfill(json({ message: "An account already exists with this email." }, 409));
      }
      return route.fulfill(json({ message: "Account created! We sent a 6-digit OTP to your email.", otp: null, emailVerified: false }));
    }

    if (method === "GET" && path === "/api/auth/check-email") {
      return route.fulfill(json(url.searchParams.get("email") === "existing@sharefare.test"));
    }

    if (method === "GET" && path === "/api/auth/check-phone") {
      return route.fulfill(json(url.searchParams.get("phone") === "9999999999"));
    }

    if (method === "POST" && path === "/api/auth/login") {
      const payload = await request.postDataJSON().catch(() => ({}));
      if (payload.password === "wrong-password") {
        return route.fulfill(json({ message: "Invalid credentials" }, 401));
      }
      return route.fulfill(json({ token: payload.email === adminUser.email ? "admin-token" : "user-token" }));
    }

    if (method === "POST" && path === "/api/auth/resend-verification") {
      return route.fulfill(json({ message: "Verification OTP sent." }));
    }

    if (method === "POST" && path === "/api/auth/forgot-password") {
      return route.fulfill(json({ message: "Password reset email sent. Check your inbox and spam." }));
    }

    if (method === "GET" && path === "/api/me") {
      const auth = request.headers().authorization ?? "";
      return route.fulfill(json(auth.includes("admin-token") ? adminUser : testUser));
    }

    if (method === "PUT" && path === "/api/me") {
      const payload = await request.postDataJSON().catch(() => ({}));
      return route.fulfill(json({ ...testUser, ...payload }));
    }

    if (method === "GET" && path === "/api/rides/search") {
      return route.fulfill(json({ content: rides, totalPages: 1, totalElements: rides.length, number: 0 }));
    }

    if (method === "GET" && /^\/api\/rides\/\d+$/.test(path)) {
      const ride = rides.find((item) => path.endsWith(String(item.id))) ?? rides[0];
      return route.fulfill(json(ride));
    }

    if (method === "GET" && /^\/api\/rides\/\d+\/reviews$/.test(path)) {
      return route.fulfill(json([{ id: 1, rating: 5, comment: "Clean ride and punctual driver", reviewerName: "Meera" }]));
    }

    if (method === "POST" && /^\/api\/rides\/\d+\/bookings$/.test(path)) {
      return route.fulfill(json({ id: 777, status: "REQUESTED", seats: 1, ride: rides[0] }));
    }

    if (method === "POST" && path === "/api/rides") {
      const payload = await request.postDataJSON().catch(() => ({}));
      return route.fulfill(json({ ...rides[0], ...payload, id: 909, status: "OPEN" }, 201));
    }

    if (method === "GET" && path === "/api/me/bookings") {
      return route.fulfill(json(bookings));
    }

    if (method === "GET" && path === "/api/me/driver/rides") {
      return route.fulfill(json(rides));
    }

    if (method === "GET" && /^\/api\/me\/driver\/rides\/\d+\/bookings$/.test(path)) {
      return route.fulfill(json(bookingRequests));
    }

    if (method === "POST" && /\/api\/me\/driver\/rides\/\d+\/bookings\/\d+\/(approve|reject)$/.test(path)) {
      const action = path.endsWith("approve") ? "DRIVER_APPROVED" : "REJECTED";
      return route.fulfill(json({ ...bookingRequests[0], status: action }));
    }

    if (method === "GET" && path === "/api/notifications") {
      return route.fulfill(json(notifications));
    }

    if (method === "GET" && path === "/api/notifications/unread-count") {
      return route.fulfill(json({ count: 1 }));
    }

    if (method === "POST" && path === "/api/notifications/read-all") {
      return route.fulfill(json({ message: "Notifications marked as read" }));
    }

    if (method === "GET" && path.startsWith("/api/admin/")) {
      return route.fulfill(json({ totalUsers: 15, totalRides: 8, totalBookings: 12, activeRides: 3 }));
    }

    return route.fulfill(json({ message: `Unhandled mocked route: ${method} ${path}` }, 404));
  });
}

export async function loginAsUser(page: Page) {
  await page.addInitScript(() => localStorage.setItem("sharefare_token", "user-token"));
}

export async function loginAsAdmin(page: Page) {
  await page.addInitScript(() => localStorage.setItem("sharefare_token", "admin-token"));
}
