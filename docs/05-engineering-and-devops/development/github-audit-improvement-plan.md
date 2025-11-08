# GitHub Actions Audit Script Improvement Plan

**Document owner:** Engineering Governance

## Background

The `scripts/ci/github-audit.sh` utility performs multi-phase validation of workflow security, compliance, and efficiency. A recent manual review (2025-11-08) highlighted several opportunities to harden detection accuracy, expand coverage, and improve developer ergonomics. This document records the prioritized improvement backlog and supporting rationale so work items can be scheduled and tracked.

## Current State Summary

- Version audited: `GitHub Workflows & Actions Security Audit v1.2.0`
- Exit status: `2` (critical findings present)
- Findings: `3 critical`, `0 high`, `2 medium`, `0 low`, `21 info`
- Primary blockers: false-positive script injection detection and limited context in findings output

## Improvement Backlog

### Tier 0 — Critical Remediations (deploy immediately)

1. **Refine script injection detector**
   - Scope detection to `run:` blocks and unsafe GitHub context keys.
   - Preserve safe helper expressions (`contains`, `startsWith`, `endsWith`, `format`, `toJSON`).
   - Record line numbers for each match.
2. **Improve hardcoded credential scanning**
   - Exclude legitimate `secrets.*` references while matching high-entropy literals.
   - Flag both YAML key/value pairs and inline shell assignments.
3. **Report precise locations**
   - Forward `grep -n` results through `add_finding` to populate the `line` field.
   - Include actionable remediation text in verbose mode.
4. **Strengthen action pinning policy**
   - Differentiate first-party (`actions/*`, `github/*`) vs. third-party actions.
   - Require commit SHAs for third-party publishers; prefer semantic tags for first-party.
5. **Enforce explicit workflow permissions**
   - Detect missing top-level `permissions:` blocks and non-restrictive defaults.
6. **Detect GITHUB_ENV/PATH injection patterns**
   - Flag writes that mix unsanitized GitHub context into environment files.

### Tier 1 — High Priority Enhancements (next sprint)

1. **Add command timeouts and failure context** for `actionlint`, `gitleaks`, and other external tooling.
2. **Validate caching configuration** by confirming presence of `key:` and `restore-keys:` within `actions/cache` steps.
3. **Recommend `timeout-minutes`** for every job lacking an explicit cap.
4. **Ship bundled gitleaks ruleset** tuned for `.github/workflows/**` if no custom config is supplied.
5. **Create targeted unit tests** (bash-based) to cover detection edge cases.
6. **Support external configuration** via `.github-audit.yml` to tailor severities and rule toggles.

### Tier 2 — Medium Priority Improvements (schedule in backlog)

1. **Emit SARIF 2.1.0** alongside JSON/summary outputs for GitHub code scanning ingestion.
2. **Introduce structured logging option** (`LOG_FORMAT=json`) for machine parsing.
3. **Parallelize per-workflow checks** when GNU `parallel` is available; retain sequential fallback.
4. **Cache tool availability** (actionlint, yamllint, gitleaks, yq) with TTL to reduce redundant version queries.
5. **Assess third-party action trustworthiness** and surface verification reminders.
6. **Probe action advisories** via `gh` CLI to surface known vulnerabilities (future-ready stub).

### Tier 3 — Developer Experience & Observability (nice-to-have)

1. Provide remediation snippets in findings (displayed when `VERBOSE=true`).
2. Offer optional interactive auto-fix prompts (guarded by `INTERACTIVE=true`).
3. Add self-test mode (`SELF_TEST=true`) with known-safe and known-unsafe sample workflows.
4. Deliver ready-to-use GitHub Action and pre-commit hook templates that invoke the audit script.
5. Persist audit metrics in `.github-audit-history.jsonl` and generate rolling trend summaries.

## Recommended Execution Order

1. Implement Tier 0 fixes and release version 1.3.0.
2. Add bash unit tests plus CLI configuration loader (Tier 1) before widening feature scope.
3. Schedule Tier 2/3 backlog items in coordination with CI hardening roadmap.

## Validation Checklist

- Unit tests covering detection logic (success and failure cases).
- Integration test run on representative workflow set (including false-positive regressions).
- Manual verification of JSON, SARIF, and human-readable outputs.
- Security review for any auto-fix routines prior to enabling by default.

## References

- `scripts/ci/github-audit.sh`
- GitHub Actions Security Hardening Guide
- OWASP CI/CD Security Top 10
- CIS Software Supply Chain Security Guide
- NIST SP 800-204C DevSecOps Framework
