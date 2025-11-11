# TODO.md - Political Sphere Development Tasks

## E2E Testing Infrastructure (Completed 2025-11-11)

### Completed

- [x] Visual regression testing infrastructure (21 tests)
- [x] Performance and load testing (15+ tests with Web Vitals)
- [x] Enhanced voting flow tests (30+ tests, expanded from 8)
- [x] Test sharding configuration and documentation
- [x] E2E README updated with comprehensive test coverage
- [x] Playwright configuration optimized for visual regression
- [x] Multi-browser testing enabled (Chromium, Firefox, WebKit)
- [x] Responsive design testing (mobile, tablet, desktop)
- [x] Dark mode testing integrated
- [x] Update CHANGELOG.md with E2E enhancements

**Final E2E Test Suite:**

- Total tests: 126+ (from 68, +85% increase)
- Browser coverage: 3 browsers
- Viewport coverage: 3 responsive breakpoints
- Theme coverage: Light and dark modes
- CI/CD optimization: 7-10 min → 1-2 min with sharding

## API Security Improvements (Completed 2025-11-11)

### Completed

- [x] Add stricter rate limiting for auth endpoints (5 attempts/15min)
- [x] Verify JWT secrets validation (no fallbacks, fail-fast)
- [x] Verify password hashing in POST /users route (bcrypt with 10 rounds)
- [x] Fix GitHub Actions JWT secrets context warnings
- [x] Remove insecure inline secret fallbacks in e2e.yml workflow
- [x] Replace console.log/error with structured logger in bills.js and votes.js

## Documentation and Standards

### Completed (2025-11-11)

- [x] Establish comprehensive coding standards adapted to project requirements
- [x] Integrate security, accessibility, testing, and political neutrality principles
- [x] Update CHANGELOG.md with coding standards addition
- [x] Update CHANGELOG.md with E2E enhancements
- [x] Update CHANGELOG.md with security improvements

## Security Vulnerabilities Fix (apps/api) - In Progress

### Remaining Tasks

- [ ] Update users.test.mjs to include login flows and auth tokens
- [ ] Update bills.test.mjs to include auth tokens
- [ ] Update votes.test.mjs to include auth tokens
- [ ] Audit input validation schemas across all routes (users, bills, votes, parties, moderation)
- [ ] Confirm auth bypass only active in NODE_ENV=test; verify production enforcement
- [ ] Add validation tests for edge cases and malicious inputs

### High Issues (1 remaining)

- [ ] Ensure comprehensive input validation and sanitization in all routes

### Followup Steps

- [ ] Run tests to verify auth works (expect 289 tests, previously 24 failed)
- [ ] Run linting (fix 801 errors, 1518 warnings)
- [ ] Run type-checking (fix 123 errors in 25 files)
- [ ] Re-run security audit to confirm fixes
- [ ] Update CHANGELOG.md with security fixes

### Notes

- Tests failing due to 401 on auth routes (users, parties, bills, votes) as tests lack tokens
- Ownership checks added to users.js, but tests need auth
- No parties.test.mjs exists
- Linting issues in tools/scripts, docs, etc. (not core API)
- Type-checking: import extensions, JWT secrets undefined, type mismatches in stores/services
