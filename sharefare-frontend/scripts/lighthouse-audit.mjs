import fs from "node:fs/promises";
import path from "node:path";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://127.0.0.1:4173";
const outputDir = path.resolve("lighthouse-report");
const routes = [
  { name: "home", path: "/" },
  { name: "find-ride", path: "/rides/find" },
  { name: "login", path: "/auth/login" }
];

const thresholds = {
  performance: Number(process.env.LH_PERFORMANCE_MIN ?? 0.85),
  accessibility: Number(process.env.LH_ACCESSIBILITY_MIN ?? 0.9),
  "best-practices": Number(process.env.LH_BEST_PRACTICES_MIN ?? 0.9),
  seo: Number(process.env.LH_SEO_MIN ?? 0.8)
};

await fs.mkdir(outputDir, { recursive: true });

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless", "--no-sandbox", "--disable-gpu"] });
const failures = [];
const summary = [];

try {
  for (const route of routes) {
    const url = new URL(route.path, baseUrl).toString();
    const result = await lighthouse(url, {
      port: chrome.port,
      output: ["html", "json"],
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"]
    });

    if (!result?.lhr || !Array.isArray(result.report)) {
      throw new Error(`Lighthouse did not return a report for ${url}`);
    }

    const [html, json] = result.report;
    await fs.writeFile(path.join(outputDir, `${route.name}.html`), html);
    await fs.writeFile(path.join(outputDir, `${route.name}.json`), json);

    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, category]) => [key, category.score ?? 0])
    );
    summary.push({ route: route.path, scores });

    for (const [category, min] of Object.entries(thresholds)) {
      const score = scores[category] ?? 0;
      if (score < min) {
        failures.push(`${route.path} ${category}: ${Math.round(score * 100)} < ${Math.round(min * 100)}`);
      }
    }
  }
} finally {
  await chrome.kill();
}

await fs.writeFile(path.join(outputDir, "summary.json"), JSON.stringify(summary, null, 2));
console.table(summary.map((item) => ({
  route: item.route,
  performance: Math.round(item.scores.performance * 100),
  accessibility: Math.round(item.scores.accessibility * 100),
  bestPractices: Math.round(item.scores["best-practices"] * 100),
  seo: Math.round(item.scores.seo * 100)
})));

if (failures.length) {
  console.error("Lighthouse thresholds failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
