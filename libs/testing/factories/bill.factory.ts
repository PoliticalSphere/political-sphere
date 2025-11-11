import { faker } from "@faker-js/faker";
import { Factory } from "fishery";

export interface Bill {
  id: string;
  title: string;
  description: string;
  content: string;
  proposerId: string;
  partyId?: string;
  status: "draft" | "proposed" | "voting" | "passed" | "rejected" | "withdrawn";
  category: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  votingStartsAt?: string | null;
  votingEndsAt?: string | null;
  passedAt?: string | null;
}

const BILL_CATEGORIES = [
  "economy",
  "healthcare",
  "education",
  "environment",
  "defense",
  "infrastructure",
  "social-policy",
  "taxation",
  "justice",
  "technology",
] as const;

export const BillFactory = Factory.define<Bill>(({ sequence, params }) => ({
  id: params.id ?? `bill-${sequence}`,
  title:
    params.title ??
    `${faker.word.adjective()} ${faker.word.noun()} Act ${new Date().getFullYear()}`,
  description: params.description ?? faker.lorem.paragraph(),
  content: params.content ?? faker.lorem.paragraphs(3),
  proposerId: params.proposerId ?? `user-${sequence}`,
  partyId: params.partyId ?? `party-${faker.number.int({ min: 1, max: 10 })}`,
  status: params.status ?? "proposed",
  category: params.category ?? faker.helpers.arrayElement(BILL_CATEGORIES),
  tags:
    params.tags ??
    faker.helpers.arrayElements(["reform", "budget", "emergency", "amendment", "regulation"], {
      min: 1,
      max: 3,
    }),
  createdAt: params.createdAt ?? faker.date.past().toISOString(),
  updatedAt: params.updatedAt ?? faker.date.recent().toISOString(),
  votingStartsAt: params.votingStartsAt ?? null,
  votingEndsAt: params.votingEndsAt ?? null,
  passedAt: params.passedAt ?? null,
}));

// Specialized factories
export const DraftBillFactory = BillFactory.params({
  status: "draft",
});

export const ActiveVotingBillFactory = Factory.define<Bill>(({ params }) => ({
  ...BillFactory.build(),
  status: "voting",
  votingStartsAt: faker.date.past().toISOString(),
  votingEndsAt: faker.date.future().toISOString(),
  ...params,
}));

export const PassedBillFactory = Factory.define<Bill>(({ params }) => ({
  ...BillFactory.build(),
  status: "passed",
  votingStartsAt: faker.date.past({ years: 1 }).toISOString(),
  votingEndsAt: faker.date.recent({ days: 30 }).toISOString(),
  passedAt: faker.date.recent({ days: 30 }).toISOString(),
  ...params,
}));

export const RejectedBillFactory = Factory.define<Bill>(({ params }) => ({
  ...BillFactory.build(),
  status: "rejected",
  votingStartsAt: faker.date.past({ years: 1 }).toISOString(),
  votingEndsAt: faker.date.recent({ days: 30 }).toISOString(),
  ...params,
}));
