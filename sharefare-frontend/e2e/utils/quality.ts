import { expect, Page, TestInfo } from "@playwright/test";

const ignoredConsoleFragments = [
  "Download the React DevTools",
  "Failed to load resource: net::ERR_BLOCKED_BY_CLIENT",
  "Failed to load resource: the server responded with a status of 404",
  "ResizeObserver loop completed with undelivered notifications"
];

export function installQualityGuards(page: Page, testInfo: TestInfo) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedApis: string[] = [];

  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (ignoredConsoleFragments.some((fragment) => text.includes(fragment))) return;
    consoleErrors.push(text);
  });

  page.on("pageerror", (error) => {
    pageErrors.push(error.stack ?? error.message);
  });

  page.on("response", (response) => {
    const url = response.url();
    if (!url.includes("/api/")) return;
    if (response.status() >= 500) {
      failedApis.push(`${response.status()} ${url}`);
    }
  });

  return async () => {
    const crash = page.getByText(/Something went wrong|We hit a small issue loading this page|UI crashed/i);
    await expect(crash).toHaveCount(0);

    if (consoleErrors.length || pageErrors.length || failedApis.length) {
      await testInfo.attach("runtime-errors", {
        body: JSON.stringify({ consoleErrors, pageErrors, failedApis }, null, 2),
        contentType: "application/json"
      });
    }

    expect(consoleErrors, "Browser console errors").toEqual([]);
    expect(pageErrors, "Uncaught page errors").toEqual([]);
    expect(failedApis, "5xx API responses").toEqual([]);
  };
}

export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    return Math.max(doc.scrollWidth, body.scrollWidth) - window.innerWidth;
  });
  expect(overflow, "Page should not horizontally overflow").toBeLessThanOrEqual(2);
}

export async function attachFullPageScreenshot(page: Page, testInfo: TestInfo, name: string) {
  const screenshot = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body: screenshot, contentType: "image/png" });
}
