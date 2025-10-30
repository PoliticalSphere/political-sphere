# Documentation

> **Single source of truth for Political Sphere’s strategy, architecture, and operating playbooks**

<div align="center">

| Classification | Version | Last Updated |        Owner        | Review Cycle |
| :------------: | :-----: | :----------: | :-----------------: | :----------: |
|  🔒 Internal   | `0.2.0` |  2025-10-30  | Documentation Guild |   Quarterly  |

</div>

---

## 🚀 Product Snapshot

- **One-liner:** Political Sphere is a persistent, multiplayer UK-politics simulation where human players and AI agents operate inside a living parliamentary ecosystem (Commons, Lords, Cabinet, media, civil service) with realism, education, and governance by design.
- **Primary Goals:** Authentic parliamentary mechanics; AI-assisted gameplay and operations; accessibility, safety, and compliance; ISO-aligned governance and auditability; commercial-grade developer experience.
- **Key Personas:** Player, Game Master/Moderator, Educator/Facilitator, Admin/DevOps, AI NPCs/Agents.
- **MVP Scope:** Constituency roster, party formation, Commons calendar, motions/debate/voting, baseline media narrative, simple elections, accounts with RBAC, realtime rooms, notifications, audit logs, first-generation AI NPCs.
- **Architecture Strategy:** Node.js 22 modular monolith (Nx), React + Vite frontends, Fastify + Prisma backend, PostgreSQL + Redis + S3-compatible storage, WebSockets, GraphQL gateway, REST for internal ops, Docker-first deployments.

Use this index to navigate to deeper context and execution guidance for each discipline.

---

## 🗂️ Documentation Map

| Section | Description | What You’ll Find |
| ------- | ----------- | ---------------- |
| **[00 – Foundation](./00-foundation/README.md)** | Mission, values, personas, product principles | Long-term vision, success metrics, stakeholder insights |
| **[01 – Strategy](./01-strategy/README.md)** | Roadmaps, OKRs, commercial decisions | Strategic bets, pricing, partnerships, growth plans |
| **[02 – Governance](./02-governance/README.md)** | Decision rights, ADRs, risk management | Change control, accountability models, escalation paths |
| **[03 – Legal & Compliance](./03-legal-and-compliance/README.md)** | GDPR, Online Safety, EU AI Act readiness | DPIAs, lawful basis register, model transparency |
| **[04 – Architecture](./04-architecture/README.md)** | Technical blueprints and quality attributes | System overview, domain boundaries, API & data architecture |
| **[05 – Engineering & DevOps](./05-engineering-and-devops/README.md)** | Delivery practices, CI/CD, coding standards | Branching strategy, developer experience, release gates |
| **[06 – Security & Risk](./06-security-and-risk/README.md)** | Security posture, threat modelling, controls | OWASP ASVS alignment, secrets management, risk register |
| **[07 – AI & Simulation](./07-ai-and-simulation/README.md)** | AI agent governance and automation | Model inventory, evaluation, safety instrumentation |
| **[08 – Game Design & Mechanics](./08-game-design-and-mechanics/README.md)** | Parliamentary gameplay systems | Debate loops, elections, NPC behaviour, balancing |
| **[09 – Observability & Ops](./09-observability-and-ops/README.md)** | SLOs, dashboards, incident workflows | On-call handbook, telemetry standards, capacity planning |
| **[10 – People & Policy](./10-people-and-policy/README.md)** | Team practices and culture | Code of conduct, performance frameworks, vendor management |
| **[11 – Commercial & Finance](./11-commercial-and-finance/README.md)** | Go-to-market, pricing, unit economics | Customer SLAs, sales playbooks, financial models |
| **[12 – Communications & Brand](./12-communications-and-brand/README.md)** | Messaging, transparency, crisis comms | Brand guidelines, public roadmap, reporting templates |
| **[Document Control](./document-control/README.md)** | Meta-governance for docs | Classification policy, workflows, retention rules |

---

## 🔍 How to Use This Repository

- **Start with Foundation:** Align on mission, values, personas, and success metrics before diving into execution plans.
- **Follow Strategy → Architecture → Execution:** Each layer builds on the previous one—validate assumptions before committing to implementation detail.
- **Reference Domain Maps:** Architecture, data, and AI documents map bounded contexts (Identity & Access, Parliamentary Core, Debates, Media, Safety, etc.) to keep the modular monolith coherent.
- **Integrate Compliance Early:** Legal, security, and governance sections codify GDPR, Online Safety Act, ISO-aligned controls—use them to guide feature design, reviews, and audits.
- **Leverage Playbooks:** Engineering, observability, and operations sections provide ready-to-run checklists, runbooks, and quality gates to accelerate delivery without sacrificing rigor.

---

## 🧭 Maintenance & Contributions

- **Ownership:** Documentation Guild curates structure; domain leads maintain individual files.
- **Change Workflow:** Use the [Review & Approval Workflow](./document-control/review-and-approval-workflow.md) with appropriate classification and version increments.
- **Traceability:** Link updates to tickets, ADRs, or incident reports. Document deviations from standards in change logs.
- **Feedback Loop:** Raise documentation issues in `#documentation` or via GitHub issues; quarterly reviews ensure relevance and compliance.

---

## 📬 Support

- 📧 **Email:** docs@politicalsphere.com
- 💬 **Slack:** `#documentation`
- 🗂️ **Templates:** [Templates Index](./document-control/templates-index.md)
- 🧪 **Automation:** `npm run validate:doc -- <path>` for linting and compliance checks

Documentation is a living system—treat these guides as the contract that keeps Political Sphere cohesive, compliant, and shipping at pace.
