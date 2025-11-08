/**
 * Smoke Test: Basic Health Checks
 *
 * Quick smoke tests that verify the application is running and responding.
 * These tests should run fast (<30s) and catch critical failures.
 *
 * Run with: npm run test:smoke
 */

import { expect, test } from "@playwright/test";

test.describe("Smoke Tests - Health Checks", () => {
  test("frontend should respond with 200 status", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
  });

  test("frontend should render without critical errors", async ({ page }) => {
    await page.goto("/");

    // Check that the page has loaded
    await expect(page.locator("body")).toBeVisible();

    // Check for critical console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    // Wait a moment for any errors to surface
    await page.waitForTimeout(2000);

    // Filter out known acceptable errors (if any)
    const criticalErrors = errors.filter(
      (error) => !error.includes("ResizeObserver") // Example: ignore non-critical warnings
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test("API health endpoint should respond", async ({ request }) => {
    const baseURL = process.env.API_BASE_URL || "http://localhost:3001";
    const response = await request.get(`${baseURL}/health`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("status");
    expect(data.status).toBe("healthy");
  });

  test("critical navigation should work", async ({ page }) => {
    await page.goto("/");

    // Test that basic navigation works
    // This depends on your app structure - adjust as needed
    const mainContent = page.locator('main, [role="main"], #root');
    await expect(mainContent).toBeVisible();
  });
});
