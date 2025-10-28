# Political Sphere Local Development

This directory contains tooling to spin up a production-parity developer environment using Docker Compose and Nx. The stack mirrors the Kubernetes deployment layout (api, frontend, worker, auth, db-proxy) and provisions backing services (PostgreSQL, Redis, MailHog, localstack) so engineers can iterate without touching cloud resources.

## Prerequisites

- Docker Desktop 4.x or compatible Docker Engine
- Node.js 20.x + npm (or pnpm) for Nx commands
- Optional: Tilt v0.33+ if you prefer live-reload orchestration (see `Tiltfile`)

## Quick Start

```bash
# copy environment templates
cp dev/templates/.env.example .env
cp dev/templates/.env.local.example .env.local

# start local stack
./dev/scripts/dev-up.sh

# run Nx dev servers with hot reload
npm install
npm run dev:all
```

The compose stack exposes core ports:

| Service    | URL                           |
|-----------|-------------------------------|
| Frontend   | http://localhost:3000         |
| API        | http://localhost:4000         |
| Auth (Keycloak) | http://localhost:8080    |
| MailHog UI | http://localhost:8025         |
| pgAdmin    | http://localhost:5050 (optional login: `admin@example.com` / `admin`)

## Scripts

- `dev-up.sh` – builds images (if needed) and starts docker-compose in detached mode.
- `dev-down.sh` – stops and removes containers, networks, volumes.
- `seed-data.sh` – applies Prisma migrations (or equivalent) and loads sample fixtures.

All scripts respect `.env` for shared settings. Override service-specific values in `.env.local`.

## Tilt (Opt-in)

The provided `Tiltfile` (optional) watches source directories and live-builds containers when files change. Launch with:

```bash
tilt up
```

## Testing Locally

Use Nx targets to trigger tests against the compose stack:

```bash
npx nx test api
npx nx e2e frontend-e2e --configuration=local
```

See `dev/scripts/README.md` for advanced scripting tips and the `docs/onboarding.md` for in-depth onboarding instructions.
