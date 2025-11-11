P# End-to-End (E2E) Testing Guide

**Last Updated:** 2025-11-11  
**Test Framework:** Playwright Test  
**Architecture:** Single World Model (One Shared Political Simulation)

---

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing New Tests](#writing-new-tests)
- [Page Object Model](#page-object-model)
- [Test Categories](#test-categories)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

---

## Overview

Political Sphere's E2E test suite validates the entire application stack from user perspective, ensuring:

- **Authentication & Authorization** work correctly
- **Single World Gameplay** functions as designed (no lobby/game creation)
- **Accessibility** meets WCAG 2.2 AA standards
- **Security** controls prevent common vulnerabilities
- **Error Handling** provides graceful degradation
- **Cross-Browser** compatibility (Chromium, Firefox, WebKit)

### Key Architecture: Single World Model

**Critical:** Political Sphere is ONE shared world/game, not a multi-game platform.

- ✅ Users login → directly enter the shared world
- ✅ All players participate in the same simulation
- ✅ No lobby, no game creation, no joining separate games
- ❌ Do NOT test multi-game scenarios

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm
- Playwright Test (installed via package.json)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (Chromium, Firefox, WebKit)
npx playwright install
```

### Quick Start

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug specific test
npm run test:e2e:debug

# View last test report
npm run test:e2e:report
```

---

## Test Structure

```
apps/e2e/
├── src/
│   ├── pages/              # Page Object Models
│   │   ├── LoginPage.ts    # Login page interactions
│   │   ├── GameBoardPage.ts # Game world interactions
│   │   └── LobbyPage.ts    # [OBSOLETE - pending removal]
│   │
│   └── tests/              # Test suites
│       ├── auth.spec.ts             # Authentication flows (7 tests)
│       ├── game.spec.ts             # Single world gameplay (3 tests)
│       ├── voting.spec.ts           # Voting mechanics (30+ tests) ⭐
│       ├── accessibility.spec.ts    # WCAG 2.2 AA compliance (15+ tests)
│       ├── error-handling.spec.ts   # Graceful degradation (20+ tests)
│       ├── security.spec.ts         # Attack resistance (15+ tests)
│       ├── visual-regression.spec.ts # UI consistency (21 tests) ⭐
│       └── performance.spec.ts      # Load times & concurrency (15+ tests) ⭐
│
├── playwright.config.ts    # Playwright configuration
├── TEST-SHARDING.md       # Sharding guide for faster CI/CD ⭐
└── README.md              # This file
```

### Test Counts by Suite

| Suite                    |    Tests | Focus Area                                  |
| ------------------------ | -------: | ------------------------------------------- |
| **auth.spec.ts**         |        7 | Login, logout, session persistence          |
| **game.spec.ts**         |        3 | Single world entry, proposals               |
| **voting.spec.ts**       |  **30+** | **Full lifecycle, edge cases, perf** ⭐     |
| **accessibility**        |      15+ | Keyboard nav, screen readers, WCAG          |
| **error-handling**       |      20+ | Network failures, edge cases                |
| **security**             |      15+ | XSS, CSRF, rate limiting, validation        |
| **visual-regression** ⭐ |   **21** | **UI consistency, responsive, dark mode**   |
| **performance** ⭐       |  **15+** | **Load times, API speed, concurrency**      |
| **TOTAL**                | **126+** | **Enterprise-grade comprehensive coverage** |

**⭐ NEW:** Visual regression, performance, and enhanced voting tests added in v2.0.0

---

## Running Tests

### Basic Commands

```bash
# Run all tests in all browsers
npm run test:e2e

# Run specific test file
npx playwright test auth.spec.ts

# Run specific test by name
npx playwright test -g "should login with valid credentials"

# Run in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run in parallel (default: auto-scaled workers)
npx playwright test --workers=4
```

### Development Modes

```bash
# UI Mode - Interactive test development
npm run test:e2e:ui
# Features:
# - Watch mode with auto-run
# - Time travel debugging
# - Inspect DOM snapshots
# - Network/console logs

# Headed Mode - See browser actions
npm run test:e2e:headed

# Debug Mode - Step-by-step debugging
npm run test:e2e:debug
# Features:
# - Pause on test start
# - Playwright Inspector
# - Step through actions
# - Pick locators
```

### Filtering Tests

```bash
# Run only accessibility tests
npx playwright test accessibility

# Run only failed tests from last run
npx playwright test --last-failed

# Run tests matching pattern
npx playwright test --grep "keyboard navigation"

# Exclude tests matching pattern
npx playwright test --grep-invert "slow|skip"
```

---

## Writing New Tests

### Test Template

```typescript
/**
 * [Feature] E2E Tests
 * Brief description of what this suite tests
 */
import { test, expect } from '@playwright/test';

import { GameBoardPage } from '../pages/GameBoardPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('[Feature Name]', () => {
  let loginPage: LoginPage;
  let gamePage: GameBoardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    gamePage = new GameBoardPage(page);

    // Standard setup: login and enter game world
    await loginPage.goto();
    await loginPage.login('test@example.com', 'password123');
    await loginPage.waitForSuccess();
    await gamePage.waitForProposalsLoad();
  });

  test('should [expected behavior] when [condition]', async ({ page }) => {
    // Arrange - Set up test data
    const testData = {
      /* ... */
    };

    // Act - Perform action
    await gamePage.someAction(testData);

    // Assert - Verify outcome
    const result = await gamePage.getResult();
    expect(result).toBe(expectedValue);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup if needed
    await page.close();
  });
});
```

---

## Page Object Model

Political Sphere E2E tests use the **Page Object Model (POM)** pattern to:

- **Encapsulate** page interactions in reusable classes
- **Reduce duplication** across test files
- **Improve maintainability** when UI changes
- **Provide type safety** with TypeScript

### Example: LoginPage

```typescript
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async waitForSuccess() {
    await this.page.waitForURL('**/game', { timeout: 5000 });
  }

  async getErrorText(): Promise<string> {
    return this.page.textContent('[role="alert"]') || '';
  }
}
```

---

## Test Categories

See full documentation in each test file for detailed coverage.

### 1. Authentication (`auth.spec.ts`) - 7 tests

**Focus:** Login, logout, session persistence, error handling

- Login with valid credentials
- Logout functionality
- Remember me checkbox
- Invalid credentials handling
- Session persistence across refreshes
- Protected route access control
- Concurrent login handling

### 2. Gameplay (`game.spec.ts`) - 3 tests

**Focus:** Single world entry, proposals display, multiplayer

- Direct world entry (no lobby)
- Proposals list display
- Real-time updates

### 3. Voting (`voting.spec.ts`) - **30+ tests** ⭐

**Focus:** Complete voting lifecycle, edge cases, performance

**Basic Voting (8 tests):**

- Create proposals
- Vote aye/nay/abstain
- Multi-user voting
- Real-time proposal updates

**Enhanced Lifecycle (6 tests):**

- Full create → vote → tally flow
- Duplicate vote prevention
- Vote modification (if supported)
- Zero-vote proposals
- Tied vote handling
- Vote persistence across refreshes

**Edge Cases (10 tests):**

- Empty title/description validation
- Long title/description handling
- XSS prevention in titles and descriptions
- Special character support
- Rate limiting enforcement
- Non-existent proposal handling
- Rapid proposal creation

**Performance (3 tests):**

- Proposals list load time
- Large dataset rendering
- Non-blocking vote operations

### 4. Accessibility (`accessibility.spec.ts`) - 15+ tests

**Focus:** WCAG 2.2 AA compliance

- Keyboard navigation (Tab, Enter, Esc, Arrow keys)
- Screen reader announcements (ARIA labels, live regions)
- Color contrast ratios (4.5:1 minimum)
- Focus indicators visibility
- Responsive design (mobile, tablet, desktop)
- Form label associations
- Error message accessibility
- Loading state announcements
- Modal accessibility (focus trap, Esc to close)

### 5. Error Handling (`error-handling.spec.ts`) - 20+ tests

**Focus:** Network failures, invalid data, concurrent operations, edge cases

- API failure recovery
- Network timeouts
- Invalid form submissions
- Concurrent actions
- State corruption prevention
- Graceful degradation

### 6. Security (`security.spec.ts`) - 15+ tests

**Focus:** Attack resistance, input validation, authentication security

- XSS prevention (reflected, stored, DOM-based)
- CSRF token validation
- SQL injection prevention
- Rate limiting enforcement
- Session security (timeout, hijacking prevention)
- Authorization bypass attempts
- Content Security Policy compliance

### 7. Visual Regression (`visual-regression.spec.ts`) - **21 tests** ⭐

**Focus:** UI consistency, responsive design, cross-browser rendering

**Login Page (4 tests):**

- Full page screenshot
- Login form component
- Error state display
- Mobile viewport (375px)

**Game Board (5 tests):**

- Initial game state
- Proposals list layout
- Proposal card layout
- Tablet viewport (768px)
- Mobile viewport (375px)

**Proposal Creation (2 tests):**

- Modal/form display
- Validation error states

**Voting Interface (3 tests):**

- Vote buttons layout
- Results display
- After-vote state

**Dark Mode (2 tests):**

- Login page dark theme
- Game board dark theme

**Component States (3 tests):**

- Button states (default, hover, focus, disabled)
- Input states (empty, filled, focus, error)
- Loading indicators

**Cross-Browser (2 tests):**

- Layout consistency (Chromium, Firefox, WebKit)
- Form rendering consistency

**Configuration:**

- maxDiffPixels: 100 (handles timestamps, dynamic content)
- threshold: 0.2 (20% tolerance for rendering differences)
- animations: disabled (reproducible screenshots)

### 8. Performance (`performance.spec.ts`) - **15+ tests** ⭐

**Focus:** Load times, API speed, concurrent users, resource usage

**Page Load Performance (4 tests):**

- Login page performance budgets (FCP < 1.8s, LCP < 2.5s)
- Game board load efficiency
- Static asset caching
- Slow network handling (3G simulation)

**API Response Performance (3 tests):**

- Proposals API response time (< 500ms)
- Voting API response time (< 300ms)
- Authentication performance (< 500ms)

**Concurrent Users (2 tests):**

- 5 concurrent users voting (< 3s total)
- 10 concurrent logins (< 5s total)

**Resource Usage (2 tests):**

- Memory leak detection (< 50% increase after 5 navigations)
- Large proposals list rendering (< 2s)

**Performance Regression (1 test):**

- Baseline metrics tracking (3-run average)

**Web Vitals Tracked:**

- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- TTI (Time to Interactive)
- TBT (Total Blocking Time)
- CLS (Cumulative Layout Shift)

---

## Test Sharding for Faster CI/CD ⭐

See **[TEST-SHARDING.md](TEST-SHARDING.md)** for complete guide.

**Quick Start:**

```bash
# Run tests with 4 shards locally
npx playwright test --shard=1/4  # Shard 1
npx playwright test --shard=2/4  # Shard 2
npx playwright test --shard=3/4  # Shard 3
npx playwright test --shard=4/4  # Shard 4

# Parallel execution with multiple workers
npx playwright test --workers=4
```

**Benefits:**

- **7 minutes → 2 minutes:** 3.5× faster CI/CD feedback
- **3 browsers × 4 shards = 12 parallel jobs**
- Optimal for 68+ tests (recommended 3-4 shards)

**GitHub Actions Matrix:**

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]
    shard: [1, 2, 3, 4]
# 12 parallel jobs = ~2 minute total run time
```

### 6. Security (`security.spec.ts`) - 15+ tests

XSS prevention, CSRF protection, rate limiting, input validation

---

## Best Practices

- **Test Independence**: Each test self-contained, no shared state
- **Stable Selectors**: Use data-testid, roles, semantic HTML
- **Proper Waits**: Wait for conditions, not arbitrary timeouts
- **Unique Data**: Timestamp test data to prevent conflicts
- **Page Objects**: Encapsulate page logic in POM classes
- **Cross-Browser**: Verify tests pass in all browsers

See full best practices guide in complete documentation above.

---

## CI/CD Integration

Tests run automatically in GitHub Actions on:

- Pull requests
- Pushes to main/develop branches
- Nightly scheduled runs

Matrix strategy tests across Chromium, Firefox, and WebKit.

---

## Troubleshooting

### Common Issues

1. **Browsers not installed**: Run `npx playwright install --with-deps`
2. **Server not starting**: Check port 3000 availability
3. **Flaky tests**: Use specific waits, ensure test independence
4. **Slow tests**: Increase workers, reduce test scope

See full troubleshooting guide above.

---

## Contributing

When adding new tests:

1. Follow single world architecture
2. Use Page Object Models
3. Write descriptive test names
4. Test across all browsers
5. Update this README

---

**Status:** OPERATIONAL  
**Last Updated:** 2025-11-11  
**Maintainer:** Political Sphere Development Team
