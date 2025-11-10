import { Factory } from "fishery";
import { faker } from "@faker-js/faker";

export interface Vote {
  id: string;
  billId: string;
  userId: string;
  position: "for" | "against" | "abstain";
  comment?: string | null;
  createdAt: string;
  updatedAt: string;
  weight?: number;
}

export const VoteFactory = Factory.define<Vote>(({ sequence, params }) => ({
  id: params.id ?? `vote-${sequence}`,
  billId: params.billId ?? `bill-${faker.number.int({ min: 1, max: 100 })}`,
  userId: params.userId ?? `user-${faker.number.int({ min: 1, max: 1000 })}`,
  position:
    params.position ??
    faker.helpers.arrayElement(["for", "against", "abstain"]),
  comment:
    params.comment ??
    (faker.datatype.boolean() ? faker.lorem.sentence() : null),
  createdAt: params.createdAt ?? faker.date.recent().toISOString(),
  updatedAt: params.updatedAt ?? faker.date.recent().toISOString(),
  weight: params.weight ?? 1,
}));

// Specialized factories
export const VoteForFactory = VoteFactory.params({
  position: "for",
  comment: () => faker.lorem.sentence(),
});

export const VoteAgainstFactory = VoteFactory.params({
  position: "against",
  comment: () => faker.lorem.sentence(),
});

export const AbstainVoteFactory = VoteFactory.params({
  position: "abstain",
  comment: null,
});

export const WeightedVoteFactory = VoteFactory.params({
  weight: () => faker.number.int({ min: 1, max: 5 }),
});
