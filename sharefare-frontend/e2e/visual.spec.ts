import { expect, test } from "@playwright/test";
import { loginAsUser, mockApi } from "./utils/mockApi";
import { attachFullPageScreenshot, expectNoHorizontalOverflow, installQualityGuards } from "./utils/quality";

const pages = [
  { path: "/", name: "home" },
  { path: "/rides/find", name: "find-ride" },
  { path: "/rides/101", name: "ride-details", auth: true },
  { path: "/rides/offer", name: "offer-ride", auth: true },
  { path: "/me/profile", name: "profile", auth: true },
  { path: "/ride-requests", name: "booking-requests", auth: true }
];

for (const item of pages) {
  test(`visual capture: ${item.name}`, async ({ page }, testInfo) => {
    await mockApi(page);
    if (item.auth) await loginAsUser(page);
    const assertClean = installQualityGuards(page, testInfo);
    await page.goto(item.path);
    await page.locator("body").waitFor({ state: "visible" });
    await expectNoHorizontalOverflow(page);

    if (process.env.VISUAL_BASELINE === "1") {
      await expect(page).toHaveScreenshot(`${item.name}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
        animations: "disabled"
      });
    } else {
      await attachFullPageScreenshot(page, testInfo, `${item.name}.png`);
    }

    await assertClean();
  });
}
