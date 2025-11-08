# GitHub CI/CD map for Political Sphere

This document explains the CI/CD triggers, key jobs, ownership, and how to run workflows locally.

## 📁 .github Directory Structure

```mermaid
graph TB
    GitHub[.github/]
    
    GitHub --> Workflows[workflows/]
    Workflows --> wf_ci[ci.yml]
    Workflows --> wf_docker[docker.yml]
    Workflows --> wf_release[release.yml]
    Workflows --> wf_security[security.yml]
    Workflows --> wf_testSetup[test-setup-node-action.yml]
    Workflows --> wf_testRun[test-run-tests-action.yml]
    
    GitHub --> Actions[actions/]
    Actions --> act_setupNode[setup-node/]
    act_setupNode --> act_setupNodeAction[action.yml]
    act_setupNode --> act_setupNodeReadme[README.md]
    
    Actions --> act_setupNodeDeps[setup-node-deps/]
    act_setupNodeDeps --> act_setupNodeDepsAction[action.yml]
    act_setupNodeDeps --> act_setupNodeDepsReadme[README.md]
    
    Actions --> act_qualityChecks[quality-checks/]
    act_qualityChecks --> act_qualityAction[action.yml]
    act_qualityChecks --> act_qualityReadme[README.md]
    
    Actions --> act_runTests[run-tests/]
    act_runTests --> act_runTestsAction[action.yml]
    act_runTests --> act_runTestsReadme[README.md]
    
    Actions --> act_deploy[deploy/]
    act_deploy --> act_deployAction[action.yml]
    act_deploy --> act_deployReadme[README.md]
    
    GitHub --> Documentation[documentation/]
    Documentation --> doc_codeowners[CODEOWNERS]
    Documentation --> doc_security[SECURITY.md]
    Documentation --> doc_support[SUPPORT.md]
    
    GitHub --> Templates[ISSUE_TEMPLATE/]
    Templates --> tpl_bugReport[bug_report.yml]
    Templates --> tpl_featureRequest[feature_request.yml]
    Templates --> tpl_config[config.yml]
    
    GitHub --> root_PR[PULL_REQUEST_TEMPLATE.md]
    GitHub --> root_Dependabot[dependabot.yml]
    GitHub --> root_Instructions[copilot-instructions.md]
    GitHub --> root_Readme[README.md]
    
    style GitHub fill:#FF6F00,stroke:#E65100,stroke-width:3px,color:#fff
    style Workflows fill:#4CAF50,stroke:#2E7D32,stroke-width:2px,color:#fff
    style Actions fill:#2196F3,stroke:#1565C0,stroke-width:2px,color:#fff
    style Documentation fill:#9C27B0,stroke:#6A1B9A,stroke-width:2px,color:#fff
    style Templates fill:#FF9800,stroke:#E65100,stroke-width:2px
    style root_PR fill:#00BCD4,stroke:#00838F,stroke-width:2px
    style root_Dependabot fill:#795548,stroke:#4E342E,stroke-width:2px
    style root_Instructions fill:#E91E63,stroke:#880E4F,stroke-width:2px
    style root_Readme fill:#607D8B,stroke:#37474F,stroke-width:2px
```

### Directory Purpose

| Directory/File | Purpose |
|----------------|---------|
| **workflows/** | GitHub Actions workflow definitions for CI/CD automation |
| **actions/** | Reusable composite actions used across workflows |
| **documentation/** | Project governance documents (CODEOWNERS, SECURITY, SUPPORT) |
| **ISSUE_TEMPLATE/** | Issue templates for bug reports, feature requests, etc. |
| **PULL_REQUEST_TEMPLATE.md** | Template for pull request descriptions |
| **dependabot.yml** | Automated dependency update configuration |
| **copilot-instructions.md** | GitHub Copilot custom instructions and coding standards |
| **README.md** | This file - CI/CD documentation and workflow guide |

---

## Triggers → Jobs → Required Checks

- `verify-github-config` (manual / PRs touching `.github/`) — validates GHA linting, naming conventions, and single dependency bot.
- `verify-github-config` job runs: `actionlint`, `yamllint`, `scripts/ci/verify-github-config.mjs`.
- `verify-ci` (main CI) — comprehensive pipeline: pre-flight checks, lint/typecheck, tests, security scans, build, integration/e2e.

## Who owns what

- Platform engineering (`@political-sphere/platform-team`) owns GitHub workflows and `.github/actions`.
- Infrastructure team owns IaC and `apps/infrastructure`.
- Security team owns security scans and `SECURITY.md`.

## Running checks locally

Prereqs: `node` and `npm` or `pnpm` installed. For local run of GHA lints you can use `npx` or install tools globally.

Run the GitHub Actions lints and custom checks locally:

```bash
# From repository root
npm run ci:lint-gha
```

To run workflows locally you can use `act` (https://github.com/nektos/act). Example:

```bash
act workflow_dispatch -W .github/workflows/verify-github-config.yml
```

Note: `act` may not support all actions and service containers exactly as GitHub-hosted runners do. Use it for lightweight checks only.

## Available Composite Actions

### setup-node-deps

Sets up Node.js and installs dependencies with caching.

```yaml
- uses: ./.github/actions/setup-node-deps
  with:
    node-version: "22" # default: '22'
    cache: "npm" # default: 'npm'
    install-command: "npm ci" # default: 'npm ci'
```

### setup-node

Sets up Node.js with optional package manager caching (no installation).

```yaml
- uses: ./.github/actions/setup-node
  with:
    node-version: "20"
    cache: "npm" # npm|yarn|pnpm|none
```

### quality-checks

Runs linting, type checking, and format validation.

```yaml
- uses: ./.github/actions/quality-checks
  with:
    run-lint: "true" # default: 'true'
    run-typecheck: "true" # default: 'true'
    run-format-check: "true" # default: 'true'
```

### run-tests

Orchestrates test execution with coverage and sharding support.

```yaml
- uses: ./.github/actions/run-tests
  with:
    test-type: "unit" # unit|integration|e2e|coverage
    coverage-enabled: "true"
    coverage-threshold: 80
```

### deploy

Handles deployment to various environments (staging, production).

See [actions/deploy/README.md](actions/deploy/README.md) for details.

## Conventions

- Workflow files must use kebab-case filenames and start with a verb token (e.g., `run-tests.yml`, `publish-release.yml`). This repo includes an automated check `verify-github-config` - it warns on violations.
- Composite actions in `.github/actions/*` must include `action.yml` and `README.md` with inputs/outputs and an explicit changelog section.
- Single source of truth for dependency automation: dependabot.yml is used for this repo.

### Local prerequisites for full validation

To run the full validation locally (including `actionlint`), install the following locally:

```bash
# install actionlint locally (recommended for full checks)
npm install -D actionlint || pnpm add -D actionlint

# yamllint is a Python tool; install via pip if you want YAML validation locally
python3 -m pip install --user yamllint
```

After installing, `npm run ci:lint-gha` will run the verifier and `actionlint` locally.

## Contacts & Escalation

If a workflow or action causes incidents, tag `@political-sphere/platform-team` and open an incident in `reports/`.
