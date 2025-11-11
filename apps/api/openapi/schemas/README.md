# OpenAPI Schemas

This directory contains reusable OpenAPI schema definitions that can be referenced in the main `api.yaml` file.

## Organization

Schemas are organized by domain:

- **`auth/`** - Authentication and authorization schemas
- **`users/`** - User management schemas
- **`parties/`** - Political party schemas
- **`votes/`** - Voting and governance schemas
- **`news/`** - News and content schemas
- **`common/`** - Shared/common schemas used across domains

## Usage

Schemas in this directory should be referenced in `api.yaml` using `$ref`:

```yaml
components:
  schemas:
    User:
      $ref: './schemas/users/User.yaml'
```

## Best Practices

1. **One schema per file** - Each YAML file should define a single schema
2. **Descriptive names** - Use PascalCase for schema names
3. **Include descriptions** - Add clear descriptions for all fields
4. **Validation rules** - Include appropriate validation constraints
5. **Examples** - Provide example values where helpful
