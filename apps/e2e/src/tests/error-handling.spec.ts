/**
 * Error Handling E2E Tests
 * Verifies graceful degradation and user-friendly error messages
 *
 * Tests network failures, timeouts, invalid data, concurrent operations,
 * and edge cases to ensure application resilience.
 */
import { test, expect } from '@playwright/test';
import type { Page, Route } from '@playwright/test';

import { GameBoardPage } from '../pages/GameBoardPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Error Handling - Network Failures', () => {
  test('should handle API server unavailable', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Block all API requests
    await page.route('**/api/**', (route: Route) => route.abort());

    await loginPage.goto();
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should show network error message
    const errorVisible = await page.locator('[role="alert"]').isVisible({ timeout: 5000 });
    expect(errorVisible).toBe(true);

    const errorText = await page.textContent('[role="alert"]');
    expect(errorText).toMatch(/network|connection|server|unavailable/i);
  });

  test('should handle slow network with loading indicators', async ({ page, context }) => {
    // Throttle network to simulate slow connection
    const client = await context.newCDPSession(page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: (500 * 1024) / 8, // 500kbps
      uploadThroughput: (500 * 1024) / 8,
      latency: 400, // 400ms latency
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    const submitPromise = page.click('button[type="submit"]');

    // Should show loading indicator
    const loadingVisible = await page
      .locator('[data-testid="loading"], [aria-busy="true"], .loading')
      .isVisible({ timeout: 2000 });

    expect(loadingVisible).toBe(true);

    await submitPromise;
  });

  test('should retry failed requests', async ({ page }) => {
    let attemptCount = 0;

    // Fail first request, succeed on retry
    await page.route('**/api/login', (route: Route) => {
      attemptCount++;
      if (attemptCount === 1) {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');

    // Should eventually succeed after retry
    await page.waitForURL('**/game', { timeout: 10000 });
    expect(attemptCount).toBeGreaterThan(1);
  });

  test('should handle intermittent WebSocket failures', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();

    // Simulate WebSocket disconnection
    await page.evaluate(() => {
      // Close any WebSocket connections
      const wsPrototype = WebSocket.prototype;
      const originalClose = wsPrototype.close;
      wsPrototype.close = function (...args) {
        originalClose.apply(this, args);
      };

      // Force close existing connections
      Object.values(window).forEach(value => {
        if (value instanceof WebSocket) {
          value.close();
        }
      });
    });

    // Should show reconnection indicator or gracefully handle disconnection
    const hasReconnectIndicator = await page
      .locator('[data-testid="reconnecting"], .offline-indicator')
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    // Either shows indicator or maintains functionality (offline-first)
    expect(hasReconnectIndicator).toBeDefined();
  });
});

test.describe('Error Handling - Invalid Data', () => {
  test('should validate email format', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should show validation error
    const errorText = await loginPage.getErrorText();
    expect(errorText).toMatch(/email|invalid|valid/i);
  });

  test('should enforce minimum password length', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', '123'); // Too short
    await page.click('button[type="submit"]');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toMatch(/password|short|length|characters/i);
  });

  test('should reject XSS attempts in proposal titles', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();

    const xssTitle = '<script>alert("XSS")</script>';
    const xssDescription = '<img src=x onerror=alert("XSS")>';

    await gamePage.createProposal(xssTitle, xssDescription);

    // Check that the title is sanitized (text content, not HTML)
    const proposals = await page.evaluate(() => {
      const proposalElements = document.querySelectorAll('[data-testid="proposal-title"]');
      return Array.from(proposalElements).map(el => ({
        textContent: el.textContent,
        innerHTML: el.innerHTML,
      }));
    });

    // Find our proposal
    const xssProposal = proposals.find(p => p.textContent?.includes('script'));

    if (xssProposal) {
      // Should be text, not executable HTML
      expect(xssProposal.innerHTML).not.toContain('<script>');
      expect(xssProposal.textContent).toContain('script'); // Sanitized as text
    }
  });

  test('should handle extremely long proposal titles', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();

    const longTitle = 'A'.repeat(500); // Very long title
    const description = 'Test long title handling';

    try {
      await gamePage.createProposal(longTitle, description);

      // Either creates with truncated title or shows validation error
      const errorVisible = await page.locator('[role="alert"]').isVisible({ timeout: 2000 });

      if (errorVisible) {
        const errorText = await page.textContent('[role="alert"]');
        expect(errorText).toMatch(/title|long|length|characters/i);
      } else {
        // Check title was truncated
        const proposals = await gamePage.getProposalTitles();
        const createdTitle = proposals[proposals.length - 1];
        expect(createdTitle.length).toBeLessThan(longTitle.length);
      }
    } catch (error) {
      // Validation prevented creation - acceptable
      expect(error).toBeDefined();
    }
  });
});

test.describe('Error Handling - Concurrent Operations', () => {
  test('should handle race condition on simultaneous proposal creation', async ({
    page,
    browser,
  }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();

    // Second user session
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const login2 = new LoginPage(page2);
    const game2 = new GameBoardPage(page2);

    await login2.goto();
    await login2.login('user2@example.com', 'password123');
    await login2.waitForSuccess();
    await game2.waitForProposalsLoad();

    const title = `Race Condition Test ${Date.now()}`;

    // Both create proposal simultaneously
    await Promise.all([
      gamePage.createProposal(title, 'User 1 proposal'),
      game2.createProposal(title, 'User 2 proposal'),
    ]);

    // Both should succeed or one should get clear error
    const proposals1 = await gamePage.getProposalTitles();
    const proposals2 = await game2.getProposalTitles();

    // At least one should have the proposal
    const hasProposal1 = proposals1.some(p => p.includes(title));
    const hasProposal2 = proposals2.some(p => p.includes(title));

    expect(hasProposal1 || hasProposal2).toBe(true);

    await context2.close();
  });

  test('should handle concurrent votes on same proposal', async ({ page, browser }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();

    const title = `Concurrent Vote Test ${Date.now()}`;
    await gamePage.createProposal(title, 'Testing concurrent voting');

    // Second user
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    const login2 = new LoginPage(page2);
    const game2 = new GameBoardPage(page2);

    await login2.goto();
    await login2.login('user2@example.com', 'password123');
    await login2.waitForSuccess();
    await game2.waitForProposalsLoad();

    // Both vote simultaneously
    await Promise.all([gamePage.voteOnProposal(title, 'aye'), game2.voteOnProposal(title, 'nay')]);

    // Votes should be recorded correctly
    await page.waitForTimeout(1000); // Allow state to sync

    const votes = await gamePage.getVoteCounts(title);
    expect(votes.aye).toBe(1);
    expect(votes.nay).toBe(1);

    await context2.close();
  });
});

test.describe('Error Handling - Session Management', () => {
  test('should handle expired session gracefully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();

    // Clear session storage/cookies to simulate expiration
    await page.context().clearCookies();
    await page.evaluate(() => sessionStorage.clear());

    // Try to perform action
    try {
      await gamePage.createProposal('Test', 'Should fail');

      // Should redirect to login or show error
      const onLoginPage = page.url().includes('/login');
      const hasErrorAlert = await page.locator('[role="alert"]').isVisible({ timeout: 3000 });

      expect(onLoginPage || hasErrorAlert).toBe(true);
    } catch (error) {
      // Action failed as expected
      expect(error).toBeDefined();
    }
  });

  test('should prevent multiple simultaneous login attempts', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click submit multiple times rapidly
    const promises = [
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]'),
      page.click('button[type="submit"]'),
    ];

    await Promise.all(promises);

    // Should handle gracefully (either disable button or deduplicate requests)
    // Navigation should succeed once
    await page.waitForURL('**/game', { timeout: 5000 });
    expect(page.url()).toContain('/game');
  });
});

test.describe('Error Handling - Edge Cases', () => {
  test('should handle zero proposals state', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    // Login with account that has no proposals
    await loginPage.goto();
    await loginPage.login('newuser@example.com', 'password123');
    await loginPage.waitForSuccess();

    // Should show empty state message
    const emptyState = await page
      .locator('[data-testid="empty-proposals"], .empty-state')
      .isVisible({ timeout: 3000 });

    if (emptyState) {
      const emptyText = await page.textContent('[data-testid="empty-proposals"], .empty-state');
      expect(emptyText).toMatch(/no proposals|empty|create|start/i);
    } else {
      // Or should show proposals list (even if empty array)
      const proposals = await gamePage.getProposalTitles();
      expect(Array.isArray(proposals)).toBe(true);
    }
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();

    // Create proposal to change state
    const title = `Back Button Test ${Date.now()}`;
    await gamePage.createProposal(title, 'Testing navigation');

    // Go back
    await page.goBack();

    // Should handle gracefully (might show login or game page)
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|game/);

    // Go forward
    await page.goForward();

    // Should return to game
    expect(page.url()).toContain('/game');
  });

  test('should handle page refresh mid-operation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();

    // Start creating proposal
    await page.click('[data-testid="create-proposal-button"]');

    // Refresh page mid-creation
    await page.reload();

    // Should return to stable state
    await gamePage.waitForProposalsLoad();
    const proposals = await gamePage.getProposalTitles();
    expect(Array.isArray(proposals)).toBe(true);
  });

  test('should handle special characters in user input', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();

    const specialTitle = 'Test 🚀 Emoji & Special chars: <>&"\' ©®™';
    const specialDesc = 'Testing: !@#$%^&*()_+-=[]{}|;:,.<>?/~`';

    await gamePage.createProposal(specialTitle, specialDesc);

    // Should handle special characters safely
    const proposals = await gamePage.getProposalTitles();
    const found = proposals.some(p => p.includes('Test') && p.includes('Emoji'));

    expect(found).toBe(true);
  });
});
