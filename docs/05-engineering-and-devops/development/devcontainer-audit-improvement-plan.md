# DevContainer Audit Script Improvement Plan

**Document owner:** Engineering Governance

## Background

The `scripts/ci/devcontainer-audit.sh` utility (v1.1.0) runs a multi-phase check over `.devcontainer/` assets to enforce container security, compliance, and performance standards. During a manual review on **2025-11-08**, the script exited immediately with a syntax error and revealed multiple structural issues. This plan captures required fixes and future enhancements so we can restore the tool to production-grade quality and align with Political Sphere's security posture.

## Current State Summary

- Version inspected: **DevContainer Security & Quality Audit v1.1.0**
- Execution status: **fails with `syntax error near unexpected token '}'`** (command exit code 2)
- Root causes: duplicate code block after `run_enhanced_scanning()` definition, missing variable initialisation under `set -u`, and incomplete logging helper
- Risk: No automated validation currently guards dev container changes, leaving CIS Docker Benchmark, OWASP Container Security, and internal SEC requirements unenforced

## Improvement Backlog

### Tier 0 — Critical Remediations (fix before next run)

1. **Eliminate stray code block after `run_enhanced_scanning()`**
   - Remove the duplicated Trivy-handling snippet that starts with `local image_vuln_count` outside any function; it breaks shell parsing.
2. **Initialise temporary build variables**
   - Define `TEMP_BUILD_DIR`, `TEMP_IMAGE_NAME`, `TEMP_IMAGE_BUILT=false`, and `TEMP_IMAGE_TAG` early in the script.
   - Ensure all references occur after initialisation to satisfy `set -u`.
3. **Add missing optimisation toggle**
   - Declare `SKIP_OPTIMIZATION` in the environment variable section with a `false` default and document it alongside other flags.
4. **Restore `log_low` output and counter increments**
   - Implement logging and `(LOW_COUNT++)` to keep severity summaries accurate and prevent silent failures.
5. **Harden cleanup trap**
   - Ensure `cleanup_temp_build` checks for defined variables before dereferencing and uses the initialised image name.
6. **Re-run full script locally after Tier 0 to confirm the audit executes through all phases without crashing.**

### Tier 1 — High Priority Enhancements (next sprint)

1. **Validate boolean environment inputs** (`true|false`) and fail fast on unexpected values.
2. **Normalise colour handling**
   - Detect non-TTY/`NO_COLOR` environments and fall back to ASCII-only output.
3. **Capture line numbers and remediation tips in findings** so reports are actionable.
4. **Replace manual JSON assembly** in `generate_reports()` with `jq` to avoid malformed output when the findings array is empty.
5. **Consolidate Trivy scan handling** and surface clear failure messages (config vs. image scan).
6. **Relocate `.dockerignore` auto-fix** to `.devcontainer/.dockerignore` to avoid polluting repository root.
7. **Document auto-fix limitations** (e.g., injected health check may be incorrect for custom stacks) and add guardrails before mutating files.

### Tier 2 — Medium Priority Improvements (backlog scheduling)

1. **Parallelise independent checks** (Hadolint, schema validation, Trivy config) when GNU `parallel` is available.
2. **Add SARIF 2.1.0 export** so findings can flow into GitHub code scanning.
3. **Introduce structured logging (`LOG_FORMAT=json`)** for downstream analytics.
4. **Bundle canned gitleaks/trivy policies** tuned for dev container contexts.
5. **Extend supply-chain checks** to verify trusted publishers for DevContainer Features and capture checksums for downloaded feature tarballs.
6. **Add integration and unit tests** (Bats or shellspec) covering runtime image build, critical regexes, and auto-fix routines.

### Tier 3 — Developer Experience & Observability (nice-to-have)

1. Provide remediation snippets alongside findings when `VERBOSE=true`.
2. Offer `SELF_TEST=true` mode with known-good/known-bad fixtures to detect regressions quickly.
3. Publish a reusable GitHub workflow & pre-commit hook that wraps the audit script.
4. Track findings over time (`.devcontainer-audit-history.jsonl`) and generate trend reports.
5. Explore container build caching to shorten repeated audit runs in CI.

## Recommended Execution Order

1. Implement Tier 0 corrections and cut release **v1.1.1** (or v1.2.0 if adding reporting improvements simultaneously).
2. Follow with Tier 1 work to stabilise outputs and developer ergonomics.
3. Schedule Tier 2 and Tier 3 items against the broader CI/CD hardening roadmap.

## Validation Checklist

- Script executes end-to-end under `set -euo pipefail` with no syntax or unbound variable errors.
- Hadolint, Trivy, Docker Compose, and runtime checks respect toggles and produce actionable findings.
- JSON summary validates via `jq`, and (when implemented) SARIF uploads successfully to GitHub code scanning.
- Auto-fix routines create backups and avoid destructive edits.
- Unit/integration tests pass locally and in CI; coverage added to enforcement gates.

## References

- `scripts/ci/devcontainer-audit.sh`
- CIS Docker Benchmark v1.6.0
- VS Code Dev Container Specification (v0.2.0)
- OWASP Docker Security Cheat Sheet / OWASP ASVS 4.0.3 alignment
- Political Sphere security, quality, and operations standards (`docs/05-engineering-and-devops/`, `docs/06-security-and-risk/`)
