import { expect, test } from "@playwright/test";
import { loginAsUser, mockApi } from "./utils/mockApi";
import { attachFullPageScreenshot, expectNoHorizontalOverflow, installQualityGuards } from "./utils/quality";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("find ride search renders filters, cards, and opens route details", async ({ page }, testInfo) => {
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/rides/find");
  await expect(page.getByRole("heading", { name: /find/i })).toBeVisible();
  await expect(page.getByText(/Gachibowli/i)).toBeVisible();
  await expect(page.getByText(/HITEC City/i)).toBeVisible();
  await expect(page.getByText(/₹75|75/)).toBeVisible();
  await page.getByText(/Gachibowli/i).first().click();
  await expect(page).toHaveURL(/\/rides\/101/);
  await expect(page.getByText(/ride details|route|driver/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await attachFullPageScreenshot(page, testInfo, "find-ride-route-details");
  await assertClean();
});

test("offer ride validates route form, map panel, and publish success", async ({ page }, testInfo) => {
  await loginAsUser(page);
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/rides/offer");
  await expect(page.getByRole("heading", { name: /offer/i })).toBeVisible();

  await page.getByPlaceholder(/Pickup/i).fill("Malla Reddy University");
  await page.getByPlaceholder(/Drop/i).fill("HITEC City");
  await page.getByLabel(/Departure time/i).fill("2026-05-28T09:30");
  await page.getByPlaceholder(/\+91|9X/i).fill("9876543210");
  await page.getByPlaceholder(/Maruti|Swift|Activa|i20/i).fill("Hyundai i20");
  await page.getByPlaceholder(/TS09/i).fill("TS09QA1234");
  await page.getByPlaceholder(/near/i).fill("near MLRIT gate");
  await page.getByRole("button", { name: /publish ride/i }).click();

  await expect(page.getByText(/published|success|ride/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertClean();
});

test("booking flow creates a request without duplicate actions", async ({ page }, testInfo) => {
  await loginAsUser(page);
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/rides/101");
  await expect(page.getByText(/Gachibowli/i)).toBeVisible();
  await expect(page.getByText(/HITEC City/i)).toBeVisible();
  await expect(page.getByText(/seats/i).first()).toBeVisible();

  await page.getByRole("button", { name: /book now/i }).first().click();
  await expect(page.getByText(/booking request sent|requested/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /book now/i })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await assertClean();
});
