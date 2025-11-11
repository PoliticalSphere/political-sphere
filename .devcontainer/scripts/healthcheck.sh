#!/bin/bash
# Health check script for devcontainer services
# Validates that all required services are running and accessible

set -e

echo "🏥 Running devcontainer health checks..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall health
HEALTHY=true

# Function to check service health
check_service() {
    local service_name=$1
    local check_command=$2
    
    echo -n "Checking ${service_name}... "
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Healthy${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy${NC}"
        HEALTHY=false
        return 1
    fi
}

# Check Node.js
check_service "Node.js" "node --version"

# Check pnpm
check_service "pnpm" "pnpm --version"

# Check TypeScript
check_service "TypeScript" "tsc --version"

# Check Git
check_service "Git" "git --version"

# Check Docker (if available)
if command -v docker &> /dev/null; then
    check_service "Docker" "docker --version"
fi

# Check Redis connection
if [ ! -z "$REDIS_HOST" ]; then
    check_service "Redis" "nc -z ${REDIS_HOST:-redis} ${REDIS_PORT:-6379}"
fi

# Check PostgreSQL connection (if configured)
if [ ! -z "$DATABASE_HOST" ]; then
    check_service "PostgreSQL" "nc -z ${DATABASE_HOST:-postgres} ${DATABASE_PORT:-5432}"
fi

# Check workspace dependencies installed
if [ -f "/workspaces/political-sphere/package.json" ]; then
    if [ -d "/workspaces/political-sphere/node_modules" ]; then
        echo -e "Node modules... ${GREEN}✓ Installed${NC}"
    else
        echo -e "Node modules... ${YELLOW}⚠ Not installed - run 'pnpm install'${NC}"
        HEALTHY=false
    fi
fi

# Check disk space
DISK_USAGE=$(df -h /workspaces | awk 'NR==2 {print $5}' | sed 's/%//')
echo -n "Disk usage... "
if [ "$DISK_USAGE" -lt 80 ]; then
    echo -e "${GREEN}${DISK_USAGE}% (healthy)${NC}"
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${YELLOW}${DISK_USAGE}% (warning)${NC}"
else
    echo -e "${RED}${DISK_USAGE}% (critical)${NC}"
    HEALTHY=false
fi

# Check memory
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
    echo -n "Memory usage... "
    if [ "$MEM_USAGE" -lt 80 ]; then
        echo -e "${GREEN}${MEM_USAGE}% (healthy)${NC}"
    elif [ "$MEM_USAGE" -lt 90 ]; then
        echo -e "${YELLOW}${MEM_USAGE}% (warning)${NC}"
    else
        echo -e "${RED}${MEM_USAGE}% (critical)${NC}"
    fi
fi

# Final status
echo ""
if [ "$HEALTHY" = true ]; then
    echo -e "${GREEN}✅ All health checks passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some health checks failed. Please review the output above.${NC}"
    exit 1
fi
