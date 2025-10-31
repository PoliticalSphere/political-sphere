# Monorepo Standards (Nx)

> **Guidelines for managing the Political Sphere Nx monorepo**

<div align="center">

| Classification | Version | Last Updated |      Owner       | Review Cycle |   Status   |
| :------------: | :-----: | :----------: | :--------------: | :----------: | :--------: |
|  🔒 Internal   | `0.2.0` |  2025-10-30  | Platform Council |   Quarterly  | **Draft** |

</div>

---

## 🎯 Objectives

- Maximize code reuse and maintainability across apps and libs.
- Enable efficient CI/CD with affected-based builds and caching.
- Enforce architectural boundaries and dependency rules.
- Support scalable development in a zero-budget environment.

---

## 🧱 Nx Workspace Structure

```
apps/
├── api/          # Backend API (Fastify + GraphQL)
├── frontend/     # Main React app
├── worker/       # Background job processor
├── host/         # Module federation host
├── remote/       # Module federation remote
├── infrastructure/ # IaC and deployment
└── dev/          # Development tools

libs/
├── shared/       # Common utilities, types, constants
├── ui/           # Reusable React components
├── infrastructure/ # Infra modules (e.g., DB, auth)
└── platform/     # Platform-specific configs

tools/
├── executors/    # Custom Nx executors
├── generators/   # Code generators
└── scripts/      # Build and utility scripts
```

---

## 📋 Project Configuration

### nx.json
- **Named Inputs:** Define `production` and `test` inputs for selective builds.
- **Target Defaults:** Configure caching, parallelization, and affected strategies.
- **Release:** Use Nx release for versioning and publishing.

### project.json (per project)
- **Targets:** Define build, test, lint, e2e targets with appropriate configurations.
- **Dependencies:** Use implicitDeps for shared libs; explicit for cross-boundary deps.
- **Tags:** Apply tags like `scope:shared`, `type:app` for access control.

---

## 🔗 Dependency Rules

| From | To | Allowed | Rationale |
| ---- | -- | ------- | --------- |
| apps/* | libs/shared | ✅ | Core utilities |
| apps/* | libs/ui | ✅ | UI components |
| apps/* | libs/infrastructure | ✅ | Infra services |
| apps/* | libs/platform | ✅ | Platform configs |
| libs/shared | libs/* | ❌ | No upward deps |
| libs/ui | libs/shared | ✅ | Depends on utils |
| libs/infrastructure | libs/shared | ✅ | Depends on utils |
| libs/platform | libs/* | ❌ | Config only |

**Enforcement:** Use Nx dep-graph and lint rules to prevent violations.

---

## 🛠️ Development Commands

| Command | Purpose | Example |
| ------- | ------- | ------- |
| `nx build <project>` | Build specific project | `nx build api` |
| `nx test <project>` | Run tests for project | `nx test shared` |
| `nx lint <project>` | Lint project | `nx lint frontend` |
| `nx graph` | Visualize dependencies | `nx graph` |
| `nx affected --target=build` | Build only affected projects | `nx affected --target=build` |
| `nx run-many --target=test --all` | Test all projects | `nx run-many --target=test --all` |

---

## 📦 Library Sharing

- **Publishable Libs:** Use `@political-sphere/shared` for npm publishing if needed.
- **Internal Libs:** Keep private; import via relative paths or Nx paths.
- **Versioning:** Semantic versioning; use Nx release for automated tagging.

---

## 🚀 CI/CD Integration

- **Affected Builds:** Use `nx affected` to build/test only changed projects.
- **Caching:** Enable Nx Cloud (free tier) for remote caching.
- **Parallelization:** Run targets in parallel where possible.
- **Artifacts:** Store build outputs for deployment.

---

## 📎 Best Practices

- **Project Naming:** Use kebab-case (e.g., `political-core`).
- **Code Generators:** Create templates for new apps/libs to ensure consistency.
- **Migrations:** Use Nx migrations for workspace updates.
- **Documentation:** Maintain READMEs in each project root.

---

## 📎 Related Documents

- [Coding Standards](coding-standards-typescript-react.md)
- [Branching and Release Strategy](branching-and-release-strategy.md)
- [CI/CD Pipelines](../ci-cd/README.md)

Nx enables scalable monorepo management—follow these standards for efficient development.
