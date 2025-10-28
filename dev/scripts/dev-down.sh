#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
COMPOSE_FILE="$ROOT_DIR/dev/docker/docker-compose.dev.yaml"

if [[ -f "$ROOT_DIR/.env" ]]; then
  source "$ROOT_DIR/.env"
fi
if [[ -f "$ROOT_DIR/.env.local" ]]; then
  source "$ROOT_DIR/.env.local"
fi

COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-politicalsphere}
export COMPOSE_PROJECT_NAME

echo "Stopping Political Sphere local stack..."
docker compose -f "$COMPOSE_FILE" down --remove-orphans --volumes
