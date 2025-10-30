# Architecture

> **Blueprint for Political Sphere’s modular monolith, technical guardrails, and quality attributes**

<div align="center">

| Classification | Version | Last Updated |      Owner       | Review Cycle |
| :------------: | :-----: | :----------: | :--------------: | :----------: |
|  🔒 Internal   | `0.2.0` |  2025-10-30  | Platform Council |   Quarterly  |

</div>

---

## 🛰️ Architecture North Star

- **Style:** Modular monolith built on Nx to enforce bounded contexts while enabling fast iteration.
- **Runtime:** Node.js 22 with TypeScript end-to-end (Fastify backend, React + Vite frontend, shared libraries).
- **APIs:** GraphQL gateway for player UX; REST/OpenAPI for internal ops, webhooks, and automation; tRPC optional for local DX.
- **Data:** PostgreSQL primary store; Redis for caching, queues, and rate limiting; S3-compatible object storage for media.
- **Realtime:** WebSockets (Socket.IO-compatible abstraction) for chambers, debates, notifications.
- **Eventing:** NATS-backed domain events; evolve to Kafka when team ownership or throughput demands it.
- **Infrastructure:** Docker-first; GitHub Actions CI/CD; path to Kubernetes once load, tenancy, or isolation requires it.

This section defines the structural decisions that keep gameplay, AI automation, and compliance features evolving safely and predictably.

---

## 🗂️ Contents

| Document | Focus | Highlights |
| -------- | ----- | ---------- |
| **[System Overview](./system-overview.md)** | End-to-end topology, environments, deployment view | Core services, runtime topology, delivery pipeline |
| **[Domain-Driven Design Map](./domain-driven-design-map.md)** | Bounded contexts & ownership | Identity & Access, Parliamentary Core, AI Simulation, Safety, Observability |
| **[Context Diagrams (C4)](./context-diagrams-c4.md)** | Level 1–2 diagrams | Player flows, moderator tooling, external integrations |
| **[API Architecture](./api-architecture/README.md)** | Interface strategy & standards | GraphQL schema conventions, REST OpenAPI, versioning |
| **[Data Architecture](./data-architecture/README.md)** | Persistence, lifecycle, retention | ERDs, tenancy approach, backup strategy, PII catalog |
| **[Scalability & Performance](./scalability-and-performance.md)** | NFRs & load strategy | P95 <250 ms, realtime budget 150 ms, capacity planning |
| **[Reliability & Resilience](./reliability-and-resilience.md)** | Failover, redundancy, SLOs | Error budgets, graceful degradation, chaos practices |
| **[Observability Architecture](./observability-architecture.md)** | Telemetry and tracing | OpenTelemetry adoption, correlation IDs, dashboard map |
| **[Cost & FinOps](./cost-architecture-and-finops.md)** | Run rate guardrails | Environment sizing, IaC cost annotations, optimisation levers |

---

## 🎯 Architectural Principles

- **Context Isolation:** Keep modules scoped to domain boundaries (e.g., `parliamentary-core`, `debate-chambers`) with explicit API contracts.
- **Compliance by Design:** Accessibility (WCAG 2.2 AA), privacy (GDPR/DPA), safety (Online Safety Act) and auditability requirements embedded in flows, data models, and logging.
- **AI Guardrails Everywhere:** AI-assisted features run behind observable adapters with deterministic fallbacks, human-in-the-loop checkpoints, and transparency surfaces.
- **Automate Quality:** Tests (unit/integration/contract/E2E), lint, type checks, and accessibility gates enforced in CI with Nx affected pipelines.
- **Operator Empathy:** Build operational hooks (feature flags, configuration APIs, runbooks, telemetry) into every module before scaling out services.

---

## 📐 Quality Attribute Targets

| Attribute | Target | Architectural Responses |
| --------- | ------ | ----------------------- |
| **Availability** | 99.9% (MVP), path to 99.95% | Multi-AZ capable infra, rolling updates, health checks, graceful degradation |
| **Latency** | P95 API <250 ms; realtime <150 ms | Caching (Redis), CQRS-style read models, WebSocket fan-out optimisation |
| **Scalability** | 5k concurrent users baseline | Horizontal pods/containers, elastic queues, backpressure in chat/debate streams |
| **Security** | OWASP ASVS L2 baseline | Centralised auth service, secrets via Vault/KMS, CSP/HSTS, dependency scanning |
| **Privacy** | GDPR/DPA compliant | PII tagging, data minimisation rules, retention matrix, subject rights automation |
| **Accessibility** | WCAG 2.2 AA | Accessible design system, automated axe-core gates, manual audits in release plan |
| **Observability** | Logs/metrics/traces correlated | OpenTelemetry SDKs, structured JSON logs, service dashboards with SLOs |

---

## 🔄 Evolution Path

1. **MVP:** Modular monolith with runtime feature flags, domain events via NATS, managed Postgres.
2. **Scale-Up:** Introduce CQRS projections, dedicated realtime gateway, Kubernetes deployment, Kafka for high-volume streams.
3. **Service Extraction:** Spin out contexts (e.g., AI Simulation engine, Safety moderation queue) when teams require independent scaling, backed by contract tests and shared auth.

All architecture changes must flow through the [ADR process](../02-governance/architectural-decision-records/README.md) and link to measurable outcomes or NFR improvements.

---

## 📬 Questions & Stewardship

- **Architecture Forum:** `#architecture` Slack, bi-weekly design reviews
- **Escalations:** Platform Council → CTO for tie-break decisions
- **Artifacts:** Merge architecture diagrams, ADRs, and experiment logs into this section to maintain institutional memory

The architecture library keeps Political Sphere’s simulation credible, safe, and scalable—treat it as a living contract between product ambition and engineering reality.
