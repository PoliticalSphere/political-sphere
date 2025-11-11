# Political Sphere API - OpenAPI Specifications

This directory contains comprehensive OpenAPI 3.1.0 specifications for the Political Sphere API, exceeding industry standards for API documentation, security, and developer experience.

## 📋 Overview

The Political Sphere API provides a complete backend for a UK-focused multiplayer political simulation platform. This OpenAPI specification covers:

- **Authentication & Authorization** - JWT-based auth with OAuth2 support
- **User Management** - Profile management and activity tracking
- **Political Parties** - Party creation, membership, and governance
- **Voting & Governance** - Cryptographically signed votes and proposals
- **News & Content** - AI-assisted content moderation
- **Real-time Features** - WebSocket integration for live updates
- **Administrative Functions** - System management and audit trails

## 📝 API Changelog

**Important**: All API changes are documented in [`CHANGELOG.md`](./CHANGELOG.md). This includes breaking changes, new features, and deprecation notices that affect API consumers.

### Quick Changelog Access

```bash
# View recent API changes
cat CHANGELOG.md

# Check current API version
grep "version:" api.yaml
```

## 🏗️ Architecture

### Directory Structure

```
openapi/
├── api.yaml                 # Main OpenAPI specification
├── CHANGELOG.md             # API changelog and version history
├── package.json             # Tooling and scripts
├── openapi-generator-config.json  # Code generation config
├── .redocly.yaml           # Linting and documentation config
├── schemas/                # Reusable schema definitions
│   ├── auth/              # Authentication schemas
│   ├── users/             # User management schemas
│   ├── parties/           # Political party schemas
│   ├── votes/             # Voting and governance schemas
│   ├── news/              # News and content schemas
│   └── common/            # Shared/common schemas
├── generated/             # Auto-generated code (gitignored)
│   ├── client/           # TypeScript client SDK
│   ├── server/           # Server-side types
│   ├── models/           # TypeScript interfaces
│   └── docs/             # HTML documentation
└── README.md             # This file
```

### Key Features

#### 🔐 Security & Authentication

- **JWT Bearer Authentication** - Industry-standard token-based auth
- **OAuth2 Authorization Code Flow** - Third-party integrations
- **API Key Authentication** - Server-to-server admin operations
- **Rate Limiting** - HTTP header-based rate limit enforcement
- **Cryptographic Voting** - Signed votes with blockchain verification

#### 📊 Advanced API Design

- **OpenAPI 3.1.0** - Latest specification with webhooks and advanced schemas
- **Comprehensive Error Handling** - Structured error responses with validation details
- **Pagination** - Standardized pagination with metadata
- **Filtering & Sorting** - Query parameter-based data filtering
- **Webhooks** - Real-time event notifications via callbacks

#### 🎯 Developer Experience

- **Complete Examples** - Request/response examples for all endpoints
- **Interactive Documentation** - Redocly-powered API docs
- **TypeScript SDK Generation** - Auto-generated client libraries
- **Schema Validation** - Comprehensive input validation rules
- **Comprehensive Testing** - Example validation and schema testing

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 18+
node --version

# Install dependencies
npm install
```

### Validation

```bash
# Validate OpenAPI specification
npm run validate

# Validate specification syntax only
npm run validate:spec

# Lint for best practices
npm run validate:lint
```

### Code Generation

```bash
# Generate TypeScript client SDK
npm run generate:client

# Generate server-side types
npm run generate:server

# Generate both client and server code
npm run generate

# Generate HTML documentation
npm run generate:docs
```

### Documentation

```bash
# Preview documentation locally
npm run preview:docs

# Bundle specification for distribution
npm run bundle

# Show API statistics
npm run stats
```

## 📚 API Documentation

### Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to obtain access and refresh tokens
2. **Include Bearer token** in `Authorization` header for authenticated requests
3. **Refresh tokens** automatically when access tokens expire

### Rate Limiting

All endpoints are rate-limited. Check these headers in responses:

- `X-RateLimit-Limit` - Maximum requests per window
- `X-RateLimit-Remaining` - Remaining requests in current window
- `X-RateLimit-Reset` - Unix timestamp when limit resets
- `Retry-After` - Seconds to wait when rate limited

### Error Handling

All errors follow a consistent structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The provided data is invalid",
    "details": { "field": "email", "reason": "must be a valid email address" },
    "traceId": "abc-123-def-456",
    "timestamp": "2025-11-08T10:30:00Z"
  }
}
```

### Pagination

List endpoints support pagination:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

## 🔧 Development Workflow

### Making Changes

1. **Edit schemas** in `schemas/` directory (organized by domain)
2. **Update main spec** in `api.yaml` to reference new schemas
3. **Validate changes** with `npm run validate`
4. **Generate code/docs** with `npm run generate`
5. **Test examples** with `npm run test:examples`

### Schema Organization

Schemas are organized by domain for maintainability:

- **`auth/`** - User registration, login, tokens
- **`users/`** - User profiles, activity, settings
- **`parties/`** - Party creation, membership, governance
- **`votes/`** - Vote creation, casting, results
- **`news/`** - Articles, moderation, publishing
- **`common/`** - Shared types (errors, pagination, health)

### Best Practices

#### Schema Design

- Use descriptive field names and descriptions
- Include validation rules (minLength, maxLength, patterns)
- Provide realistic examples for all fields
- Reference common schemas to avoid duplication

#### API Design

- Follow RESTful conventions
- Use appropriate HTTP status codes
- Include comprehensive error responses
- Document all parameters and request bodies

#### Security

- Require authentication for sensitive operations
- Validate all inputs with schemas
- Use appropriate security schemes
- Document authorization requirements

## 🧪 Testing

### Example Validation

```bash
# Validate all examples in the specification
npm run test:examples
```

### Integration Testing

The generated client SDK can be used for integration testing:

```typescript
import { DefaultApi } from './generated/client';

// Test authentication flow
const api = new DefaultApi();
const response = await api.authLogin({
  email: 'test@example.com',
  password: 'password123',
});
expect(response.accessToken).toBeDefined();
```

## 📊 Monitoring & Analytics

### API Statistics

```bash
# Show comprehensive API statistics
npm run stats
```

This provides metrics on:

- Number of endpoints, schemas, and parameters
- Security coverage
- Documentation completeness
- Schema complexity

### Health Checks

The API includes comprehensive health check endpoints:

- `GET /health` - Basic health status
- `GET /health/detailed` - Detailed health with metrics

## 🔒 Security Considerations

### Authentication

- JWT tokens expire in 15 minutes
- Refresh tokens valid for 7 days
- All sensitive operations require authentication

### Authorization

- Role-based access control (user, moderator, admin)
- Party-specific permissions for party operations
- Vote-specific permissions for voting operations

### Data Protection

- All PII encrypted at rest
- TLS 1.3+ required for transport
- GDPR-compliant data handling
- Comprehensive audit logging

## 🤝 Contributing

### Guidelines

1. **Validate changes** before committing
2. **Update examples** when modifying schemas
3. **Test generation** to ensure code compiles
4. **Document breaking changes** in API versioning

### Code Review Checklist

- [ ] OpenAPI specification validates without errors
- [ ] All schemas include descriptions and examples
- [ ] Security schemes properly configured
- [ ] Error responses comprehensive and consistent
- [ ] Generated code compiles successfully
- [ ] Documentation renders correctly

## 📈 Roadmap

### Planned Enhancements

- **GraphQL Support** - Alternative query interface
- **Webhook Signing** - Cryptographic webhook verification
- **API Versioning** - URL-based API versioning
- **Rate Limit Customization** - Per-user rate limit configuration
- **Advanced Filtering** - GraphQL-style query language

### Performance Optimizations

- **Response Compression** - Gzip/Brotli compression
- **Caching Headers** - HTTP caching for static responses
- **Pagination Optimization** - Cursor-based pagination for large datasets
- **Batch Operations** - Bulk API operations

## 📞 Support

### Documentation

- **API Reference**: Generated HTML documentation
- **Interactive Docs**: Redocly-powered API explorer
- **Code Examples**: Generated SDK with examples

### Issues & Questions

- **GitHub Issues**: Bug reports and feature requests
- **Documentation Issues**: Report in API docs repository
- **Security Issues**: Contact security team directly

---

## 🎯 Industry Standards Compliance

This OpenAPI specification exceeds industry standards by including:

- ✅ **OpenAPI 3.1.0** (latest specification)
- ✅ **Comprehensive Security** (JWT, OAuth2, API Keys)
- ✅ **Advanced Features** (Webhooks, Callbacks, Examples)
- ✅ **Developer Experience** (Generated SDKs, Interactive Docs)
- ✅ **Validation & Testing** (Automated validation, Example testing)
- ✅ **Documentation** (Complete descriptions, Examples, Guides)
- ✅ **Compliance** (GDPR, WCAG, Security best practices)

The specification serves as both documentation and the single source of truth for API development, testing, and client SDK generation.
