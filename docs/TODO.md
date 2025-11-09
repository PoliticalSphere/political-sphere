# Project TODO List

## Completed Tasks

### [X] VS Code Tasks Portability & UX Refactor (2025-11-09)

- Updated `.vscode/tasks.json` to use `type: "npm"` for npm scripts (cross-platform)
- Added `group`, `presentation`, and `runOptions` metadata for consistent task panels and execution
- Linked `ai:fast-secure` to `ai:preflight` with `dependsOn` chain
- Preserved Vitest watch as background with problem matcher and added presentation defaults
- Improved shell validation tasks with clearer fallbacks and safer grep flags

### [X] GitHub Audit Script Enhancement v1.1.0 (2025-11-08)

- Enhanced `scripts/ci/github-audit.sh` with CodeQL workflow detection
- Added FAIL_ON_WARNINGS configuration for stricter CI enforcement
- Improved JSON report generation with proper escaping and version tracking
- Enhanced summary reports with configuration details
- Verified all features work correctly with test runs
- Updated CHANGELOG.md with comprehensive enhancement details

## Current Task: Expand devcontainer-audit.sh with Additional Free Checks

### Steps to Complete:

1. **[IN PROGRESS] Edit scripts/ci/devcontainer-audit.sh**: Add new phases 9-15 for optimization, supply chain, runtime security, DevContainer features, enhanced scanning, monitoring, and edge cases. Enhance auto-fix for apt flags, .dockerignore, HEALTHCHECK.
2. **Syntax Check**: Run `bash -n scripts/ci/devcontainer-audit.sh` to validate bash syntax.
3. **Critical-Path Test**: Run `./scripts/ci/devcontainer-audit.sh` and verify new findings appear in devcontainer-audit/devcontainer-audit-results.json (e.g., OPT-_, RUNTIME-_ checks).
4. **Full Integration Test**: Run complete audit, check no regressions in existing phases, validate temp builds clean up, outputs match expectations.
5. **Update CHANGELOG.md**: Add entry for v1.1.0 with new features.
6. **Documentation**: Update scripts/ci/README-audits.md with new SKIP flags and phases.
7. **Mark Complete**: Remove this section once verified.

### Priority: High (Security & Compliance)

### Owner: BLACKBOXAI

### Due: Immediate

### Completed Task: Resolve Top 10 Issues in GitHub Copilot Instructions

### Steps Completed:

1. **[X] Analyzed and identified top 10 issues**: Excessive length, redundant content, inconsistent rule prioritization, ambiguous triggers, over-reliance on acronyms, missing concrete examples, conflicting efficiency vs. rigor trade-offs, outdated/unversioned references, lack of modular structure, insufficient error recovery guidance.
2. **[X] Implemented fixes**: Consolidated redundant sections, added decision trees and flowcharts, standardized acronym expansion, added concrete examples, introduced clear balancing guidelines, added version tracking, implemented modular structure, enhanced error recovery protocols.
3. **[X] Updated versions**: Incremented both instruction files to v2.4.0 with synchronized review dates (2025-11-08).
4. **[X] Updated CHANGELOG.md**: Added comprehensive entry documenting all fixes and improvements.
5. **[X] Verified parity**: Ensured both `.github/copilot-instructions.md` and `.blackboxrules` remain synchronized while maintaining their optimized formats.

### Priority: High (AI Effectiveness)

### Owner: BLACKBOXAI

### Completed: 2025-11-08

---

## Other Pending Tasks

(Add other TODOs from existing file if needed, but focusing on this task.)

### E2E / Frontend Enablement (Added 2025-11-09)

- [ ] Wire Vite dev server for `apps/web` with stable port (default 5173) and ensure minimal root route renders without console errors.
- [ ] Uncomment / add frontend `webServer` block in `e2e/playwright.config.ts` once Vite dev server confirmed stable.
- [ ] Replace `test.skip` frontend smoke test in `core-loop.spec.ts` with active test once selectors are defined.
- [ ] Remove conditional skip wrapper in `health-check.spec.ts` after `WEB_BASE_URL` is consistently set in CI.
- [ ] Add accessibility smoke check (axe-core) to a minimal rendered page to begin WCAG 2.2 AA automation.
- [ ] Transition from in-memory game state to persistent store (create ADR first) — prerequisite for multi-session E2E realism.

Owner: Developer
Execution Mode: Safe (impacts test infra)
Rationale: Progressively enable full-stack smoke coverage while maintaining green pipeline.

Last Updated: $(date)
