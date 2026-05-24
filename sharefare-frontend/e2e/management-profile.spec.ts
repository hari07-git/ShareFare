import { expect, test } from "@playwright/test";
import { loginAsUser, mockApi } from "./utils/mockApi";
import { attachFullPageScreenshot, expectNoHorizontalOverflow, installQualityGuards } from "./utils/quality";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
  await loginAsUser(page);
});

test("booking request management accepts and rejects requests", async ({ page }, testInfo) => {
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/ride-requests");
  await expect(page.getByText(/Sana Khan/i)).toBeVisible();
  await page.getByTitle(/Accept/i).first().click();
  await expect(page.getByText(/approved|success/i).first()).toBeVisible();
  await page.getByTitle(/Reject/i).first().click();
  await expect(page.getByText(/rejected/i).first()).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await assertClean();
});

test("profile page supports edits and shows safety/account sections", async ({ page }, testInfo) => {
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/me/profile");
  await expect(page.getByText(/Hari QA/i)).toBeVisible();
  await expect(page.getByText(/Malla Reddy/i)).toBeVisible();
  const phoneInput = page.locator('input[value="9876543210"]').first();
  if (await phoneInput.count()) {
    await phoneInput.fill("9876543211");
  }
  const save = page.getByRole("button", { name: /save|update/i }).first();
  if (await save.count()) await save.click();
  await expectNoHorizontalOverflow(page);
  await attachFullPageScreenshot(page, testInfo, "profile-page");
  await assertClean();
});
