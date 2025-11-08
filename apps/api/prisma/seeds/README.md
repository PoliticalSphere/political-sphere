# Prisma Seed Data

This directory contains seed scripts for populating the database with initial data.

## Main Seed Script

`seed.ts` - Primary seed script that populates:

- Default political parties
- Admin/moderator users
- Sample proposals
- News articles

## Running Seeds

### Development

```bash
# Run the seed script
npx prisma db seed

# Or via npm script
npm run db:seed
```

### Custom Seeds

You can create additional seed files for specific scenarios:

- `seed.production.ts` - Minimal production data
- `seed.testing.ts` - Test-specific data
- `seed.demo.ts` - Demo/presentation data

## Seed Data Guidelines

1. **Environment-aware**: Check `NODE_ENV` before destructive operations
2. **Idempotent**: Seeds should be safe to run multiple times
3. **Realistic**: Use realistic but anonymized data
4. **Documented**: Add comments explaining seed data choices
5. **Security**: Never use real credentials or PII

## Configuration

Add to `package.json`:

```json
{
  "prisma": {
    "seed": "tsx prisma/seeds/seed.ts"
  }
}
```

## Best Practices

- Clear existing data only in development
- Use transactions for related data
- Log progress for visibility
- Handle errors gracefully
- Keep seed data minimal but representative
