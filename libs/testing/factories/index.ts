/**
 * Test Data Factories
 *
 * Centralized factory definitions for generating consistent test data
 * across all tests. Uses Fishery + Faker for realistic data generation.
 *
 * @see https://github.com/thoughtbot/fishery
 * @see https://fakerjs.dev/
 */

export {
  UserFactory,
  AdminUserFactory,
  ModeratorUserFactory,
  InactiveUserFactory,
} from "./user.factory";
export type { User } from "./user.factory";

export {
  PartyFactory,
  MajorPartyFactory,
  MinorPartyFactory,
  InactivePartyFactory,
} from "./party.factory";
export type { Party } from "./party.factory";

export {
  BillFactory,
  DraftBillFactory,
  ActiveVotingBillFactory,
  PassedBillFactory,
  RejectedBillFactory,
} from "./bill.factory";
export type { Bill } from "./bill.factory";

export {
  VoteFactory,
  VoteForFactory,
  VoteAgainstFactory,
  AbstainVoteFactory,
  WeightedVoteFactory,
} from "./vote.factory";
export type { Vote } from "./vote.factory";

/**
 * Usage Examples:
 *
 * ```typescript
 * import { UserFactory, BillFactory } from '@political-sphere/testing/factories';
 *
 * // Generate single entity with defaults
 * const user = UserFactory.build();
 *
 * // Generate with overrides
 * const admin = UserFactory.build({ role: 'admin', username: 'specific-admin' });
 *
 * // Generate multiple entities
 * const users = UserFactory.buildList(10);
 *
 * // Use specialized factories
 * const admin = AdminUserFactory.build();
 * const passedBill = PassedBillFactory.build();
 *
 * // Generate related entities
 * const user = UserFactory.build({ id: 'user-1' });
 * const bill = BillFactory.build({ proposerId: user.id });
 * const vote = VoteFactory.build({ userId: user.id, billId: bill.id });
 * ```
 */
