# Apps

This directory contains the main application services for the Political Sphere platform. Each subdirectory represents a deployable application or service in the microservices architecture.

## Applications

- **`api/`** - Backend API service handling RESTful endpoints and business logic
- **`frontend/`** - Main frontend application built with React
- **`worker/`** - Background job processor for asynchronous tasks
- **`host/`** - Module federation host application
- **`remote/`** - Module federation remote application
- **`infrastructure/`** - Infrastructure as Code definitions and deployments
- **`dev/`** - Development tooling and local environment setup

## Architecture

These applications follow a microservices architecture deployed on Kubernetes using Helm charts and GitOps principles. Each service is designed to be independently deployable and scalable.

## Development

To start all applications locally:

```bash
npm run dev:all
```

Individual services can be started with:

```bash
npm run dev:api
npm run dev:frontend
npm run dev:worker
```

Refer to each application's README.md for specific setup and development instructions.
