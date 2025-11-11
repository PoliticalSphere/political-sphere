# Test Sharding Guide

**Purpose:** Distribute E2E tests across multiple workers for faster execution  
**Target:** Reduce CI/CD pipeline time from ~5 minutes to ~1-2 minutes

---

## Overview

Test sharding splits the test suite across multiple parallel workers, each running a subset of tests. This is particularly useful in CI/CD environments where you have multiple CPU cores or agents available.

---

## Local Development Sharding

### Run Tests with Multiple Workers

```bash
# Auto-detect optimal worker count (default)
npx playwright test

# Specify exact worker count
npx playwright test --workers=4

# Run one worker per CPU core
npx playwright test --workers=100%

# Disable parallelization (debug mode)
npx playwright test --workers=1
```

### Shard Tests Manually

```bash
# Split into 4 shards, run shard 1
npx playwright test --shard=1/4

# Split into 4 shards, run shard 2
npx playwright test --shard=2/4

# And so on...
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

---

## CI/CD Sharding Configuration

### GitHub Actions Matrix Strategy

Create `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests (Sharded)

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        shard: [1, 2, 3, 4]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Start application
        run: npm run start:dev &
        env:
          CI: true

      - name: Wait for server
        run: npx wait-on http://localhost:3000 --timeout 60000

      - name: Run E2E tests (Shard ${{ matrix.shard }}/4)
        run: |
          npx playwright test \
            --project=${{ matrix.browser }} \
            --shard=${{ matrix.shard }}/4

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}-shard-${{ matrix.shard }}
          path: reports/e2e-html
          retention-days: 7

      - name: Upload blob report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: blob-report-${{ matrix.browser }}-shard-${{ matrix.shard }}
          path: blob-report
          retention-days: 1

  merge-reports:
    if: always()
    needs: e2e-tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Download all blob reports
        uses: actions/download-artifact@v3
        with:
          path: all-blob-reports

      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Upload merged report
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-merged
          path: playwright-report
          retention-days: 30
```

**Result:**

- 3 browsers × 4 shards = 12 parallel jobs
- Tests complete in ~1-2 minutes instead of ~5 minutes

---

## Optimal Shard Count

### Calculation

```
Shard Count = Total Test Duration / Target Duration Per Job

Example:
- Total tests: 68 tests × 3 browsers = 204 test runs
- Average test duration: 2 seconds
- Total duration: 204 × 2s = 408s ≈ 7 minutes (sequential)
- Target per job: 2 minutes

Shard count = 7 minutes / 2 minutes = 3-4 shards
```

### Recommendations

| Test Count | Duration   | Recommended Shards |
| ---------- | ---------- | ------------------ |
| < 20 tests | < 1 minute | 1 (no sharding)    |
| 20-50      | 1-3 min    | 2 shards           |
| 50-100     | 3-5 min    | 3-4 shards         |
| 100-200    | 5-10 min   | 4-6 shards         |
| 200+       | 10+ min    | 6-8 shards         |

**Political Sphere:** 68 tests → 3-4 shards optimal

---

## Playwright Config Optimization

Add to `playwright.config.ts`:

```typescript
export default defineConfig({
  // ... existing config

  // Optimize for sharding
  fullyParallel: true, // Run tests in parallel within shards
  workers: process.env.CI ? 1 : undefined, // One worker per shard in CI

  // Reporter for sharding
  reporter: process.env.CI
    ? [['blob'], ['github']] // Blob for merging, GitHub for annotations
    : [['html'], ['list']], // Local development reporters
});
```

---

## Monitoring Shard Performance

### Check Shard Balance

After running sharded tests, check if shards are balanced:

```bash
# View test distribution
npx playwright test --list --shard=1/4
npx playwright test --list --shard=2/4
npx playwright test --list --shard=3/4
npx playwright test --list --shard=4/4
```

### Rebalance if Needed

If one shard takes much longer:

1. **Use test groups** to distribute heavy tests
2. **Increase shard count** for better distribution
3. **Tag slow tests** and run them separately

```typescript
// Tag slow tests
test.describe('Slow tests', () => {
  test.slow(); // Mark entire suite as slow

  test('performance test', async () => {
    // ...
  });
});

// Run only slow tests in dedicated shard
npx playwright test --grep @slow
```

---

## Best Practices

### 1. Test Independence

```typescript
// ✅ Good: Each test is self-contained
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  expect(page.url()).toContain('/game');
});

// ❌ Bad: Tests depend on execution order
test.describe.serial('dependent tests', () => {
  // These won't work well with sharding
});
```

### 2. Isolated Test Data

```typescript
// ✅ Good: Unique test data per test
const title = `Proposal ${Date.now()}`;

// ❌ Bad: Shared test data
const title = 'Test Proposal'; // Conflicts in parallel execution
```

### 3. Database Cleanup

```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data created during test
  await cleanupTestData();
});
```

---

## Troubleshooting

### Issue: Unbalanced Shards

**Symptom:** Shard 1 takes 5 minutes, Shard 2 takes 1 minute

**Solution:**

```bash
# Increase shard count for better distribution
npx playwright test --shard=1/8 # Instead of 1/4
```

### Issue: Flaky Tests in Sharded Runs

**Symptom:** Tests pass individually but fail when sharded

**Cause:** Shared state or race conditions

**Solution:**

```typescript
// Ensure test isolation
test.beforeEach(async ({ page, context }) => {
  // Clear all cookies and storage
  await context.clearCookies();
  await context.clearPermissions();
});
```

### Issue: Blob Reports Not Merging

**Symptom:** CI can't merge reports from shards

**Solution:**

```yaml
# Ensure blob reporter is configured
- name: Run tests
  env:
    PLAYWRIGHT_BLOB_OUTPUT_DIR: blob-report
  run: npx playwright test --reporter=blob
```

---

## Cost-Benefit Analysis

### Without Sharding

- **Time:** 7-10 minutes per test run
- **Resources:** 1 CI runner
- **Cost:** $0.008 × 10 min = $0.08 per run
- **Feedback delay:** ~10 minutes

### With Sharding (4 shards × 3 browsers = 12 jobs)

- **Time:** 1-2 minutes per test run
- **Resources:** 12 parallel CI runners
- **Cost:** $0.008 × 2 min × 12 = $0.19 per run
- **Feedback delay:** ~2 minutes

**Trade-off:**

- 2.4× cost increase
- 5× speed improvement
- **Worth it** for rapid feedback in active development

---

## Next Steps

1. **Implement GitHub Actions workflow** with matrix sharding
2. **Monitor shard performance** and adjust count
3. **Configure blob reporters** for report merging
4. **Set up shard-specific timeouts** if needed
5. **Document shard strategy** in team wiki

---

**Status:** OPERATIONAL - Ready for CI/CD integration  
**Last Updated:** 2025-11-11  
**Maintainer:** Political Sphere DevOps Team
