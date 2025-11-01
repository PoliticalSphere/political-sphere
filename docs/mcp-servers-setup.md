# MCP Servers Setup Guide

<div align="center">

| Classification | Version | Last Updated |       Owner        | Review Cycle |    Status    |
| :------------: | :-----: | :----------: | :----------------: | :----------: | :----------: |
|  🔒 Internal   | `0.2.0` |  2025-11-01  | Documentation Team |  Quarterly   | **Approved** |

</div>

---

This document provides setup instructions for the Model Context Protocol (MCP) servers integrated into the Political Sphere project.

## Quick Reference

| Server | Type | Purpose | Cost | Command |
|--------|------|---------|------|---------|
| **Filesystem** | Custom | File operations | Free | `npm run mcp:filesystem` |
| **GitHub** | Custom | Repo management | Free* | `npm run mcp:github` |
| **SQLite** | Custom | Database queries | Free | `npm run mcp:sqlite` |
| **Puppeteer** | Custom | Web automation | Free | `npm run mcp:puppeteer` |
| **Git** | Custom | Version control | Free | `npm run mcp:git` |
| **AI Assistant** | Custom | Political Sphere AI | Free | `npm run mcp:ai-assistant` |
| **Playwright** | Official | E2E testing | Free | `npm run mcp:playwright` |
| **Chrome DevTools** | Official | Browser debugging | Free | `npm run mcp:chrome-devtools` |
| **Filesystem (Official)** | Official | Standard file ops | Free | `npm run mcp:filesystem-official` |
| **Time** | Community | DateTime utilities | Free | `npm run mcp:time` |

*GitHub server requires free GitHub personal access token

**Total: 10 MCP servers, 100% free, £0 cost**

## Overview

The project includes both custom and official MCP servers to enhance AI capabilities, all **completely free** with no paid APIs required:

### Project-Specific Servers (Free, Custom-Built)
- **Filesystem MCP Server**: Secure file operations and code analysis
- **GitHub MCP Server**: Repository management and GitHub API integration (requires free GitHub token)
- **SQLite MCP Server**: Database queries and data analysis
- **Puppeteer MCP Server**: Web automation and scraping for testing
- **Git MCP Server**: Git operations and version control
- **AI Assistant MCP Server**: Custom AI-powered development assistance with Political Sphere standards

### Community & Official Servers (Free, Zero Cost)
- **Playwright MCP Server**: Official E2E testing integration from Microsoft
- **Chrome DevTools MCP Server**: Browser debugging and performance analysis from Google
- **Official Filesystem Server**: Standard MCP filesystem implementation
- **Time MCP Server**: Date/time utilities and awareness for AI assistants

**All servers require zero budget** - no paid API keys, subscriptions, or services needed!

## Prerequisites

- Node.js 18+
- npm or yarn
- GitHub Personal Access Token (for GitHub MCP server)
- SQLite database files (for SQLite MCP server)

## Installation

All MCP servers are installed as part of the project dependencies. Run the following commands:

```bash
# Install root dependencies
npm install

# Install MCP server dependencies
cd apps/dev/mcp-servers/filesystem && npm install
cd apps/dev/mcp-servers/github && npm install
cd apps/dev/mcp-servers/sqlite && npm install
cd apps/dev/mcp-servers/puppeteer && npm install
cd apps/dev/mcp-servers/git && npm install
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# GitHub MCP Server
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_REPOSITORY=your-org/your-repo

# Database paths (optional, defaults to project directories)
SQLITE_DB_PATH=./data/database.db
```

### GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with the following scopes:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `read:user` (Read user profile data)
3. Add the token to your `.env` file

## Running MCP Servers

Use the provided npm scripts to start individual servers:

```bash
# Project-specific servers (custom-built, free)
npm run mcp:filesystem         # File operations
npm run mcp:github            # GitHub integration (free token required)
npm run mcp:sqlite            # Database queries
npm run mcp:puppeteer         # Web automation
npm run mcp:git               # Git operations
npm run mcp:ai-assistant      # AI-powered assistance

# Community & official servers (free, no API keys)
npm run mcp:playwright         # E2E testing with Playwright
npm run mcp:chrome-devtools    # Browser debugging
npm run mcp:filesystem-official # Official MCP filesystem
npm run mcp:time              # Date/time utilities

# Or start multiple servers concurrently
npx concurrently "npm run mcp:filesystem" "npm run mcp:github" "npm run mcp:playwright" "npm run mcp:time"
```

## VSCode/Copilot Integration

### MCP Client Configuration

To integrate with GitHub Copilot Chat, create or update your MCP client configuration:

1. Create `.vscode/mcp.json` in your workspace:

```json
{
  "mcpServers": {
    "political-sphere-filesystem": {
      "command": "npm",
      "args": ["run", "mcp:filesystem"],
      "cwd": "${workspaceFolder}"
    },
    "political-sphere-github": {
      "command": "npm",
      "args": ["run", "mcp:github"],
      "cwd": "${workspaceFolder}",
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}",
        "GITHUB_REPOSITORY": "${env:GITHUB_REPOSITORY}"
      }
    },
    "political-sphere-sqlite": {
      "command": "npm",
      "args": ["run", "mcp:sqlite"],
      "cwd": "${workspaceFolder}"
    },
    "political-sphere-puppeteer": {
      "command": "npm",
      "args": ["run", "mcp:puppeteer"],
      "cwd": "${workspaceFolder}"
    },
    "political-sphere-git": {
      "command": "npm",
      "args": ["run", "mcp:git"],
      "cwd": "${workspaceFolder}"
    },
    "political-sphere-ai-assistant": {
      "command": "npm",
      "args": ["run", "mcp:ai-assistant"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

2. Reload VSCode to apply the configuration.

### Using MCP Servers with Copilot

Once configured, you can use the MCP servers in Copilot Chat:

```
@political-sphere-filesystem read this file: package.json
@political-sphere-github get repo info for microsoft/vscode
@political-sphere-sqlite connect to database.db and list tables
@political-sphere-puppeteer navigate to https://example.com
@political-sphere-git get status of current repo
@political-sphere-ai-assistant generate code for user authentication
```

## Server Capabilities

### Filesystem Server

- Read files securely within allowed paths
- List directory contents
- Search for files with glob patterns

### GitHub Server

- Get repository information
- List and search issues
- Get pull request details
- Search repositories

### SQLite Server

- Connect to SQLite databases
- Execute SELECT queries (read-only)
- List tables and schemas

### Puppeteer Server

- Launch headless browsers
- Navigate to web pages
- Extract content and take screenshots
- Interact with web elements

### Git Server

- Initialize repositories
- Get status and logs
- Stage and commit changes
- Create and checkout branches
- Push and pull from remotes

### AI Assistant Server

- Generate code following Political Sphere standards
- Review code for quality and security
- Optimize performance
- Generate tests
- Simulate political scenarios specific to the game

### Playwright MCP Server (Official, Free)

- **E2E Testing**: Complete end-to-end test automation
- **Browser Control**: Automate Chrome, Firefox, Safari, Edge
- **Visual Testing**: Screenshot and visual regression testing
- **Accessibility Testing**: Built-in accessibility checks (WCAG)
- **Network Interception**: Mock APIs and test edge cases
- **Mobile Testing**: Test responsive designs on mobile viewports
- **Parallel Execution**: Run tests concurrently for speed
- **Developed by**: Microsoft (official Playwright team)

### Chrome DevTools MCP Server (Official, Free)

- **Performance Profiling**: CPU, memory, and network analysis
- **Debugging**: Breakpoints, step debugging, console access
- **Network Monitoring**: Request/response inspection
- **Coverage Analysis**: Find unused code
- **Accessibility Audits**: Lighthouse accessibility scoring
- **Security Analysis**: Mixed content and certificate checks
- **Developed by**: Google Chrome team

### Official Filesystem Server (Free)

- **Standard MCP Implementation**: Reference implementation from MCP creators
- **File Operations**: Read, write, list, search files
- **Directory Management**: Create, delete, traverse directories
- **Pattern Matching**: Glob and regex file searching
- **Safe Operations**: Permission checks and path validation
- **Cross-Platform**: Works on Windows, macOS, Linux

### Time MCP Server (Free)

- **DateTime Awareness**: Give AI assistants time context
- **Timezone Handling**: Convert between timezones
- **Date Formatting**: Human-readable date formats
- **Relative Time**: "2 hours ago", "in 3 days" calculations
- **Scheduling Context**: Understand business hours, deadlines
- **Calendar Math**: Add/subtract days, weeks, months

## Use Cases

### Development Workflow
1. **Code Generation**: Use AI Assistant to generate code following project standards
2. **Repository Management**: GitHub server for issue tracking and PR reviews
3. **Database Queries**: SQLite server for data analysis and testing
4. **Version Control**: Git server for automated git operations
5. **E2E Testing**: Playwright for comprehensive browser testing
6. **Debugging**: Chrome DevTools for performance and debugging
7. **Time Context**: Time server for scheduling and deadline awareness

### Testing & Quality Assurance
- **Playwright**: Run automated E2E tests across all browsers
- **Chrome DevTools**: Profile performance, find memory leaks
- **Puppeteer**: Custom web scraping and automation
- **AI Assistant**: Generate test cases and validate coverage

### AI-Powered Development
- **Context-Aware Suggestions**: AI understands your codebase structure
- **Time-Aware Planning**: AI can schedule tasks and understand deadlines
- **Automated Testing**: Generate and run tests with Playwright
- **Performance Analysis**: Use Chrome DevTools to identify bottlenecks
- **Security Scanning**: Automated vulnerability detection

## Security Considerations

- **Path Restrictions**: Filesystem and Git servers only allow access to specific directories
- **Read-Only Operations**: SQLite server only allows SELECT queries
- **URL Validation**: Puppeteer server only allows HTTP/HTTPS URLs
- **Token Security**: GitHub tokens should be stored securely and rotated regularly
- **Input Validation**: All servers validate inputs to prevent injection attacks

## Troubleshooting

### Common Issues

1. **MCP Server not connecting**
   - Check that the server is running
   - Verify environment variables are set
   - Check server logs for errors

2. **GitHub API rate limits**
   - Monitor API usage
   - Consider using GitHub App instead of personal token for higher limits

3. **SQLite compilation errors**
   - Ensure Python and build tools are installed
   - Try using a pre-compiled binary version

4. **Puppeteer browser launch failures**
   - Install browser dependencies: `npx puppeteer browsers install chrome`
   - Check system permissions for browser launch

### Logs and Debugging

Each server outputs logs to stderr. Use the following to debug:

```bash
# Run with verbose logging
DEBUG=* npm run mcp:filesystem

# Check server health
curl http://localhost:port/health  # If implemented
```

## Development

### Adding New Tools

To add new tools to existing servers:

1. Update the `handleListTools` method in the server
2. Implement the tool logic in the appropriate handler
3. Update this documentation

### Creating New Servers

1. Create a new directory under `apps/dev/mcp-servers/`
2. Follow the existing server structure
3. Add Nx configuration
4. Update package.json scripts
5. Update this documentation

## Contributing

When contributing to MCP server development:

- Follow the existing code patterns
- Add comprehensive error handling
- Include input validation
- Update tests and documentation
- Ensure security best practices

## License

This project follows the same license as the Political Sphere monorepo.
