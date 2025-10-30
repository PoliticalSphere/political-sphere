# CI / CD Guide

This repo runs a multi-workflow GitHub Actions pipeline optimised for fast feedback and defence in depth.

## Runtime policy
- **Node.js 22.x** is the canonical runtime for all workflows and local development (see `.nvmrc`). Use `nvm use` or ensure containers pin the same major version to avoid lockfile churn.
- npm 10 ships with Node 22; prefer `npm ci` for clean installs and deterministic builds.

## Core workflows
- `CI` (lint → typecheck → test → build → security scan) runs on pushes and pull requests. Concurrency groups cancel superseded runs per ref.
- `E2E Tests` and `Integration Tests` spin up the full stack (API + frontend + Postgres) for Playwright and integration suites.
- `Deploy` promotes artefacts to AWS ECS using OIDC and runs Trivy/SBOM checks before a blue/green rollout.
- `Release` executes semantic-release on `main`.
- `Security`, `Vulnerability Scan`, `CodeQL`, and `Semgrep` provide scheduled and on-demand SAST/SCA coverage.

## Best practices
- Prefer `nx` targets when adding new checks so we can adopt affected-based execution and remote caching.
- Reuse build/test artefacts between workflows when practical (e.g., promote the `CI` build into `Deploy` instead of rebuilding).
- Keep workflow-specific docs and updates in this directory and reference them from contributor guides when behaviour changes.

