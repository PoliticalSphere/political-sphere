# Test Data Factories

Centralized test data generation using [Fishery](https://github.com/thoughtbot/fishery) and [Faker](https://fakerjs.dev/).

## Installation

Already installed as part of the monorepo. Factories are available at:

```typescript
import {
  UserFactory,
  BillFactory,
  PartyFactory,
  VoteFactory,
} from "@political-sphere/testing/factories";
```

## Available Factories

### User Factories

```typescript
// Basic user
const user = UserFactory.build();

// Admin user
const admin = AdminUserFactory.build();

// Moderator user
const moderator = ModeratorUserFactory.build();

// Inactive user
const inactive = InactiveUserFactory.build();

// Custom overrides
const specificUser = UserFactory.build({
  username: "johndoe",
  email: "john@example.com",
  role: "admin",
});

// Multiple users
const users = UserFactory.buildList(10);
```

### Party Factories

```typescript
// Basic party
const party = PartyFactory.build();

// Major party (high member count)
const majorParty = MajorPartyFactory.build();

// Minor party (low member count)
const minorParty = MinorPartyFactory.build();

// Inactive party
const inactiveParty = InactivePartyFactory.build();

// Custom party
const specificParty = PartyFactory.build({
  name: "Progressive Alliance",
  ideology: "progressive",
  memberCount: 5000,
});
```

### Bill Factories

```typescript
// Basic bill
const bill = BillFactory.build();

// Draft bill
const draft = DraftBillFactory.build();

// Active voting bill
const activeBill = ActiveVotingBillFactory.build();

// Passed bill
const passedBill = PassedBillFactory.build();

// Rejected bill
const rejectedBill = RejectedBillFactory.build();

// Bill for specific user/party
const userBill = BillFactory.build({
  proposerId: user.id,
  partyId: party.id,
});
```

### Vote Factories

```typescript
// Basic vote
const vote = VoteFactory.build();

// Vote "for"
const voteFor = VoteForFactory.build();

// Vote "against"
const voteAgainst = VoteAgainstFactory.build();

// Abstain vote
const abstain = AbstainVoteFactory.build();

// Weighted vote
const weighted = WeightedVoteFactory.build();

// Vote on specific bill by specific user
const specificVote = VoteFactory.build({
  billId: bill.id,
  userId: user.id,
  position: "for",
});
```

## Usage Patterns

### Testing Related Entities

```typescript
import {
  UserFactory,
  BillFactory,
  VoteFactory,
} from "@political-sphere/testing/factories";

describe("Bill voting", () => {
  it("should record user votes", () => {
    // Create related test data
    const user = UserFactory.build({ id: "user-1" });
    const bill = ActiveVotingBillFactory.build({
      id: "bill-1",
      proposerId: "user-2", // Different user
    });
    const vote = VoteFactory.build({
      userId: user.id,
      billId: bill.id,
      position: "for",
    });

    // Test logic here
  });
});
```

### Generating Realistic Test Scenarios

```typescript
// Create a coalition government scenario
const coalition = {
  majorParty: MajorPartyFactory.build({
    name: "Democratic Alliance",
    memberCount: 45000,
  }),
  minorParty: MinorPartyFactory.build({
    name: "Green Coalition",
    memberCount: 8000,
  }),
  leader: AdminUserFactory.build(),
  members: UserFactory.buildList(100),
};

// Create a controversial bill with mixed votes
const controversialBill = ActiveVotingBillFactory.build();
const votesFor = VoteForFactory.buildList(45, { billId: controversialBill.id });
const votesAgainst = VoteAgainstFactory.buildList(48, {
  billId: controversialBill.id,
});
const abstentions = AbstainVoteFactory.buildList(7, {
  billId: controversialBill.id,
});
```

### Integration with Existing Test Helpers

Factories can replace manual mock creation:

```typescript
// OLD WAY (manual mocks)
const user = {
  id: `user_${Date.now()}`,
  username: `testuser_${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// NEW WAY (factories)
const user = UserFactory.build();
```

## Best Practices

### 1. Use Specialized Factories

```typescript
// ✅ Good: Use specialized factory
const admin = AdminUserFactory.build();

// ❌ Less ideal: Override every time
const admin = UserFactory.build({ role: "admin" });
```

### 2. Build Related Entities Together

```typescript
// ✅ Good: Clear relationships
const user = UserFactory.build({ id: "user-1" });
const bill = BillFactory.build({ proposerId: user.id });

// ❌ Confusing: Unclear relationships
const user = UserFactory.build();
const bill = BillFactory.build();
```

### 3. Override Only What You Need

```typescript
// ✅ Good: Override only relevant fields
const user = UserFactory.build({ email: "test@example.com" });

// ❌ Excessive: Too many overrides
const user = UserFactory.build({
  id: "user-1",
  username: "test",
  email: "test@example.com",
  // ... many more
});
```

### 4. Use BuildList for Collections

```typescript
// ✅ Good: Use buildList
const users = UserFactory.buildList(10);

// ❌ Inefficient: Manual loop
const users = Array.from({ length: 10 }, () => UserFactory.build());
```

## Extending Factories

To add new factories, follow this pattern:

```typescript
// libs/testing/factories/new-entity.factory.ts
import { Factory } from "fishery";
import { faker } from "@faker-js/faker";

export interface NewEntity {
  id: string;
  name: string;
  createdAt: string;
}

export const NewEntityFactory = Factory.define<NewEntity>(
  ({ sequence, params }) => ({
    id: params.id ?? `entity-${sequence}`,
    name: params.name ?? faker.lorem.word(),
    createdAt: params.createdAt ?? faker.date.past().toISOString(),
  })
);

// Export from index.ts
export { NewEntityFactory } from "./new-entity.factory";
export type { NewEntity } from "./new-entity.factory";
```

## Migration Guide

To migrate existing tests:

1. Install dependencies (already done):

   ```bash
   npm install --save-dev @faker-js/faker fishery
   ```

2. Replace manual mocks:

   ```typescript
   // Before
   import { createMockUser } from "./test-helpers";
   const user = createMockUser({ email: "test@example.com" });

   // After
   import { UserFactory } from "@political-sphere/testing/factories";
   const user = UserFactory.build({ email: "test@example.com" });
   ```

3. Run tests to verify:
   ```bash
   npm test
   ```

## Troubleshooting

### TypeScript Errors

If you see TypeScript errors about missing types:

```bash
npm run type-check
```

Ensure `tsconfig.json` includes the factories directory.

### Import Errors

If factories aren't found:

```typescript
// ✅ Correct import
import { UserFactory } from "@political-sphere/testing/factories";

// ❌ Wrong import
import { UserFactory } from "libs/testing/factories";
```

## Performance

Factories are designed for test performance:

- **Fast generation**: 1000s of entities per second
- **Deterministic**: Same seed = same data (for debugging)
- **Lazy evaluation**: Only computes what you use

## See Also

- [Fishery Documentation](https://github.com/thoughtbot/fishery)
- [Faker.js Documentation](https://fakerjs.dev/)
- [Testing Guide](../../docs/05-engineering-and-devops/development/testing.md)
