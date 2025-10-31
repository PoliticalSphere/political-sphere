# Political Sphere Dev Platform

This workspace hosts the reference implementation for Political Sphere's multi-environment development platform. The stack is split into logical repositories housed in sibling directories:

- `infrastructure/`: Terraform modules and environment overlays for AWS.
- `platform/`: Kubernetes Helm charts, GitOps manifests, and cluster add-ons.
- `ci/`: Reusable GitHub Actions workflows and automation tooling.
- `dev/`: Local development tooling, Docker Compose stacks, and onboarding scripts.
- `docs/`: Architecture references, runbooks, security guides, and delivery reports.

Each directory is intended to be published as its own Git repository under the `political-sphere` GitHub organization. From this mono-workspace you can iterate locally, then mirror changes into their respective repos.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Docker & Docker Compose
- (Optional) PostgreSQL client for local DB access

### Bootstrap

Run the bootstrap script to set up your development environment:

```bash
npm run bootstrap
```

This will:

- Install dependencies
- Set up pre-commit hooks
- Start the dev stack (Docker Compose)
- Seed the database
- Build documentation

### Development

Start all services:

```bash
npm run dev:all
```

Or start individual services:

```bash
npm run dev:api
npm run dev:frontend
npm run dev:worker
```

### Fast AI mode (optional)

For local AI-assisted workflows where speed matters more than exhaustive checks, you can enable a fast mode that:

- Reduces heavy quality gates (skips linting and security scans, relaxes test coverage threshold)
- Disables verbose audit logging of every interaction
- Skips interactive git hooks (pre-push prompts, pre-commit checks) to avoid getting stuck

Enable fast mode for your shell session:

```bash
. scripts/env-config.sh   # sets FAST_AI=1 and disables interactive hooks for this session
```

Disable by unsetting FAST_AI or starting a new shell:

```bash
unset FAST_AI
```

Note: Fast mode is intended for local iteration. CI pipelines and normal development should run with full quality gates.

### Pre-commit Hooks

Pre-commit hooks are automatically installed during bootstrap. They run on every commit to ensure code quality, security, and accessibility:

**What runs on commit:**
- **lint-staged**: ESLint (linting) + Prettier (formatting) on staged JS/TS files
- **cspell**: Spell checking on code and documentation
- **a11y**: Accessibility checks (WCAG 2.2 AA+) on UI components
- **import-boundaries**: Module boundary enforcement to maintain clean architecture
- **secrets**: Secret scanning to prevent credential leaks

**Commit message validation:**
- **commitlint**: Enforces conventional commit format (e.g., `feat:`, `fix:`, `docs:`)

If any check fails, the commit will be blocked. Fix the issues and try again.

**Fast mode**: Set `FAST_AI=1` to skip pre-commit checks during rapid local iteration (not recommended for normal development).

### Testing

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run e2e:prepare  # Start stack and seed DB
npm run test:e2e
```

### Documentation

Build and serve docs locally:

```bash
npm run docs:build
# Open docs/.vitepress/dist/index.html
```
