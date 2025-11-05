# Architectural Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for significant decisions made in the Political Sphere project, with focus on CI/CD infrastructure.

## What is an ADR?

An ADR is a document that captures an important architectural decision made along with its context and consequences. They help teams understand:

- Why certain decisions were made
- What alternatives were considered
- What trade-offs were accepted
- What impact the decision has

## ADR Format

We use the format proposed by Michael Nygard with slight modifications:

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD
Status: [Proposed | Accepted | Deprecated | Superseded]
Deciders: [list of people involved]
Technical Story: [ticket/issue reference]

## Context and Problem Statement

[Describe the context and problem statement]

## Decision Drivers

- [driver 1]
- [driver 2]
- ...

## Considered Options

- [option 1]
- [option 2]
- ...

## Decision Outcome

Chosen option: "[option]", because [justification].

### Positive Consequences

- [e.g., improvement of quality attribute, ...]

### Negative Consequences

- [e.g., compromising quality attribute, ...]

## Pros and Cons of the Options

### [option 1]

- Good, because [argument a]
- Bad, because [argument b]

## Links

- [Link type] [Link to ADR]
```

## Index of ADRs

### CI/CD Infrastructure

| #                                                 | Title                             | Status   | Date       |
| ------------------------------------------------- | --------------------------------- | -------- | ---------- |
| [001](./001-github-actions-as-ci-platform.md)     | GitHub Actions as CI Platform     | Accepted | 2025-11-05 |
| [002](./002-parallel-test-sharding.md)            | Parallel Test Sharding Strategy   | Accepted | 2025-11-05 |
| [003](./003-composite-actions-for-reusability.md) | Composite Actions for Reusability | Accepted | 2025-11-05 |
| [004](./004-lefthook-for-git-hooks.md)            | Lefthook for Git Hooks Management | Accepted | 2025-11-05 |
| [005](./005-multi-layer-security-scanning.md)     | Multi-Layer Security Scanning     | Accepted | 2025-11-05 |
| [006](./006-oidc-for-cloud-authentication.md)     | OIDC for Cloud Authentication     | Accepted | 2025-11-05 |

### Planned ADRs

- ADR-007: Artifact Signing Strategy
- ADR-008: Error Budget Policy Implementation
- ADR-009: Chaos Testing Approach
- ADR-010: Performance Monitoring and SLOs

## Creating a New ADR

1. Copy the template from `000-template.md`
2. Assign the next sequential number
3. Write a descriptive title using kebab-case
4. Fill in all sections of the template
5. Submit as a PR for team review
6. Update this README with the new ADR

## ADR Lifecycle

```
Proposed → Accepted → [Deprecated | Superseded]
```

- **Proposed**: Under discussion
- **Accepted**: Decision approved and implemented
- **Deprecated**: No longer recommended but not replaced
- **Superseded**: Replaced by another ADR

## Questions?

Contact: Platform Engineering Team (@political-sphere/platform-team)
