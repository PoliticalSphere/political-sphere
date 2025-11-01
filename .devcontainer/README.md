# DevContainer Configuration

This directory contains the VS Code DevContainer configuration for the Political Sphere development environment.

## Quick Start

1. **Install Prerequisites:**
   - [Docker Desktop](https://www.docker.com/products/docker-desktop)
   - [VS Code](https://code.visualstudio.com/)
   - [Dev Containers Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

2. **Open in DevContainer:**
   - Open this project in VS Code
   - Click "Reopen in Container" when prompted
   - OR: Press `Cmd/Ctrl + Shift + P` → "Dev Containers: Reopen in Container"

3. **Wait for initialization:**
   - First launch takes 5-15 minutes
   - Scripts will validate system, setup environment, and wait for services
   - See status messages in terminal

4. **Start developing!**
   - Run `npm run dev:all` to start all services
   - See WELCOME.txt for quick reference

## Files

- **devcontainer.json** - Main configuration file
- **Dockerfile** - Container image definition
- **scripts/** - Lifecycle hook scripts
  - `validate-host.sh` - Pre-flight host system checks
  - `setup-env.sh` - Environment file initialization
  - `wait-for-services.sh` - Service readiness validation
  - `status-check.sh` - Environment status display
- **WELCOME.txt** - Developer welcome message

## Architecture

The devcontainer uses Docker Compose to orchestrate multiple services:

### Core Services

- **dev** - Main development container (Node.js 22)
- **postgres** - PostgreSQL 15 database
- **redis** - Redis 7 cache

### Application Services

- **api** - Backend API server
- **frontend** - React frontend
- **worker** - Background job processor

### Infrastructure Services

- **auth** - Keycloak authentication
- **localstack** - AWS service mocking
- **mailhog** - Email testing
- **pgadmin** - Database management UI

### Observability

- **prometheus** - Metrics collection
- **grafana** - Visualization dashboards
- **node-exporter** - System metrics

## Features

The devcontainer includes these features:

- **Node.js 22** with npm, yarn, and global development tools
- **Docker-in-Docker** for container builds and testing
- **GitHub CLI** for repository management and automation
- **Kubernetes tools** (kubectl, Helm) for container orchestration
- **Infrastructure as Code** (Terraform, TFLint, Terragrunt)
- **AWS CLI** for cloud resource management
- **Python 3.11** for scripting and automation
- **Security hardening** with read-only filesystem and tmpfs mounts
- **Performance optimization** with resource limits and efficient caching

## Lifecycle Hooks

### initializeCommand

Runs **before** container creation on the **host machine**:

- Validates Docker is running
- Checks available resources
- Cleans up old containers

### onCreateCommand

Runs **once** when container is first created:

- Sets up .env files
- Installs npm dependencies

### updateContentCommand

Runs when container is rebuilt or code changes:

- Updates npm dependencies

### postCreateCommand

Runs after container is created or rebuilt:

- Waits for services to be healthy
- Sets up git hooks
- Displays welcome message

### postAttachCommand

Runs **every time** you attach to the container:

- Shows service status
- Displays helpful URLs and commands

## Resource Requirements

**Minimum:**

- 4 CPU cores
- 8GB RAM
- 32GB disk space
- Docker Desktop with 4GB+ memory allocation

**Recommended:**

- 8 CPU cores
- 16GB RAM
- 50GB+ disk space

## Security

### Container Security

- Runs as non-root user (`node`)
- Security options: `no-new-privileges`
- Capabilities dropped by default
- Resource limits enforced

### Secrets Management

- `.env` files are gitignored
- Default passwords must be changed
- SSH keys mounted read-only
- Environment variables isolated

### Network Security

- Services on isolated bridge network
- Ports forwarded selectively
- Database ports require local access

## Troubleshooting

### Container won't start

```bash
# Check Docker is running
docker info

# Check Docker Compose version
docker compose version

# View container logs
docker compose -f apps/dev/docker/docker-compose.dev.yaml logs dev
```

### Services not ready

```bash
# Check service health
docker compose -f apps/dev/docker/docker-compose.dev.yaml ps

# Restart services
docker compose -f apps/dev/docker/docker-compose.dev.yaml restart

# View specific service logs
docker compose -f apps/dev/docker/docker-compose.dev.yaml logs -f postgres
```

### Port conflicts

If you see "port already in use" errors:

```bash
# Find what's using the port (example: 5432)
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Stop conflicting service or change port in .env
```

### Permission issues

```bash
# Fix file ownership (run on host)
sudo chown -R $USER:$USER .

# Rebuild container
docker compose -f apps/dev/docker/docker-compose.dev.yaml build --no-cache dev
```

### Out of memory

Increase Docker Desktop memory allocation:

- Docker Desktop → Settings → Resources
- Set Memory to 8GB minimum
- Click "Apply & Restart"

### Slow performance

```bash
# Check resource usage
docker stats

# Prune unused resources
docker system prune -a --volumes

# Restart Docker Desktop
```

## Customization

### Adding Extensions

Edit `devcontainer.json`:

```json
"extensions": [
  "publisher.extension-name"
]
```

### Changing Ports

Edit `apps/dev/docker/docker-compose.dev.yaml` and `.devcontainer/devcontainer.json`:

```yaml
ports:
  - '3000:3000' # host:container
```

### Environment Variables

Add to `.env` or `.env.local`:

```bash
MY_VARIABLE=value
```

### Custom Scripts

Add scripts to `.devcontainer/scripts/` and reference in lifecycle hooks.

## Performance Optimization

### Resource Management

The container is optimized for development workloads:

- **CPU**: 2 cores (scalable based on host capabilities)
- **Memory**: 4GB with 8GB swap for burst capacity
- **Storage**: tmpfs mounts for high-performance I/O
- **Security**: Read-only root filesystem with controlled write access

### Volume Caching

Node modules and build cache are persisted in Docker volumes:

- `political-sphere-node_modules` - Cached dependencies
- `political-sphere-nx-cache` - Nx build cache for faster incremental builds

### BuildKit Optimization

BuildKit is enabled for faster, more efficient builds:

```bash
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
```

### Incremental Updates

Use `updateContentCommand` for dependency updates:

- Faster than full container rebuilds
- Preserves running container state
- Updates only what's changed

## Maintenance

### Update Dependencies

```bash
npm ci --prefer-offline
```

### Update Features

Edit feature versions in `devcontainer.json` and rebuild.

### Clean Up

```bash
# Remove all containers and volumes
docker compose -f apps/dev/docker/docker-compose.dev.yaml down -v

# Rebuild from scratch
Dev Containers: Rebuild Container Without Cache
```

## CI/CD Integration

The devcontainer can be used in CI/CD:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: devcontainers/ci@v0.3
        with:
          runCmd: npm test
```

## Migration from Local Setup

If you were developing locally without devcontainer:

1. **Backup your .env:**

   ```bash
   cp .env .env.backup
   ```

2. **Commit your changes:**

   ```bash
   git stash
   ```

3. **Open in container:**
   - VS Code → Reopen in Container

4. **Restore .env:**

   ```bash
   cp .env.backup .env
   ```

5. **Resume work:**
   ```bash
   git stash pop
   npm ci
   ```

## Security & Performance Notes

### Security Features

- **Read-only root filesystem** prevents unauthorized modifications
- **tmpfs mounts** provide secure temporary storage
- **Capability restrictions** limit container privileges
- **Non-root user** (node) for development operations
- **Secure password generation** with high entropy

### Performance Optimizations

- **Resource limits** prevent resource exhaustion
- **Volume caching** speeds up dependency installation
- **tmpfs I/O** accelerates temporary file operations
- **BuildKit** enables parallel and cached builds
- **Incremental updates** minimize rebuild times

### Monitoring & Troubleshooting

Check container performance with:

```bash
# Monitor resource usage
docker stats political-sphere-dev

# View container logs
docker logs political-sphere-dev

# Check service health
docker compose -f apps/dev/docker/docker-compose.dev.yaml ps
```

## References

- [VS Code DevContainers](https://code.visualstudio.com/docs/devcontainers/containers)
- [DevContainer Specification](https://containers.dev/)
- [Docker Compose](https://docs.docker.com/compose/)
- [DEVCONTAINER-AUDIT-REPORT.md](../DEVCONTAINER-AUDIT-REPORT.md) - Full audit findings

## Support

- See WELCOME.txt for quick help
- Check [docs/onboarding.md](../docs/onboarding.md)
- Open an issue on GitHub
- Contact the platform team
