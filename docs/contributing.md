# Contributing to Political Sphere

<div align="center">

| Classification | Version | Last Updated |       Owner        | Review Cycle |   Status   |
| :------------: | :-----: | :----------: | :----------------: | :----------: | :--------: |
|  🔒 Internal   | `0.1.0` |  2025-10-30  | Documentation Team |  Quarterly   | **Approved** |

</div>

---


Welcome! We're excited that you're interested in contributing to Political Sphere, a multiplayer political simulation game set in the UK. This guide will help you get started with contributing to our project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Review Process](#review-process)
- [Community](#community)

## Code of Conduct

All contributors must adhere to our [Code of Conduct](./02-governance/ethics.md). We are committed to providing a welcoming and inclusive environment for everyone. Please read and follow these guidelines in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **Git** for version control
- **Docker** and Docker Compose for local development
- **VS Code** with recommended extensions (see `.vscode/`)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/political-sphere/platform.git
   cd political-sphere
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up development environment**
   ```bash
   npm run dev:setup
   ```

4. **Start local development**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm test
   ```

For detailed setup instructions, see [Development Environment Setup](./00-foundation/dev-setup.md).

## Development Workflow

We use a structured development workflow to maintain code quality and ensure smooth collaboration:

### 1. Choose an Issue

- Check our [GitHub Issues](https://github.com/political-sphere/platform/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

Use descriptive branch names following our conventions:

```bash
# Feature branches
git checkout -b feature/add-user-authentication

# Bug fixes
git checkout -b fix/login-validation-error

# Documentation
git checkout -b docs/update-api-documentation

# Hotfixes
git checkout -b hotfix/critical-security-patch
```

### 3. Make Changes

- Write clear, focused commits
- Follow our [coding standards](#coding-standards)
- Add tests for new functionality
- Update documentation as needed

### 4. Test Your Changes

- Run the full test suite: `npm test`
- Test manually in the development environment
- Check for linting errors: `npm run lint`
- Verify build succeeds: `npm run build`

### 5. Submit a Pull Request

- Push your branch to GitHub
- Create a pull request with a clear description
- Reference the issue number (e.g., "Fixes #123")
- Request review from appropriate team members

## Coding Standards

### General Guidelines

- **Clarity over cleverness**: Write code that is easy to understand
- **Consistency**: Follow existing patterns in the codebase
- **Documentation**: Comment complex logic and public APIs
- **Performance**: Consider efficiency but don't prematurely optimize

### Language-Specific Standards

#### TypeScript/JavaScript

- Use TypeScript for all new code
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use meaningful variable and function names
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises for better readability

#### React Components

- Use functional components with hooks
- Follow component naming conventions: `PascalCase`
- Use TypeScript interfaces for props
- Implement proper error boundaries
- Follow accessibility guidelines (WCAG 2.2 AA)

#### Backend/API

- Use RESTful API design principles
- Implement proper error handling and logging
- Validate all inputs and sanitize outputs
- Use appropriate HTTP status codes
- Document API endpoints with OpenAPI/Swagger

### File Organization

```
apps/
├── frontend/          # React application
├── api/              # Backend API
└── worker/           # Background processing

libs/
├── ui/               # Shared UI components
├── platform/         # Business logic
└── shared/           # Common utilities

docs/                 # Documentation
```

### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add OAuth2 login support
fix(api): resolve user profile update bug
docs(readme): update installation instructions
```

## Testing

We maintain high test coverage and quality:

### Test Types

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Ensure acceptable response times
- **Accessibility Tests**: Verify WCAG compliance

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test/file

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Generate coverage report
npm run test:coverage
```

### Writing Tests

- Write tests for all new features
- Test both happy path and error scenarios
- Use descriptive test names
- Mock external dependencies
- Aim for 80%+ code coverage

## Documentation

Good documentation is crucial for maintainability:

### Code Documentation

- Use JSDoc/TSDoc for public APIs
- Document complex algorithms and business logic
- Include examples for non-obvious usage
- Keep comments up-to-date with code changes

### Project Documentation

- Update relevant docs when making changes
- Follow the [documentation standards](./document-control/templates/)
- Use clear, concise language
- Include practical examples

## Submitting Changes

### Pull Request Guidelines

1. **Title**: Clear, descriptive title following conventional commits
2. **Description**: Detailed explanation of changes
3. **Testing**: Describe how changes were tested
4. **Breaking Changes**: Note any breaking changes
5. **Screenshots**: Include for UI changes
6. **Related Issues**: Reference related issues/PRs

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
```

## Review Process

### Code Review Guidelines

**Reviewers should check:**
- Code correctness and efficiency
- Test coverage and quality
- Adherence to coding standards
- Documentation completeness
- Security implications
- Performance impact

**Authors should:**
- Respond to feedback promptly
- Make requested changes
- Re-request review when ready
- Be open to suggestions

### Approval Process

- **1 reviewer** required for minor changes
- **2 reviewers** required for major features
- **Security review** required for security-related changes
- **Product review** required for user-facing changes

## Community

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat for contributors
- **Newsletter**: Monthly updates and announcements

### Getting Help

- Check existing issues and documentation first
- Use GitHub Discussions for questions
- Join our Discord community
- Contact maintainers for urgent issues

### Recognition

We appreciate all contributions! Contributors are recognized through:
- GitHub contributor statistics
- Release notes acknowledgments
- Community shoutouts
- Contributor badges

## Additional Resources

- [Architecture Overview](./architecture.md)
- [API Documentation](./api.md)
- [Development Environment Setup](./00-foundation/dev-setup.md)
- [Coding Standards](./00-foundation/coding-standards.md)
- [Security Guidelines](./06-security-and-risk/security-policies.md)

---

Thank you for contributing to Political Sphere! Your efforts help make political discourse more engaging and accessible for everyone.

*For questions about this guide, please create an issue or start a discussion on GitHub.*
