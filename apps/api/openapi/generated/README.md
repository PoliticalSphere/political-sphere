# Generated Code

This directory contains code auto-generated from OpenAPI specifications.

⚠️ **DO NOT EDIT FILES IN THIS DIRECTORY MANUALLY**

All files in this directory are automatically generated from the OpenAPI specification files and will be overwritten on regeneration.

## Generation

Code is generated using OpenAPI Generator:

```bash
# Generate TypeScript client
npm run openapi:generate:client

# Generate server stubs
npm run openapi:generate:server

# Generate both
npm run openapi:generate
```

## Contents

When generated, this directory will contain:

- **`client/`** - TypeScript client SDK for API consumers
- **`server/`** - Server-side request/response types
- **`models/`** - TypeScript interfaces for all schemas
- **`validators/`** - Request validation functions

## Configuration

Generation is configured in:

- `/tools/openapi-generator-config.json` - Generator configuration
- Root `package.json` - npm scripts for generation

## Gitignore

This directory is gitignored. Generated files should not be committed to version control. They will be regenerated as part of the build process.
