# GitHub CI/CD map for Political Sphere

This document explains the CI/CD triggers, key jobs, ownership, and how to run workflows locally.

## 📁 .github Directory Structure

```mermaid
graph TB
    GitHub[📁 .github/]

    %% Workflows Directory
    GitHub --> Workflows[📁 workflows/]
    Workflows --> wf_ci[📄 ci.yml]
    Workflows --> wf_docker[📄 docker.yml]
    Workflows --> wf_release[📄 release.yml]
    Workflows --> wf_security[📄 security.yml]
    Workflows --> wf_testSetup[📄 test-setup-node-action.yml]
    Workflows --> wf_testRun[📄 test-run-tests-action.yml]

    %% Actions Directory
    GitHub --> Actions[📁 actions/]

    Actions --> act_deploy[📁 deploy/]
    act_deploy --> deploy_action[📄 action.yml]
    act_deploy --> deploy_readme[📄 README.md]
    act_deploy --> deploy_changelog[📄 CHANGELOG.md]
    act_deploy --> deploy_argocd[📄 argocd-sync.sh]
    act_deploy --> deploy_build[📄 build-and-push.sh]
    act_deploy --> deploy_helm[📄 helm-deploy.sh]
    act_deploy --> deploy_kubectl[📄 kubectl-apply.sh]
    act_deploy --> deploy_rollback[📄 rollback.sh]
    act_deploy --> deploy_run[📄 run-deploy.sh]
    act_deploy --> deploy_validate[📄 validate-manifests.sh]
    act_deploy --> deploy_test[📁 test/]

    Actions --> act_qualityChecks[📁 quality-checks/]
    act_qualityChecks --> quality_action[📄 action.yml]
    act_qualityChecks --> quality_readme[📄 README.md]
    act_qualityChecks --> quality_changelog[📄 CHANGELOG.md]

    Actions --> act_runTests[📁 run-tests/]
    act_runTests --> tests_action[📄 action.yml]
    act_runTests --> tests_readme[📄 README.md]
    act_runTests --> tests_changelog[📄 CHANGELOG.md]
    act_runTests --> tests_coverage[📄 coverage.config.json]
    act_runTests --> tests_parse[📄 parse-results.mjs]
    act_runTests --> tests_run[📄 run-tests.sh]
    act_runTests --> tests_upload[📄 upload-artifacts.sh]
    act_runTests --> tests_folder[📁 tests/]

    Actions --> act_setupNode[📁 setup-node/]
    act_setupNode --> node_action[📄 action.yml]
    act_setupNode --> node_readme[📄 README.md]
    act_setupNode --> node_changelog[📄 CHANGELOG.md]
    act_setupNode --> node_script[📄 setup-node.sh]

    Actions --> act_setupNodeDeps[📁 setup-node-deps/]
    act_setupNodeDeps --> deps_action[📄 action.yml]
    act_setupNodeDeps --> deps_readme[📄 README.md]
    act_setupNodeDeps --> deps_changelog[📄 CHANGELOG.md]

    %% Documentation Directory
    GitHub --> Documentation[📁 documentation/]
    Documentation --> doc_codeowners[📄 CODEOWNERS]
    Documentation --> doc_security[📄 SECURITY.md]
    Documentation --> doc_support[📄 SUPPORT.md]

    %% Issue Templates Directory
    GitHub --> IssueTemplates[📁 ISSUE_TEMPLATE/]
    IssueTemplates --> tpl_bug[📄 bug_report.yml]
    IssueTemplates --> tpl_feature[📄 feature_request.yml]
    IssueTemplates --> tpl_security[📄 security_report.yml]

    %% PR Template Directory
    GitHub --> PRTemplates[📁 PULL_REQUEST_TEMPLATE/]
    PRTemplates --> pr_template[📄 PULL_REQUEST_TEMPLATE.md]

    %% Root Files
    GitHub --> root_dependabot[📄 dependabot.yml]
    GitHub --> root_copilot[📄 copilot-instructions.md]
    GitHub --> root_readme[📄 README.md]

    %% Styling - Folders (darker, bolder colors)
    style GitHub fill:#FF6F00,stroke:#E65100,stroke-width:3px,color:#fff
    style Workflows fill:#2E7D32,stroke:#1B5E20,stroke-width:2px,color:#fff
    style Actions fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style act_deploy fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style act_qualityChecks fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style act_runTests fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style act_setupNode fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style act_setupNodeDeps fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style deploy_test fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style tests_folder fill:#1565C0,stroke:#0D47A1,stroke-width:2px,color:#fff
    style Documentation fill:#6A1B9A,stroke:#4A148C,stroke-width:2px,color:#fff
    style IssueTemplates fill:#E65100,stroke:#BF360C,stroke-width:2px,color:#fff
    style PRTemplates fill:#00838F,stroke:#006064,stroke-width:2px,color:#fff

    %% Styling - Files (lighter colors)
    style wf_ci fill:#A5D6A7,stroke:#66BB6A,stroke-width:1px
    style wf_docker fill:#A5D6A7,stroke:#66BB6A,stroke-width:1px
    style wf_release fill:#A5D6A7,stroke:#66BB6A,stroke-width:1px
    style wf_security fill:#A5D6A7,stroke:#66BB6A,stroke-width:1px
    style wf_testSetup fill:#A5D6A7,stroke:#66BB6A,stroke-width:1px
    style wf_testRun fill:#A5D6A7,stroke:#66BB6A,stroke-width:1px

    style deploy_action fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_readme fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_changelog fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_argocd fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_build fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_helm fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_kubectl fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_rollback fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_run fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deploy_validate fill:#90CAF9,stroke:#42A5F5,stroke-width:1px

    style quality_action fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style quality_readme fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style quality_changelog fill:#90CAF9,stroke:#42A5F5,stroke-width:1px

    style tests_action fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style tests_readme fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style tests_changelog fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style tests_coverage fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style tests_parse fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style tests_run fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style tests_upload fill:#90CAF9,stroke:#42A5F5,stroke-width:1px

    style node_action fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style node_readme fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style node_changelog fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style node_script fill:#90CAF9,stroke:#42A5F5,stroke-width:1px

    style deps_action fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deps_readme fill:#90CAF9,stroke:#42A5F5,stroke-width:1px
    style deps_changelog fill:#90CAF9,stroke:#42A5F5,stroke-width:1px

    style doc_codeowners fill:#CE93D8,stroke:#AB47BC,stroke-width:1px
    style doc_security fill:#CE93D8,stroke:#AB47BC,stroke-width:1px
    style doc_support fill:#CE93D8,stroke:#AB47BC,stroke-width:1px

    style tpl_bug fill:#FFCC80,stroke:#FFA726,stroke-width:1px
    style tpl_feature fill:#FFCC80,stroke:#FFA726,stroke-width:1px
    style tpl_security fill:#FFCC80,stroke:#FFA726,stroke-width:1px

    style pr_template fill:#80DEEA,stroke:#26C6DA,stroke-width:1px

    style root_dependabot fill:#BCAAA4,stroke:#8D6E63,stroke-width:1px
    style root_copilot fill:#F48FB1,stroke:#EC407A,stroke-width:1px
    style root_readme fill:#B0BEC5,stroke:#78909C,stroke-width:1px
```

### Directory Purpose

| Directory/File               | Purpose                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| **workflows/**               | GitHub Actions workflow definitions for CI/CD automation     |
| **actions/**                 | Reusable composite actions used across workflows             |
| **documentation/**           | Project governance documents (CODEOWNERS, SECURITY, SUPPORT) |
| **ISSUE_TEMPLATE/**          | Issue templates for bug reports, feature requests, etc.      |
| **PULL_REQUEST_TEMPLATE.md** | Template for pull request descriptions                       |
| **dependabot.yml**           | Automated dependency update configuration                    |
| **copilot-instructions.md**  | GitHub Copilot custom instructions and coding standards      |
| **README.md**                | This file - CI/CD documentation and workflow guide           |

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
