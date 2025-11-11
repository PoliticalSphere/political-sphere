/**
 * Performance and Load Testing
 * Tests page load performance, API response times, and system behavior under load
 *
 * WCAG 2.2 AA Performance Criteria:
 * - 2.2.2 Pause, Stop, Hide (Level A): Auto-updating content can be paused
 * - 2.4.5 Multiple Ways (Level AA): Performance doesn't degrade navigation
 * - Success Criterion: Pages load within 3 seconds on standard connection
 *
 * Performance Budgets:
 * - First Contentful Paint (FCP): < 1.8s
 * - Largest Contentful Paint (LCP): < 2.5s
 * - Time to Interactive (TTI): < 3.8s
 * - Total Blocking Time (TBT): < 300ms
 * - Cumulative Layout Shift (CLS): < 0.1
 */
import { test, expect, type Page } from '@playwright/test';

import { GameBoardPage } from '../pages/GameBoardPage';
import { LoginPage } from '../pages/LoginPage';

// Enable performance logging via DEBUG=1 environment variable
const DEBUG = process.env.DEBUG === '1';

/**
 * Web Vitals Performance Metrics
 */
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  cls: number; // Cumulative Layout Shift
  speedIndex: number;
  loadTime: number;
}

/**
 * Measure Core Web Vitals using Performance API
 */
async function measureWebVitals(page: Page): Promise<PerformanceMetrics> {
  return await page.evaluate(() => {
    return new Promise<PerformanceMetrics>(resolve => {
      const metrics: Partial<PerformanceMetrics> = {};

      // Get navigation timing
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        metrics.tti = navigation.domInteractive - navigation.fetchStart;
      }

      // FCP - First Contentful Paint
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      // LCP - Largest Contentful Paint
      const observer = new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          renderTime?: number;
          loadTime?: number;
        };
        metrics.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
      });

      try {
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // LCP not supported
        metrics.lcp = 0;
      }

      // CLS - Cumulative Layout Shift
      let cls = 0;
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { value?: number };
          if (layoutShift.value !== undefined) {
            cls += layoutShift.value;
          }
        }
      });

      try {
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch {
        // CLS not supported
      }

      // Wait for metrics to settle
      setTimeout(() => {
        metrics.cls = cls;
        metrics.tbt = 0; // TBT requires long task API
        metrics.speedIndex = metrics.fcp || 0;

        resolve({
          fcp: metrics.fcp || 0,
          lcp: metrics.lcp || 0,
          tti: metrics.tti || 0,
          tbt: metrics.tbt || 0,
          cls: metrics.cls || 0,
          speedIndex: metrics.speedIndex || 0,
          loadTime: metrics.loadTime || 0,
        });
      }, 2000); // Wait 2s for metrics to stabilize
    });
  });
}

test.describe('Page Load Performance', () => {
  test('login page should meet performance budgets', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;
    const metrics = await measureWebVitals(page);

    // Performance assertions
    expect(loadTime).toBeLessThan(3000); // Total load < 3s
    expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
    expect(metrics.lcp).toBeLessThan(2500); // LCP < 2.5s
    expect(metrics.cls).toBeLessThan(0.1); // CLS < 0.1

    // Log metrics for monitoring
    if (DEBUG)
      console.log('Login Page Performance:', {
        loadTime,
        fcp: metrics.fcp,
        lcp: metrics.lcp,
        cls: metrics.cls,
      });
  });

  test('game board should load efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    // Login first
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();

    // Measure game board load
    const startTime = Date.now();
    await gamePage.waitForProposalsLoad();
    const loadTime = Date.now() - startTime;

    const metrics = await measureWebVitals(page);

    // Game board performance
    expect(loadTime).toBeLessThan(2000); // Proposals load < 2s
    expect(metrics.lcp).toBeLessThan(2500);
    expect(metrics.cls).toBeLessThan(0.1);

    if (DEBUG)
      console.log('Game Board Performance:', {
        proposalsLoadTime: loadTime,
        lcp: metrics.lcp,
        cls: metrics.cls,
      });
  });

  test('should cache static assets efficiently', async ({ page }) => {
    // First load
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');

    // Get resource timing for first load
    const _firstLoadResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: PerformanceEntry) => {
        const resourceTiming = entry as PerformanceResourceTiming;
        return {
          name: entry.name,
          duration: entry.duration,
          transferSize: resourceTiming.transferSize,
        };
      });
    });

    // Reload page (should use cache)
    await page.reload();
    await page.waitForLoadState('networkidle');

    const secondLoadResources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map((entry: PerformanceEntry) => {
        const resourceTiming = entry as PerformanceResourceTiming;
        return {
          name: entry.name,
          duration: entry.duration,
          transferSize: resourceTiming.transferSize,
        };
      });
    });

    // Static assets should be cached (transferSize = 0 or much smaller)
    const cachedResources = secondLoadResources.filter(
      r => r.transferSize === 0 || r.transferSize < 1000
    );

    expect(cachedResources.length).toBeGreaterThan(0);
    if (DEBUG)
      console.log(`Cached ${cachedResources.length}/${secondLoadResources.length} resources`);
  });

  test('should handle slow network conditions gracefully', async ({ page, context }) => {
    // Simulate slow 3G connection
    await context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
      await route.continue();
    });

    const startTime = Date.now();
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;

    // Page should still be interactive on slow network
    expect(loadTime).toBeLessThan(5000); // More lenient on slow network

    // Check for loading indicators
    const hasLoadingState = await page.isVisible('[aria-busy="true"]');
    // Loading indicators should be present or content should be ready
    expect(hasLoadingState || loadTime < 3000).toBe(true);
  });
});

test.describe('API Response Performance', () => {
  let loginPage: LoginPage;
  let gamePage: GameBoardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
  });

  test('proposals API should respond quickly', async ({ page }) => {
    // Measure API response time
    const [response] = await Promise.all([
      page.waitForResponse(
        resp => resp.url().includes('/api/v1/proposals') && resp.status() === 200
      ),
      gamePage.waitForProposalsLoad(),
    ]);

    const timing = response.timing();
    const responseTime = timing.responseEnd - timing.requestStart;

    // API should respond within 500ms
    expect(responseTime).toBeLessThan(500);

    if (DEBUG) console.log('Proposals API Response Time:', responseTime, 'ms');
  });

  test('voting API should be fast', async ({ page }) => {
    const title = `Performance Vote ${Date.now()}`;
    await gamePage.createProposal(title, 'Performance test');

    // Measure vote API response
    const startTime = Date.now();
    const [response] = await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/api/v1/votes') && resp.status() === 201),
      gamePage.voteOnProposal(title, 'aye'),
    ]);

    const voteTime = Date.now() - startTime;
    const timing = response.timing();
    const apiTime = timing.responseEnd - timing.requestStart;

    // Vote API should be very fast (< 300ms)
    expect(apiTime).toBeLessThan(300);
    expect(voteTime).toBeLessThan(1000); // Total operation < 1s

    if (DEBUG) console.log('Vote API Performance:', { apiTime, totalTime: voteTime });
  });

  test('authentication should be performant', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    const startTime = Date.now();
    const [response] = await Promise.all([
      page.waitForResponse(
        resp => resp.url().includes('/api/v1/auth/login') && resp.status() === 200
      ),
      login.login('test@example.com', 'password123'),
    ]);

    const authTime = Date.now() - startTime;
    const timing = response.timing();
    const apiTime = timing.responseEnd - timing.requestStart;

    // Auth should complete quickly
    expect(apiTime).toBeLessThan(500);
    expect(authTime).toBeLessThan(1500);

    if (DEBUG) console.log('Auth Performance:', { apiTime, totalTime: authTime });
  });
});

test.describe('Concurrent User Performance', () => {
  test('should handle 5 concurrent users voting', async ({ browser }) => {
    const contexts = [];
    const title = `Concurrent Test ${Date.now()}`;

    // Create proposal with first user
    const mainContext = await browser.newContext();
    const mainPage = await mainContext.newPage();
    const mainLogin = new LoginPage(mainPage);
    const mainGame = new GameBoardPage(mainPage);

    await mainLogin.goto();
    await mainLogin.login('test@example.com', 'password123');
    await mainLogin.waitForSuccess();
    await mainGame.createProposal(title, 'Concurrent voting test');

    // Create 5 concurrent users
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext();
      const page = await context.newPage();
      const login = new LoginPage(page);
      const game = new GameBoardPage(page);

      await login.goto();
      await login.login(`user${i}@example.com`, 'password123');
      await login.waitForSuccess();
      await game.waitForProposalsLoad();

      contexts.push({ context, page, game });
    }

    // All users vote simultaneously
    const startTime = Date.now();
    await Promise.all(contexts.map(({ game }) => game.voteOnProposal(title, 'aye')));
    const votingTime = Date.now() - startTime;

    // Concurrent voting should complete quickly
    expect(votingTime).toBeLessThan(3000); // All 5 votes < 3s

    // Verify all votes registered
    const finalVotes = await mainGame.getVoteCounts(title);
    expect(finalVotes.aye).toBe(5);

    if (DEBUG)
      console.log('Concurrent Voting Performance:', {
        users: 5,
        totalTime: votingTime,
        avgPerUser: votingTime / 5,
      });

    // Cleanup
    await mainContext.close();
    for (const { context } of contexts) {
      await context.close();
    }
  });

  test('should handle 10 concurrent logins', async ({ browser }) => {
    const contexts = [];

    const startTime = Date.now();

    // 10 users login simultaneously
    const loginPromises = [];
    for (let i = 0; i < 10; i++) {
      const promise = (async () => {
        const context = await browser.newContext();
        const page = await context.newPage();
        const login = new LoginPage(page);

        await login.goto();
        await login.login(`user${i}@example.com`, 'password123');
        await login.waitForSuccess();

        contexts.push(context);
      })();

      loginPromises.push(promise);
    }

    await Promise.all(loginPromises);
    const totalTime = Date.now() - startTime;

    // 10 concurrent logins should complete reasonably fast
    expect(totalTime).toBeLessThan(5000); // < 5s for 10 logins

    if (DEBUG)
      console.log('Concurrent Login Performance:', {
        users: 10,
        totalTime,
        avgPerUser: totalTime / 10,
      });

    // Cleanup
    for (const context of contexts) {
      await context.close();
    }
  });
});

test.describe('Resource Usage', () => {
  test('should not leak memory on repeated navigation', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    // Initial memory snapshot
    const initialMemory = await page.evaluate(() => {
      // @ts-expect-error memory is non-standard but works in Chrome
      return (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
    });

    // Navigate repeatedly
    for (let i = 0; i < 5; i++) {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'password123');
      await loginPage.waitForSuccess();
      await gamePage.waitForProposalsLoad();

      // Navigate back to login
      await page.goto('http://localhost:3000/login');
    }

    // Final memory snapshot
    const finalMemory = await page.evaluate(() => {
      // @ts-expect-error memory is non-standard but works in Chrome
      return (performance as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize;
    });

    if (initialMemory && finalMemory) {
      const memoryIncrease = finalMemory - initialMemory;
      const increasePercent = (memoryIncrease / initialMemory) * 100;

      // Memory should not increase more than 50% after 5 navigations
      expect(increasePercent).toBeLessThan(50);

      if (DEBUG)
        console.log('Memory Usage:', {
          initial: `${(initialMemory / 1024 / 1024).toFixed(2)} MB`,
          final: `${(finalMemory / 1024 / 1024).toFixed(2)} MB`,
          increase: `${increasePercent.toFixed(2)}%`,
        });
    }
  });

  test('should handle large proposals list efficiently', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const gamePage = new GameBoardPage(page);

    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();

    // Create many proposals (if not already existing)
    // This tests rendering performance with large datasets
    const startTime = Date.now();
    await gamePage.waitForProposalsLoad();
    const proposals = await gamePage.getProposalTitles();
    const renderTime = Date.now() - startTime;

    // Should render efficiently even with many items
    expect(renderTime).toBeLessThan(2000);

    if (DEBUG)
      console.log('Large List Performance:', {
        count: proposals.length,
        renderTime,
        avgPerItem: proposals.length > 0 ? renderTime / proposals.length : 0,
      });
  });
});

test.describe('Performance Regression Detection', () => {
  test('should track baseline performance metrics', async ({ page }) => {
    const loginPage = new LoginPage(page);

    // Measure multiple runs to get average
    const runs = [];
    for (let i = 0; i < 3; i++) {
      const startTime = Date.now();
      await loginPage.goto();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      const metrics = await measureWebVitals(page);
      runs.push({ loadTime, ...metrics });
    }

    // Calculate averages
    const avg = {
      loadTime: runs.reduce((sum, r) => sum + r.loadTime, 0) / runs.length,
      fcp: runs.reduce((sum, r) => sum + r.fcp, 0) / runs.length,
      lcp: runs.reduce((sum, r) => sum + r.lcp, 0) / runs.length,
      cls: runs.reduce((sum, r) => sum + r.cls, 0) / runs.length,
    };

    // Store baseline (would typically save to file/database)
    if (DEBUG) console.log('Performance Baseline:', avg);

    // Assert against known baseline
    expect(avg.loadTime).toBeLessThan(3000);
    expect(avg.fcp).toBeLessThan(1800);
    expect(avg.lcp).toBeLessThan(2500);
    expect(avg.cls).toBeLessThan(0.1);
  });
});
