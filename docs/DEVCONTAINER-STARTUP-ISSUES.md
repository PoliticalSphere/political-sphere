# Dev Container Startup Issues - Troubleshooting Guide

## Error: "Command failed" during container rebuild

### Symptom
VS Code shows an error like:
```
Command failed: .../devContainersSpecCLI.js run-user-commands ...
```

### Common Causes & Solutions

#### 1. SSH Mount Issues
**Problem**: The devcontainer.json was trying to mount `~/.ssh` but the directory doesn't exist or has permission issues.

**Solution**: ✅ Removed the SSH mount from devcontainer.json. If you need SSH keys in the container:
- Use VS Code's built-in SSH agent forwarding (automatic)
- Or manually copy keys after container starts
- Or use the GitHub CLI for authentication

#### 2. Failing PostCreate Commands
**Problem**: The `postCreateCommand` had a hard exit (`exit 1`) when `npm run build:shared` failed, preventing container from starting.

**Solution**: ✅ Changed to use `set +e` (continue on errors) and made all commands non-blocking with proper error messages.

#### 3. Array vs String Command Format
**Problem**: Using array format for `postCreateCommand` with complex logic can cause parsing issues.

**Solution**: ✅ Converted to single bash command string with proper error handling.

### Quick Fix Steps

1. **Pull the latest changes** (if not done):
   ```bash
   git pull origin main
   ```

2. **Clean Docker containers**:
   ```bash
   # From your HOST machine terminal
   docker ps -a | grep political-sphere
   docker rm -f <container-id>  # Remove old containers
   docker system prune -f        # Clean up
   ```

3. **Rebuild the container**:
   - In VS Code: `Cmd/Ctrl + Shift + P`
   - Select: "Dev Containers: Rebuild Container Without Cache"
   - Wait 5-10 minutes for rebuild

4. **If still failing**, check logs:
   - VS Code: View → Output → Select "Dev Containers" from dropdown
   - Look for specific error messages

### Alternative: Start Fresh

If rebuilding continues to fail:

1. **Close VS Code completely**

2. **Remove all Political Sphere containers**:
   ```bash
   docker ps -a | grep political
   docker rm -f $(docker ps -a | grep political | awk '{print $1}')
   ```

3. **Remove volumes** (optional, will lose data):
   ```bash
   docker volume ls | grep political
   docker volume rm <volume-name>
   ```

4. **Restart Docker Desktop**

5. **Reopen in VS Code**:
   - Open the project folder
   - Click "Reopen in Container" when prompted

### Specific Fixes Applied

#### Change 1: Removed SSH Mount
```jsonc
// Before
"mounts": [
  "source=${localEnv:HOME}/.ssh,target=/home/node/.ssh,type=bind,readonly,consistency=cached"
]

// After
// (removed - use VS Code's built-in SSH forwarding instead)
```

#### Change 2: Made PostCreate Commands Non-Blocking
```jsonc
// Before
"postCreateCommand": [
  // ... various commands
  "npm run build:shared || (echo 'build:shared failed' && exit 1)",  // ❌ Hard exit
]

// After
"postCreateCommand": "bash -c 'set +e; ... npm run build:shared || echo \"⚠️ build:shared failed\"; ...'",
// ✅ Continues even if commands fail
```

### Common Errors in Logs

#### "Cannot find module 'lefthook-linux-x64'"
**Solution**: This is expected during first run. The container will still start. Run `pnpm install` after container starts.

#### "build:shared failed"
**Solution**: This is OK for initial setup. The shared library will be built when you run `npm run dev:all`.

#### "Permission denied" for Docker socket
**Solution**: Expected before rebuild. After rebuild with new privileged settings, this should work.

### Verification After Successful Start

Run these commands to verify everything is working:

```bash
# Check services
bash scripts/docker-helper.sh status

# Check development environment
bash .devcontainer/scripts/status-check.sh

# Install any missing dependencies
pnpm install

# Build shared library
npm run build:shared
```

### Still Having Issues?

1. **Check Docker Desktop**:
   - Is it running?
   - Does it have enough resources (6GB RAM, 2 CPUs)?
   - Try restarting it

2. **Check VS Code**:
   - Is the Dev Containers extension up to date?
   - Try: "Dev Containers: Rebuild and Reopen in Container"

3. **Check your system**:
   - Disk space: Need at least 16GB free
   - No VPN conflicts with Docker networks

4. **Last resort**: Report the issue with:
   - Full error message from VS Code Output (Dev Containers)
   - Docker Desktop version
   - VS Code version
   - Operating system

### Related Documentation

- Main container fixes: `docs/CONTAINER-FIXES.md`
- DevContainer setup: `.devcontainer/README.md`
- Docker helper: `scripts/docker-helper.sh --help`

### Prevention

To avoid these issues in the future:
- ✅ Keep Docker Desktop updated
- ✅ Ensure adequate system resources
- ✅ Run `git pull` before rebuilding containers
- ✅ Clean up old containers regularly
- ✅ Check the changelog for breaking changes
