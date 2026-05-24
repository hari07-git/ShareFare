import { expect, test } from "@playwright/test";
import { loginAsUser, mockApi } from "./utils/mockApi";
import { attachFullPageScreenshot, expectNoHorizontalOverflow, installQualityGuards } from "./utils/quality";

const routes = [
  { path: "/", label: /ShareFare|Find a ride/i },
  { path: "/rides/find", label: /find/i },
  { path: "/rides/101", label: /Gachibowli|HITEC City/i },
  { path: "/rides/offer", label: /offer/i },
  { path: "/me/profile", label: /Hari QA|Profile/i },
  { path: "/ride-requests", label: /Sana Khan|request/i }
];

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await loginAsUser(page);
});

for (const route of routes) {
  test(`mobile layout is stable for ${route.path}`, async ({ page }, testInfo) => {
    const assertClean = installQualityGuards(page, testInfo);
    await page.goto(route.path);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator(`text=/${route.label.source}/i >> visible=true`).first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await attachFullPageScreenshot(page, testInfo, `mobile-${route.path.replaceAll("/", "-") || "home"}`);
    await assertClean();
  });
}
