# Political Sphere

[![Version](https://img.shields.io/badge/version-1.2.6-blue.svg)](CHANGELOG.md)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](package.json)
[![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-130%2F130%20passing-success)](docs/TODO.md)
[![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](coverage/)
[![Audit](https://img.shields.io/badge/audit-in%20progress-yellow)](#project-status)

A democratically-governed multiplayer political simulation game built as a monorepo using Nx. Features React frontend, Node.js/NestJS backend, comprehensive testing, and AI-assisted development tooling with strict constitutional governance.

## Table of Contents

- [Project Status](#project-status)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Development](#development)
- [Testing](#testing)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [License](#license)

## Project Status

| Category             | Status            | Details                                |
| -------------------- | ----------------- | -------------------------------------- |
| **Unit Tests**       | ✅ 100% (130/130) | All unit tests passing                 |
| **Test Coverage**    | ✅ 100%           | Complete test suite stabilized         |
| **Security Audit**   | 🔄 In Progress    | 10 critical, 21 high issues identified |
| **CI/CD Pipeline**   | ✅ Active         | Test & audit workflows enabled         |
| **Production Ready** | ⚠️ Not Yet        | Addressing audit findings              |

## Features

- **Democratic Governance**: Constitutional framework with transparent decision-making
- **Multiplayer Simulation**: Real-time political scenario modeling
- **Ethical AI Integration**: AI assistants with strict governance boundaries
- **Comprehensive Testing**: Unit, integration, e2e, accessibility, and security testing
- **Zero-Trust Security**: End-to-end encryption and auditability
- **Accessibility First**: WCAG 2.2 AA+ compliance across all interfaces

## Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm (or compatible package manager)
- Docker & Docker Compose (recommended)

### Setup

```bash
npm install
# Optional: Run health checks
npm run preflight
```

## Usage

### Development Servers

```bash
npm run dev              # Start Docker services for API
npm run serve:frontend   # Launch Vite dev server for frontend
```

### Build

```bash
npm run build:frontend   # Build the frontend
```

### AI-Assisted Development

```bash
npm run ai:review        # AI code review and suggestions
npm run ai:blackbox      # Governance compliance checking
```

## Development

### Available Commands

- `npm run lint:fix` — ESLint with auto-fix
- `npm run format` — Prettier formatting
- `npm run type-check` — TypeScript type checking
- `npm run test` — Run unit tests
- `npm run test:coverage` — Tests with coverage report

### Project Structure

```
apps/          # Applications (api, frontend, worker)
libs/          # Shared libraries
docs/          # Documentation and ADRs
scripts/       # Automation scripts
.github/       # Workflows and templates
```

## Testing

Run comprehensive tests:

```bash
npm run test              # Unit tests
npm run test:e2e          # End-to-end tests
npm run test:a11y         # Accessibility tests
npm run test:integration  # Integration tests
```

## Contributing

See [Contributing Guide](CONTRIBUTING.md) and [.blackboxrules](.blackboxrules) for governance rules.

1. Fork and create a feature branch
2. Follow conventional commits
3. Ensure tests pass and coverage is maintained
4. Submit a PR with a comprehensive description

## Documentation

- [Architecture](docs/STRUCTURE.md)
- [API Docs](docs/api.md)
- [Security Guidelines](SECURITY.md)
- [TODO List](docs/TODO.md)
- [CHANGELOG](CHANGELOG.md)

## License

All Rights Reserved. See [LICENSE](LICENSE) for details.
