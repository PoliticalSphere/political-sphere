#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
ENV_FILE="$ROOT_DIR/.env"
LOCAL_ENV_FILE="$ROOT_DIR/.env.local"

if [[ -f "$ENV_FILE" ]]; then
  source "$ENV_FILE"
fi
if [[ -f "$LOCAL_ENV_FILE" ]]; then
  source "$LOCAL_ENV_FILE"
fi

COMPOSE_FILE="$ROOT_DIR/dev/docker/docker-compose.dev.yaml"
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-politicalsphere}

export COMPOSE_PROJECT_NAME

echo "Starting Political Sphere local stack..."
docker compose -f "$COMPOSE_FILE" up -d --build --remove-orphans

echo "Services running. Use ./dev/scripts/dev-down.sh to stop."
