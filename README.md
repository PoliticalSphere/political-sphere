# Political Sphere — Monorepo (developer workspace)

[![Version](https://img.shields.io/badge/version-1.2.6-blue.svg)](CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](package.json)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-130%2F130%20passing-success)](docs/TODO.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](coverage/)
[![Audit](https://img.shields.io/badge/audit-in%20progress-yellow)](#audit-status)

> A democratically-governed multiplayer political simulation game with strict constitutional governance. Built as a monorepo using Nx, featuring React frontend, Node.js/NestJS backend, comprehensive testing, and AI-assisted development tooling.

## 🎯 Project Status

| Category             | Status            | Details                                |
| -------------------- | ----------------- | -------------------------------------- |
| **Unit Tests**       | ✅ 100% (130/130) | All unit tests passing                 |
| **Test Coverage**    | ✅ 100%           | Complete test suite stabilized         |
| **Security Audit**   | 🔄 In Progress    | 10 critical, 21 high issues identified |
| **CI/CD Pipeline**   | ✅ Active         | Test & audit workflows enabled         |
| **Production Ready** | ⚠️ Not Yet        | Addressing audit findings              |

> A democratically-governed multiplayer political simulation game with strict constitutional governance. Built as a monorepo using Nx, featuring React frontend, Node.js/NestJS backend, comprehensive testing, and AI-assisted development tooling.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Troubleshooting](#troubleshooting)

## Overview

Political Sphere is a multiplayer political simulation platform that enables democratic governance through technology. The project emphasizes ethical AI use, zero-trust security, and WCAG 2.2 AA+ accessibility compliance.

## Key Features

- **Democratic Governance**: Constitutional framework with transparent decision-making
- **Multiplayer Simulation**: Real-time political scenario modeling
- **Ethical AI Integration**: AI assistants with strict governance boundaries
- **Comprehensive Testing**: Unit, integration, e2e, accessibility, and security testing
- **Zero-Trust Security**: End-to-end encryption and auditability
- **Accessibility First**: WCAG 2.2 AA+ compliance across all interfaces

## Architecture

The project follows a modular monorepo architecture:

- **Frontend**: React with TypeScript, Tailwind CSS, Module Federation
- **Backend**: Node.js/NestJS with TypeScript, REST APIs
- **Infrastructure**: Docker, Kubernetes, Terraform for cloud deployment
- **Testing**: Jest, Playwright, comprehensive test automation
- **CI/CD**: GitHub Actions with security scanning, supply-chain hardening, and progressive delivery
- **AI Tooling**: Custom AI assistants for code review, performance monitoring, and governance
- **Observability**: OpenTelemetry instrumentation, structured logging, performance budgets
- **Security**: Gitleaks secret scanning, Semgrep SAST, optional CodeQL, SLSA provenance

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (or compatible package manager)
- Docker & Docker Compose (recommended)

### Installation

```bash
npm install
# optional: run the default health check bundle
npm run preflight
```

### Development

```bash
npm run dev        # bring up the docker compose stack used in local dev
npm run serve:frontend
npm run build:frontend
```

## Project Structure

```
apps/          # Applications (api, frontend, worker)
libs/          # Shared libraries (ui, platform, infrastructure, shared)
docs/          # Comprehensive documentation and ADRs
scripts/       # Automation scripts and utilities
ai-*           # AI tooling and assets (cache, learning, metrics)
tools/         # Build tools and utilities
.github/       # GitHub workflows and templates
```

## Development

### Available Commands

- `npm run preflight` — lint, test, and build checks when available
- `npm run lint:fix` — ESLint with auto-fix for JS/TS sources
- `npm run lint:unused` — Knip-powered unused file/export scan
- `npm run format` — Prettier formatting for the full workspace
- `npm run test` — Vitest unit tests (node environment)
- `npm run test:coverage` — Vitest coverage with Istanbul reporter
- `npm run type-check` — TypeScript `tsc --noEmit`

### Development Servers

- `npm run dev` — Start the docker-compose services used by the API
- `npm run serve:frontend` — Launch the Vite dev server for the frontend UI

### AI-Assisted Development

- `npm run ai:review` — AI code review and suggestions
- `npm run ai:blackbox` — Governance compliance checking
- `npm run ai:performance` — Performance monitoring and optimization

### Data Tooling

- `dvc repro track-datasets` — Capture `data/` fixtures metadata without bloating Git
- `scripts/data/dvc-track.sh` — Validates required directories before running DVC

### Local Observability

- `scripts/observability/signoz.sh up` — Launch the SigNoz stack (ClickHouse + OTEL collector + UI) for trace inspection

### Model Context Protocol Servers

- `npm run mcp:filesystem` — repository-aware file navigation
- `npm run mcp:git` — local Git analytics (`status`, `log`, `diff`)
- `npm run mcp:political-sphere` — domain documentation & governance insights
- `npm run mcp:sqlite` — read-only queries against project SQLite datasets
- `npm run mcp:puppeteer` — headless browser automation helpers
- `npm run mcp:microsoft-learn` — curated Microsoft Learn recommendations

> Complete catalogue, setup notes, and troubleshooting guidance live in `docs/mcp-servers-setup.md`.

### Quality Gates & Governance

- `npm run controls:run` — Execute machine-checkable governance controls
- `npm run lint:boundaries` — Verify Nx module boundary compliance
- `npm run test:a11y` — WCAG 2.2 AA+ accessibility validation
- `npm run docs:lint` — Markdown and spelling checks
- `npm run audit:full` — Comprehensive security & quality audit across all apps

## Audit Status

Run comprehensive audits with `npm run audit:full` to assess production readiness:

**Current Status (2025-11-10):**

- ✅ **100% Unit Tests** - All 130 tests passing
- 🔄 **Security & Quality Audits** - In progress
  - 10 Critical issues identified
  - 21 High severity issues
  - 43 Medium severity issues
- ⚠️ **Not Production Ready** - Addressing critical findings

**Focus Areas:**

- API authentication & authorization hardening
- Input validation & rate limiting
- OpenAPI specification updates
- Module Federation configuration
- WebSocket security (game-server)

See `scripts/docs/audit-trail/` for detailed audit reports.

## CI/CD & Quality Infrastructure

[![Controls](https://github.com/PolitcalSphere/political-sphere/actions/workflows/controls.yml/badge.svg)](https://github.com/PolitcalSphere/political-sphere/actions/workflows/controls.yml)
[![Security Scan](https://github.com/PolitcalSphere/political-sphere/actions/workflows/security-scan.yml/badge.svg)](https://github.com/PolitcalSphere/political-sphere/actions/workflows/security-scan.yml)
[![Supply Chain](https://github.com/PolitcalSphere/political-sphere/actions/workflows/supply-chain.yml/badge.svg)](https://github.com/PolitcalSphere/political-sphere/actions/workflows/supply-chain.yml)

### Automated Quality Gates

The project enforces comprehensive quality standards through automated CI/CD pipelines:

#### **Governance Controls** (`.github/workflows/controls.yml`)

Machine-checkable rules defined in `docs/controls.yml`:

- ✅ PR mandatory headers validation
- ✅ ESLint zero-warning policy
- ✅ TypeScript strict typecheck
- ✅ Unit & integration tests
- ✅ Documentation linting
- ✅ Import boundary enforcement
- ✅ Accessibility validation
- ✅ Secret scanning

#### **Security Scanning** (`.github/workflows/security-scan.yml`)

Multi-layer security analysis:

- **Gitleaks**: Secret detection with redaction
- **Semgrep**: Custom SAST rules (console.log forbidden, ADR enforcement)
- **CodeQL**: Optional deep code analysis (main branch only)
- **SARIF Upload**: Security alerts integration

#### **Supply Chain Hardening** (`.github/workflows/supply-chain.yml`)

SLSA Level 2 provenance:

- **SBOM Generation**: CycloneDX bill of materials
- **Build Provenance**: Cryptographic attestation of build artifacts
- **Artifact Upload**: Versioned SBOM tracking

#### **Observability Verification** (`.github/workflows/observability-verify.yml`)

Runtime readiness checks:

- **OTEL Endpoint**: Validates observability configuration on main
- **Trace Instrumentation**: Ensures OpenTelemetry bootstrap present

#### **Performance Budgets** (`.github/workflows/performance.yml`)

k6 smoke tests with thresholds:

- **API**: p95 < 200ms, error rate < 1%
  - **Frontend**: p95 < 500ms, cold start < 2s
  - **Worker**: p95 < 100ms, error rate < 0.1%

#### **OpenSSF Scorecard** (`.github/workflows/scorecard.yml`)

A scheduled Scorecard run publishes security-signal SARIF to GitHub Security and produces an artifact developers can review locally.

### Required Secrets

Configure these in GitHub repository settings for full CI/CD functionality:

- `PERF_BASE_URL`: Performance testing endpoint (optional, skips if unset)
- `OTEL_EXPORTER_OTLP_ENDPOINT`: OpenTelemetry collector endpoint (required for observability verification on main)

## Testing

The project maintains comprehensive test coverage across multiple dimensions:

- **Unit Tests**: Jest with 80%+ coverage target for critical paths
- **Integration Tests**: API and service interactions with real dependencies
- **E2E Tests**: Playwright for critical user journeys with visual regression
- **Accessibility Tests**: Automated WCAG 2.2 AA+ validation (zero serious+ violations policy)
- **Security Tests**: OWASP Top 10, secret detection, and dependency scanning
- **Performance Tests**: k6 smoke tests with p95 latency budgets

Run tests with:

```bash
npm run test              # Unit tests with coverage
npm run test:e2e          # End-to-end tests (Playwright)
npm run test:a11y         # Accessibility tests (axe-core)
npm run test:integration  # Integration test suite
```

### Developer test scripts (fast iteration)

For faster local feedback and per-app testing we've added a few convenience npm scripts:

- `npm run test:fast` — run only changed tests (VITEST_CHANGED=1). Fast iteration loop for quick feedback.
- `npm run test:full` — run the full Vitest suite.
- `npm run test:api` — run tests scoped to the `apps/api` package.
- `npm run test:frontend` — run tests scoped to the `apps/frontend` package.

Example: to iterate quickly on API changes use:

```bash
npm run test:fast
```

Or run only API tests when focusing on backend changes:

```bash
npm run test:api
```

### Test Configuration

- **Jest**: ESM-compatible with TypeScript transformation
- **Playwright**: Chromium engine for a11y tests (`playwright-accessibility-config.ts`)
- **Coverage**: NYC/Istanbul with branch and statement thresholds
- **Parallel Execution**: Nx affected tests with remote caching

## Contributing

See [Contributing Guide](docs/contributing.md) and [.blackboxrules](.blackboxrules) for governance rules.

### Development Workflow

1. Fork and create feature branch
2. Follow conventional commits
3. Ensure tests pass and coverage maintained
4. Run `npm run ai:review` for AI-assisted code review
5. Submit PR with comprehensive description

## Documentation

### Core Documentation

- [Architecture Decision Records](docs/04-architecture/decisions/) — Technical decisions with context and alternatives
- [API Documentation](docs/api.md) — REST and GraphQL endpoint references
- [Security Guidelines](docs/SECURITY.md) — Threat model, compliance, and reporting
- [Contributing Guide](docs/contributing.md) — Development workflow and standards

### Governance & Compliance

- [Controls Catalogue](docs/controls.yml) — Machine-checkable governance rules
- [Governance Rules](.blackboxrules) — AI assistant and developer governance
- [TODO List](docs/TODO.md) — Single source of truth for project tasks
- [CHANGELOG](docs/CHANGELOG.md) — Version history and notable changes

### Operations & Observability

- [Observability Guide](monitoring/otel-instrumentation.md) — OpenTelemetry setup
- [Performance Budgets](apps/*/budgets.json) — Service-level latency/error thresholds
- [Disaster Recovery](docs/DISASTER-RECOVERY-RUNBOOK.md) — Incident response procedures

## Troubleshooting

### Common Issues

**Build Failures**

- Ensure Node.js 18+ is installed
- Run `npm ci` to install dependencies
- Check Nx cache: `npx nx reset`

**Test Failures**

- Database issues: Ensure Docker services are running
- Coverage low: Focus on critical path tests first
- ESM issues: Check jest.config.cjs for module resolution

**AI Tooling Issues**

- Cache problems: Clear `ai-cache/` directory
- Performance slow: Enable FAST_AI mode with `FAST_AI=1`

**Pre-commit Hook Failures**

- Linting: Run `npm run lint` and fix issues
- Secrets: Remove any hardcoded credentials
- Boundaries: Check import paths follow Nx rules

**CI/CD Pipeline Failures**

- Controls failing: Review `docs/controls.yml` for specific requirements
- Security scan alerts: Check Gitleaks/Semgrep output, rotate exposed secrets immediately
- Build provenance: Ensure dist artifacts are generated before attestation
- Performance budget exceeded: Review k6 output and optimize hot paths

### AI Intelligence Features

The project includes advanced AI tooling for faster development:

- **Code Indexing**: Incremental semantic search with HNSW ANN (640-file corpus, 128-dim embeddings)
- **Context Preloading**: Pre-caches README, package.json, and common patterns
- **In-Memory Index Server**: Fast vector search at `/vector-search` endpoint
- **Novelty Guard**: Jaccard-based detection to prevent AI loops
- **Competence Monitoring**: Tracks AI suggestion quality and architectural decisions
- **Performance Monitoring**: Measures cache hit rates, response times, and recall metrics

Enable fast mode with `FAST_AI=1` for reduced latency during development.

### Getting Help

- Check [CHANGELOG.md](docs/CHANGELOG.md) for recent changes
- Review [TODO.md](docs/TODO.md) for known issues and planned work
- Run `npm run validate:env` to check environment setup
- Search [docs/](docs/) for specific topics or guidelines

---

_Last updated: 2025-11-02_
