# Political Sphere Dev Platform

This workspace hosts the reference implementation for Political Sphere's multi-environment development platform. The stack is split into logical repositories housed in sibling directories:

- `infrastructure/`: Terraform modules and environment overlays for AWS.
- `platform/`: Kubernetes Helm charts, GitOps manifests, and cluster add-ons.
- `ci/`: Reusable GitHub Actions workflows and automation tooling.
- `dev/`: Local development tooling, Docker Compose stacks, and onboarding scripts.
- `docs/`: Architecture references, runbooks, security guides, and delivery reports.

Each directory is intended to be published as its own Git repository under the `political-sphere` GitHub organization. From this mono-workspace you can iterate locally, then mirror changes into their respective repos.
