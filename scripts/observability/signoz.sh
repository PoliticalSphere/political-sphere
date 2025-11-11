#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="tools/docker/signoz/docker-compose.yml"

usage() {
  cat <<'USAGE'
SigNoz helper

Usage: scripts/observability/signoz.sh <up|down|logs>

  up    Start the SigNoz stack in detached mode
  down  Stop the stack and remove containers
  logs  Tail aggregated logs
USAGE
}

if [[ $# -ne 1 ]]; then
  usage
  exit 1
fi

ACTION=$1

if [[ ! -f "${COMPOSE_FILE}" ]]; then
  echo "SigNoz compose file not found at ${COMPOSE_FILE}"
  exit 1
fi

case "${ACTION}" in
  up)
    docker compose -f "${COMPOSE_FILE}" up -d
    echo "SigNoz UI available on http://localhost:3301"
    ;;
  down)
    docker compose -f "${COMPOSE_FILE}" down
    ;;
  logs)
    docker compose -f "${COMPOSE_FILE}" logs -f
    ;;
  *)
    usage
    exit 1
    ;;
esac
