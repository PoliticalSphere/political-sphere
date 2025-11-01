#!/usr/bin/env bash
set -euo pipefail

echo "🔍 Validating host system requirements..."

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop."
    exit 1
fi

# Check Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

# Check Docker Compose
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose V2 is not available. Please update Docker Desktop."
    exit 1
fi

# Check available resources with better error handling
if AVAILABLE_CPUS=$(docker info --format '{{.NCPU}}' 2>/dev/null); then
    AVAILABLE_CPUS="${AVAILABLE_CPUS:-0}"
else
    AVAILABLE_CPUS="0"
    echo "⚠️  Could not determine CPU count from Docker"
fi

if AVAILABLE_MEMORY=$(docker info --format '{{.MemTotal}}' 2>/dev/null); then
    AVAILABLE_MEMORY="${AVAILABLE_MEMORY:-0}"
else
    AVAILABLE_MEMORY="0"
    echo "⚠️  Could not determine memory from Docker"
fi

# Validate resource requirements
if [ "$AVAILABLE_CPUS" -lt 2 ] 2>/dev/null; then
    echo "⚠️  Warning: Only ${AVAILABLE_CPUS} CPUs available. Recommended: 2+ CPUs"
    echo "   Performance may be degraded."
elif [ "$AVAILABLE_CPUS" -eq 0 ]; then
    echo "❌ Error: Could not determine CPU count. Docker may not be functioning correctly."
    exit 1
fi

if [ "$AVAILABLE_MEMORY" -lt 4294967296 ] 2>/dev/null; then  # 4GB in bytes
    MEMORY_GB=$((AVAILABLE_MEMORY / 1073741824))
    echo "⚠️  Warning: Only ${MEMORY_GB}GB memory available. Recommended: 4GB+"
    echo "   Container may fail to start or perform poorly."
elif [ "$AVAILABLE_MEMORY" -eq 0 ]; then
    echo "❌ Error: Could not determine memory. Docker may not be functioning correctly."
    exit 1
fi

# Check Docker version compatibility
DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' || echo "unknown")
if [[ "$DOCKER_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Basic version check (Docker 20.10+ recommended for Dev Containers)
    DOCKER_MAJOR=$(echo "$DOCKER_VERSION" | cut -d. -f1)
    DOCKER_MINOR=$(echo "$DOCKER_VERSION" | cut -d. -f2)
    if [ "$DOCKER_MAJOR" -lt 20 ] || { [ "$DOCKER_MAJOR" -eq 20 ] && [ "$DOCKER_MINOR" -lt 10 ]; }; then
        echo "⚠️  Warning: Docker version $DOCKER_VERSION may not support all Dev Container features."
        echo "   Recommended: Docker Desktop 20.10+"
    fi
fi

echo "✅ Host system validation passed"
echo "   - Docker: $(docker --version)"
echo "   - Docker Compose: $(docker compose version)"
echo "   - CPUs: ${AVAILABLE_CPUS}"
echo "   - Memory: $((AVAILABLE_MEMORY / 1073741824))GB"
