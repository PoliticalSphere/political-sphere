# Political Sphere Development Container

This directory contains the Development Container (devcontainer) configuration for Political Sphere, providing a consistent, secure, and fully-featured development environment.

## Overview

The devcontainer configuration follows industry best practices:

- **OWASP Docker Security Guidelines** - All 13 security rules implemented
- **12-Factor App Methodology** - Configuration in environment, stateless processes
- **Dev Container Specification** - Official Microsoft/open standard
- **Multi-stage Dockerfile** - Optimized image layers and caching
- **Rootless Docker** - Enhanced security with non-root user

## Quick Start

### Prerequisites

- **Docker Desktop** or **Docker Engine** (v20.10+)
- **VS Code** (latest version)
- **Dev Containers Extension** (`ms-vscode-remote.remote-containers`)
- **Minimum Resources**: 4 CPU cores, 8GB RAM, 32GB storage

### Opening the Dev Container

1. **Open in VS Code**:

   ```bash
   code /path/to/political-sphere
   ```

2. **Reopen in Container**:
   - Press `F1` or `Cmd+Shift+P`
   - Select: "Dev Containers: Reopen in Container"
   - Wait for container build and initialization (first time: ~5-10 minutes)

3. **Verify Setup**:

   ```bash
   # Check Node.js and npm
   node --version  # Should be v20.x
   npm --version

   # Check installed tools
   docker --version
   kubectl version --client
   terraform --version
   gh --version

   # Verify services
   pg_isready -h postgres -U dev -d political_sphere_dev
   redis-cli -h redis ping
   ```

## Architecture

### Services

The development environment includes multiple containerized services:

#### **dev** (Main Development Container)

- **Base Image**: `mcr.microsoft.com/devcontainers/typescript-node:1-20-bookworm`
- **User**: `node` (non-root, UID 1000)
- **Resources**: 2-4 CPUs, 4-8GB RAM
- **Ports**: 3000 (web), 4000 (api), 5000 (game-server), 8080 (worker), 9229 (debugger)

#### **postgres** (Database)

- **Image**: `postgres:16-alpine`
- **Database**: `political_sphere_dev`
- **User**: `dev` / Password: `dev_password`
- **Port**: 5432
- **Extensions**: uuid-ossp, pgcrypto, pg_trgm
- **Security**: Read-only filesystem, capability limits, no privilege escalation

#### **redis** (Cache)

- **Image**: `redis:7-alpine`
- **Port**: 6379
- **Persistence**: AOF + RDB
- **Max Memory**: 512MB (LRU eviction)
- **Security**: Read-only filesystem, capability limits

### Dev Container Features

The following official Dev Container Features are installed:

- **docker-in-docker** - Rootless Docker for building/testing containers
- **github-cli** - GitHub CLI for repository operations
- **kubectl-helm** - Kubernetes and Helm for infrastructure work
- **aws-cli** - AWS command-line tools
- **terraform** - Infrastructure as Code with Terraform and tflint
- **node** - Node.js 20 with nvm
- **git** - Latest Git with LFS support
- **common-utils** - Zsh, Oh My Zsh, and utilities
- **python** - Python 3.11 for scripting
- **sops** - Secrets management tool

## Environment Variables

Configuration follows the 12-factor app methodology - all config is in environment variables:

### Development Container

```bash
NODE_ENV=development
LOG_LEVEL=debug
DOCKER_HOST=unix:///var/run/docker.sock
DATABASE_URL=postgresql://dev:dev_password@postgres:5432/political_sphere_dev
REDIS_URL=redis://redis:6379
JWT_SECRET=dev_jwt_secret_min_32_chars_required_for_development_only
JWT_REFRESH_SECRET=dev_refresh_secret_min_32_chars_required_for_development
```

### Override for Local Development

Create `.env.local` in the workspace root (git-ignored):

```bash
# Custom environment overrides
NODE_ENV=development
LOG_LEVEL=trace
API_PORT=4000
```

## Lifecycle Commands

The devcontainer executes commands at different stages:

### Initialization (`initializeCommand`)

Runs on the **host** before container starts:

- Displays welcome message

### On Create (`onCreateCommand`)

Runs **once** when container is first created:

- Configures git safe directory
- Installs npm dependencies (with offline cache)

### Update Content (`updateContentCommand`)

Runs when container **rebuilds**:

- Reinstalls npm dependencies

### Post Create (`postCreateCommand`)

Runs after creation **completes**:

- Runs AI preflight checks
- Validates environment

### Post Start (`postStartCommand`)

Runs **every time** container starts:

- Displays ready message
- Checks dependency health

### Post Attach (`postAttachCommand`)

Runs when you **attach** to a running container:

- Displays attach message

## VS Code Extensions

The following extensions are automatically installed:

### Code Quality

- ESLint, Prettier, Biome
- Code Spell Checker
- Error Lens

### TypeScript/JavaScript

- TypeScript Next
- Pretty TypeScript Errors

### Testing

- Vitest Explorer
- Playwright

### Git

- GitLens
- Git Graph

### AI Assistants

- GitHub Copilot
- GitHub Copilot Chat

### Frontend

- Tailwind CSS IntelliSense
- React/ES7 Snippets
- Styled Components

### Configuration

- YAML, JSON, TOML support

### Docker/DevOps

- Docker Extension
- Remote Containers
- Terraform
- Kubernetes Tools

### API Development

- OpenAPI (42Crunch)
- REST Client

### Accessibility

- axe Accessibility Linter (WCAG compliance)

### Security

- Snyk Vulnerability Scanner

### Database

- SQLTools with PostgreSQL driver

## Security Features

### OWASP Docker Security Compliance

This devcontainer implements all 13 OWASP Docker Security rules:

1. ✅ **Keep Host and Docker Updated** - Using latest stable images
2. ✅ **Do Not Expose Docker Daemon Socket** - Using Docker-in-Docker feature
3. ✅ **Set a Non-Root User** - Running as `node` user (UID 1000)
4. ✅ **Limit Capabilities** - Dropped ALL, added only required capabilities
5. ✅ **Prevent Privilege Escalation** - `no-new-privileges:true`
6. ✅ **Network Segmentation** - Isolated bridge network
7. ✅ **Security Modules** - AppArmor/SELinux compatible
8. ✅ **Resource Limits** - CPU and memory limits enforced
9. ✅ **Logging** - Structured JSON logging
10. ✅ **Read-Only Filesystem** - Where possible (postgres, redis)
11. ✅ **Rootless Mode** - Docker-in-Docker runs rootless
12. ✅ **Docker Secrets** - Prepared for production use
13. ✅ **Supply Chain Security** - Official base images, SBOM available

### Capability Model

The development container uses minimal Linux capabilities:

```yaml
cap_drop:
  - ALL # Drop all capabilities by default
cap_add:
  - CHOWN # Change file ownership
  - DAC_OVERRIDE # Bypass file permission checks
  - FOWNER # Bypass permission checks for operations
  - SETGID # Set group ID
  - SETUID # Set user ID
  - NET_BIND_SERVICE # Bind to privileged ports
```

### Resource Limits

To prevent resource exhaustion:

```yaml
deploy:
  resources:
    limits:
      cpus: '4'
      memory: 8G
    reservations:
      cpus: '2'
      memory: 4G
```

## Volumes and Persistence

### Named Volumes

- **postgres_data** - PostgreSQL database files
- **redis_data** - Redis persistence (AOF + RDB)
- **node_modules** - Faster dependency access on macOS/Windows
- **npm_cache** - NPM package cache for faster installs

### Bind Mounts

- **Workspace** - Your repository mounted at `/workspaces/political-sphere`
- **SSH Keys** - Read-only mount of `~/.ssh` for git operations
- **Git Config** - Read-only mount of `~/.gitconfig`
- **Docker Socket** - Managed by Docker-in-Docker feature

## Troubleshooting

### Container Won't Start

**Check Docker resources:**

```bash
docker system df
docker system prune
```

**Rebuild container:**

```bash
# In VS Code
F1 → "Dev Containers: Rebuild Container"
```

### Port Conflicts

**Check for conflicts:**

```bash
lsof -i :3000
lsof -i :4000
lsof -i :5432
lsof -i :6379
```

**Kill conflicting processes:**

```bash
kill -9 <PID>
```

### Database Connection Issues

**Verify PostgreSQL is running:**

```bash
docker-compose ps
docker-compose logs postgres
```

**Connect manually:**

```bash
psql -h postgres -U dev -d political_sphere_dev
# Password: dev_password
```

### Redis Connection Issues

**Test Redis:**

```bash
redis-cli -h redis ping
# Expected: PONG
```

**Check Redis logs:**

```bash
docker-compose logs redis
```

### Performance Issues

**Check resource usage:**

```bash
docker stats
```

**Increase Docker Desktop resources:**

- Docker Desktop → Settings → Resources
- Increase CPUs to 4+
- Increase Memory to 8GB+

### Cleanup

**Remove all containers and volumes:**

```bash
docker-compose down -v
```

**Prune Docker system:**

```bash
docker system prune -a --volumes
```

## Configuration Files

### Key Files

- **devcontainer.json** - Main devcontainer configuration
- **Dockerfile** - Multi-stage development image
- **docker-compose.yml** - Service orchestration
- **.dockerignore** - Files excluded from image build
- **redis.conf** - Redis configuration
- **init-scripts/** - PostgreSQL initialization scripts

### Customization

#### Adding Extensions

Edit `devcontainer.json`:

```json
{
  "customizations": {
    "vscode": {
      "extensions": ["publisher.extension-name"]
    }
  }
}
```

#### Adding Features

Edit `devcontainer.json`:

```json
{
  "features": {
    "ghcr.io/devcontainers/features/feature-name:version": {
      "option": "value"
    }
  }
}
```

#### Environment Variables

Edit `docker-compose.yml`:

```yaml
services:
  dev:
    environment:
      - CUSTOM_VAR=value
```

## Best Practices

### Daily Workflow

1. **Start your day:**

   ```bash
   # Container starts automatically when opening VS Code
   npm run dev:api  # Start API server
   npm run dev:web  # Start web app
   ```

2. **Run tests:**

   ```bash
   npm run test:changed  # Test modified files
   npm run test:watch    # Watch mode
   ```

3. **Check code quality:**

   ```bash
   npm run lint
   npm run type-check
   ```

4. **Before committing:**
   ```bash
   npm run preflight  # Lint + test + build
   ```

### Security

- **Never commit secrets** - Use environment variables
- **Keep base images updated** - Rebuild monthly
- **Scan dependencies** - Run `npm audit` regularly
- **Review extensions** - Only install trusted extensions

### Performance

- **Use named volumes** for node_modules on macOS/Windows
- **Enable BuildKit** - `export DOCKER_BUILDKIT=1`
- **Cache layers** - Optimize Dockerfile order
- **Prune regularly** - `docker system prune`

## Resources

### Official Documentation

- [Dev Containers Specification](https://containers.dev/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Dev Container Features](https://containers.dev/features)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [OWASP Docker Security](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

### Political Sphere Documentation

- [Project README](../README.md)
- [Contributing Guide](../CONTRIBUTING.md)
- [Development Guide](../docs/05-engineering-and-devops/)
- [Security Policy](../SECURITY.md)

## Support

For issues with the devcontainer:

1. Check this README and troubleshooting section
2. Review [GitHub Issues](https://github.com/political-sphere/issues)
3. Ask in development team chat
4. Open a new issue with:
   - Docker version (`docker --version`)
   - VS Code version
   - OS and architecture
   - Error logs (`docker-compose logs`)

---

**Last Updated:** 2025-01-08
**Maintained By:** Political Sphere Development Team
**License:** See LICENSE file in repository root
