import { expect, test } from "@playwright/test";
import { mockApi } from "./utils/mockApi";
import { expectNoHorizontalOverflow, installQualityGuards } from "./utils/quality";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("signup redirects to OTP verification and duplicate account is blocked", async ({ page }, testInfo) => {
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/auth/register");
  await expect(page.getByText(/create your account/i).first()).toBeVisible();

  const inputs = page.locator("input");
  await inputs.nth(0).fill("Hari QA");
  await inputs.nth(1).fill("hari.qa@sharefare.test");
  await inputs.nth(2).fill("9876543210");
  await page.locator("select").selectOption("MALE");
  await page.getByRole("button", { name: /select your college/i }).click();
  await page.getByRole("button", { name: /Malla Reddy/i }).first().click();
  await inputs.nth(3).fill("Testpass1");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page.getByText(/check your email/i)).toBeVisible();
  await expect(page).toHaveURL(/\/auth\/verify-otp\?email=/);
  await expectNoHorizontalOverflow(page);
  await assertClean();

  await page.goto("/auth/register");
  await inputs.nth(0).fill("Existing User");
  await inputs.nth(1).fill("existing@sharefare.test");
  await inputs.nth(1).blur();
  await expect(page.getByText(/account already exists/i)).toBeVisible();
});

test("login validates invalid password, toggles visibility, persists token, and logs out", async ({ page }, testInfo) => {
  const assertClean = installQualityGuards(page, testInfo);
  await page.goto("/auth/login");

  await page.locator('input[type="email"]').fill("hari.qa@sharefare.test");
  const password = page.locator('input[type="password"]');
  await password.fill("wrong-password");
  await page.getByRole("button", { name: /show password/i }).click();
  await expect(page.locator('input[type="text"]')).toHaveValue("wrong-password");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByText(/invalid credentials/i)).toBeVisible();

  await page.locator('input[type="text"]').fill("Testpass1");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/rides\/find/);
  await expect(page.evaluate(() => localStorage.getItem("sharefare_token"))).resolves.toBe("user-token");
  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page.evaluate(() => localStorage.getItem("sharefare_token"))).resolves.toBeNull();
  await expectNoHorizontalOverflow(page);
  await assertClean();
});
