# Political Sphere Repository Audit TODO

## Critical Priority (Security & Compliance)
- [ ] Implement secure secret management using KMS/SM for all sensitive data (aligned with J) Security & Threat Model).
- [ ] Add GDPR compliance checks for AI features, telemetry, and data processing, including DPIA references and DSR workflows (aligned with K) Compliance Hooks).
- [ ] Enforce RBAC/ABAC policy matrix in the policy layer, including server-side evaluation and audit events (aligned with B) RBAC/ABAC Policy Matrix).
- [ ] Implement safety and moderation workflow with classifier signals, triage SLA, and appeals process (aligned with I) Safety & Moderation Workflow).
- [ ] Establish security threat model mitigations, including OIDC/MFA, input validation, audit logging, and rate limiting (aligned with J) Security & Threat Model).

## High Priority (Architecture & Domain Implementation)
- [ ] Implement parliamentary domain rules, including calendar/sessions, bill lifecycle stages, debate states, divisions with whip pressure, and FPTP elections (aligned with A) Parliamentary Domain Rules).
- [ ] Implement tenancy and data partitioning with row-level tenancy using tenant_id and RLS policies, with upgrade path to schema-per-tenant (aligned with C) Tenancy & Data Partitioning).
- [ ] Implement data models and aggregates, including User, PlayerProfile, Party, MP, Debate, Vote, AuditEvent, with PII tagging and retention (aligned with D) Data Model Notes).
- [ ] Implement API surface with GraphQL queries/mutations/subscriptions and REST endpoints for ops/webhooks, including idempotency (aligned with E) API Surface Defaults).
- [ ] Implement realtime and eventing using WS transport, NATS domain events, and outbox pattern (aligned with F) Realtime & Eventing).
- [ ] Implement NPC/AI simulation layer with tick loop, agent policies, deterministic core + stochastic LLM planner, and evaluation metrics (aligned with H) NPC/AI Simulation Layer).
- [ ] Implement caching and performance optimizations with Redis read-through cache, invalidation policies, and performance budgets (aligned with G) Caching & Performance).
- [ ] Implement observability with OpenTelemetry tracing, structured logging, dashboards, and SLO alerting (aligned with L) Observability Implementation).

## High Priority (Performance & Quality)
- [ ] Implement proper database layer with PostgreSQL, migrations, indexes, and N+1 avoidance using GraphQL dataloaders (aligned with C, D, G).
- [ ] Standardize testing framework with Jest, factories, contract tests, Playwright E2E, load testing with k6, and a11y checks (aligned with M) Testing Strategy).
- [ ] Implement Redis for rate limiting, caching, and session management (aligned with G, J).
- [ ] Remove duplicate exports and consolidate utilities following naming conventions (aligned with P) Directory & Naming Conventions).
- [ ] Implement centralized logging with correlation IDs and structured fields (aligned with L).

## Medium Priority (Developer Experience)
- [ ] Enhance documentation and onboarding guides, including ADR template usage and glossary expansion (aligned with U, V).
- [ ] Simplify npm scripts organization and integrate Biome into linting pipeline (aligned with O) Pre-commit & Quality Gates).
- [ ] Add markdown and documentation linting to pre-commit hooks (aligned with O).
- [ ] Follow directory and naming conventions with Nx monorepo structure (aligned with P).

## Medium Priority (CI/CD & Operations)
- [ ] Implement CI/CD workflows with GitHub Actions for lint, typecheck, unit, build, e2e, security scans, and releases (aligned with N) CI/CD).
- [ ] Implement selective CI triggers based on changed files and add Docker build caching/optimization (aligned with N).
- [ ] Optimize workflow concurrency, resource allocation, and implement cost guardrails (aligned with N, R).
- [ ] Implement backup and DR with PITR, versioning, and tested restores (aligned with S) Backup & DR).
- [ ] Implement migration and compatibility with safe DB migrations and API deprecations (aligned with Q) Migration & Compatibility).

## Implementation Steps
- [ ] Start with implementing data models and database layer (PostgreSQL with RLS).
- [ ] Implement RBAC/ABAC and security threat model mitigations.
- [ ] Develop API surface (GraphQL/REST) and realtime eventing.
- [ ] Implement parliamentary domain rules and NPC/AI simulation.
- [ ] Add observability, testing strategy, and CI/CD pipelines.
- [ ] Integrate safety/moderation and compliance hooks.
- [ ] Update documentation and ensure adherence to conventions.
