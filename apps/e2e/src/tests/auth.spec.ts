/**
 * Authentication E2E Tests
 * Tests user login, logout, and session management
 *
 * NOTE: Political Sphere has ONE shared world. After login, all users
 * enter the same political simulation game world.
 */
import { test, expect } from "@playwright/test";

import { GameBoardPage } from "../pages/GameBoardPage";
import { LoginPage } from "../pages/LoginPage";

test.describe("Authentication Flow", () => {
  let loginPage: LoginPage;
  let gamePage: GameBoardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    gamePage = new GameBoardPage(page);
    await loginPage.goto();
  });

  test("should display login form", async () => {
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test("should login with valid credentials and enter game world", async ({ page }) => {
    // Use test credentials (assumes seed data exists)
    await loginPage.login("test@example.com", "password123");

    // Should redirect directly to the single game world
    await loginPage.waitForSuccess();
    await expect(page).toHaveURL(/\/game/);
    await expect(gamePage.proposalsList).toBeVisible();
  });

  test("should show error for invalid credentials", async () => {
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Should display error message
    await expect(loginPage.errorMessage).toBeVisible();
    const errorText = await loginPage.getErrorText();
    expect(errorText).toMatch(/invalid|incorrect|failed/i);
  });

  test("should show error for empty fields", async () => {
    await loginPage.loginButton.click();

    // Should show validation errors
    await expect(loginPage.errorMessage).toBeVisible();
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await loginPage.login("test@example.com", "password123");
    await loginPage.waitForSuccess();

    // Logout from game board
    await gamePage.leaveGame();

    // Should redirect to login page
    await expect(page).toHaveURL("/");
    await expect(loginPage.emailInput).toBeVisible();
  });

  test("should persist session on page reload", async ({ page }) => {
    // Login
    await loginPage.login("test@example.com", "password123");
    await loginPage.waitForSuccess();

    // Reload page
    await page.reload();

    // Should still be logged in (game world visible)
    await expect(page).toHaveURL(/\/game/);
    await expect(gamePage.proposalsList).toBeVisible();
  });

  test("should handle concurrent player sessions in same world", async ({ browser }) => {
    // Open two different browser contexts (two different players)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const login1 = new LoginPage(page1);
    const login2 = new LoginPage(page2);

    // Login with different accounts - both enter the SAME world
    await login1.goto();
    await login1.login("user1@example.com", "password123");
    await login1.waitForSuccess();

    await login2.goto();
    await login2.login("user2@example.com", "password123");
    await login2.waitForSuccess();

    // Both should be in the same game world (not separate instances)
    await expect(page1).toHaveURL(/\/game/);
    await expect(page2).toHaveURL(/\/game/);

    await context1.close();
    await context2.close();
  });
});
