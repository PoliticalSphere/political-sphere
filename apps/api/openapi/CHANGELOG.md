# API Changelog

This file documents changes to the Political Sphere API specification and contract. API changes follow semantic versioning and are documented here to help API consumers understand breaking changes, new features, and deprecations.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) and API versioning follows [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2025-11-08

### Added

- **Complete API Specification**: Comprehensive OpenAPI 3.1.0 specification with 50+ endpoints
- **Authentication System**:
  - JWT Bearer authentication with refresh tokens
  - OAuth2 authorization code flow for third-party integrations
  - API key authentication for server-to-server operations
- **User Management**:
  - User registration with email verification
  - Profile management and activity tracking
  - Password reset and email change flows
- **Political Parties**:
  - Party creation and management
  - Membership and leadership systems
  - Party activity and governance
- **Voting & Governance**:
  - Cryptographically signed voting system
  - Proposal creation and management
  - Real-time vote results and verification
- **News & Content**:
  - Article publishing and management
  - AI-assisted content moderation
  - Editorial workflow and approval processes
- **Game Simulation**:
  - Simulation state management
  - Real-time control and monitoring
  - Event-driven game mechanics
- **Real-time Features**:
  - WebSocket authentication and connection management
  - Live event streaming and notifications
- **Administrative Functions**:
  - User management and moderation tools
  - System audit logging and compliance reporting
  - Administrative controls and oversight

### Security

- **Rate Limiting**: HTTP header-based rate limit enforcement
- **Input Validation**: Comprehensive schema validation for all endpoints
- **Audit Trails**: Structured logging for security and compliance events
- **Cryptographic Operations**: Signed votes with blockchain verification
- **Content Moderation**: AI-assisted moderation with human oversight

### Technical Features

- **OpenAPI 3.1.0**: Latest specification with webhooks and advanced schemas
- **Comprehensive Error Handling**: Structured error responses with validation details
- **Pagination**: Standardized pagination with metadata across all list endpoints
- **Filtering & Sorting**: Query parameter-based data filtering and sorting
- **Webhook Callbacks**: Real-time event notifications for vote results, party events, and moderation
- **Interactive Documentation**: Redocly-powered API explorer and documentation

### Developer Experience

- **TypeScript SDK Generation**: Auto-generated client libraries
- **Example Validation**: Comprehensive request/response examples
- **Schema Organization**: Domain-specific schema files for maintainability
- **Comprehensive Tooling**: Validation, generation, and documentation scripts

---

## Guidelines for API Changes

### Versioning

- **MAJOR** (X.0.0): Breaking changes to existing endpoints
- **MINOR** (1.X.0): New features and endpoints (backward compatible)
- **PATCH** (1.0.X): Bug fixes and documentation updates

### Breaking Changes

Breaking changes require:

1. Advance notice in changelog (minimum 30 days)
2. Migration guide for API consumers
3. Deprecation warnings for sunsetted endpoints
4. Major version bump

### Documentation Requirements

All API changes must include:

- Updated OpenAPI specification
- Request/response examples
- Error scenarios and handling
- Migration guides for breaking changes
- Security implications assessment

### Change Categories

- **Added**: New endpoints, features, or capabilities
- **Changed**: Modifications to existing behavior
- **Deprecated**: Features scheduled for removal
- **Removed**: Deleted endpoints or features
- **Fixed**: Bug fixes and corrections
- **Security**: Security-related changes and fixes

---

## Future Versions

### Planned for v1.1.0

- GraphQL API alongside REST endpoints
- Enhanced webhook signing and verification
- Advanced filtering and search capabilities
- API rate limit customization per client

### Planned for v2.0.0

- Breaking changes for improved consistency
- Enhanced cryptographic voting protocols
- Multi-region API deployment
- Advanced AI moderation features

---

## Support

For API-related questions or issues:

- **API Documentation**: See generated docs in `generated/docs/`
- **Interactive Explorer**: Run `npm run preview:docs`
- **Issues**: Open GitHub issues with "api" label
- **Breaking Changes**: Contact API maintainers for migration support
