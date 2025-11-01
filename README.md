# Political Sphere — Monorepo (developer workspace)

[![Version](https://img.shields.io/badge/version-1.2.6-blue.svg)](CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

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
- **CI/CD**: GitHub Actions with security scanning and progressive delivery
- **AI Tooling**: Custom AI assistants for code review, performance monitoring, and governance

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (or compatible package manager)
- Docker & Docker Compose (recommended)

### Installation

```bash
npm ci
npm run bootstrap
```

### Development

```bash
npm run dev:all  # Start all services
# or individual services:
npm run dev:api
npm run dev:frontend
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

- `npm run lint` — ESLint across repo with Nx boundary checking
- `npm run format` — Prettier formatting with Biome integration
- `npm run test` — Jest unit tests with coverage reporting
- `npm run test:e2e` — Playwright end-to-end tests
- `npm run build` — Nx build with caching and parallelization
- `npm run typecheck` — TypeScript compilation checking

### Development Servers

- `npm run dev:api` — Start API server with hot reload
- `npm run dev:frontend` — Start frontend with webpack dev server
- `npm run dev:all` — Start all services with Docker Compose

### AI-Assisted Development

- `npm run ai:review` — AI code review and suggestions
- `npm run ai:blackbox` — Governance compliance checking
- `npm run ai:performance` — Performance monitoring and optimization

## Testing

The project maintains comprehensive test coverage across multiple dimensions:

- **Unit Tests**: Jest with 70%+ coverage target
- **Integration Tests**: API and service interactions
- **E2E Tests**: Playwright for critical user journeys
- **Accessibility Tests**: Automated WCAG 2.2 AA+ validation
- **Security Tests**: OWASP Top 10 and dependency scanning

Run tests with:

```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:a11y         # Accessibility tests
```

## Contributing

See [Contributing Guide](docs/contributing.md) and [.blackboxrules](.blackboxrules) for governance rules.

### Development Workflow

1. Fork and create feature branch
2. Follow conventional commits
3. Ensure tests pass and coverage maintained
4. Run `npm run ai:review` for AI-assisted code review
5. Submit PR with comprehensive description

## Documentation

- [Architecture Decision Records](docs/architecture/decisions/)
- [API Documentation](docs/api/)
- [Deployment Guide](docs/operations/deployment.md)
- [Security Guidelines](docs/security/)
- [Contributing Guide](docs/contributing.md)

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

### Getting Help

- Check [CHANGELOG.md](CHANGELOG.md) for recent changes
- Review [TODO.md](TODO.md) for known issues
- Run `npm run validate:env` to check environment setup

---

_Last updated: 2025-11-01_
