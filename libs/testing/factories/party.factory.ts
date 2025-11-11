import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export interface Party {
  id: string;
  name: string;
  description: string;
  color: string;
  leaderId: string;
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  ideology?: string;
}

const PARTY_IDEOLOGIES = [
  'progressive',
  'conservative',
  'liberal',
  'socialist',
  'centrist',
  'libertarian',
  'green',
  'nationalist',
] as const;

const PARTY_COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DFE6E9', // Gray
  '#A29BFE', // Purple
  '#FD79A8', // Pink
];

export const PartyFactory = Factory.define<Party>(({ sequence, params }) => ({
  id: params.id ?? `party-${sequence}`,
  name: params.name ?? `${faker.word.adjective()} ${faker.word.noun()} Party`,
  description: params.description ?? faker.lorem.sentence(),
  color: params.color ?? faker.helpers.arrayElement(PARTY_COLORS),
  leaderId: params.leaderId ?? `user-${sequence}`,
  memberCount: params.memberCount ?? faker.number.int({ min: 10, max: 10000 }),
  createdAt: params.createdAt ?? faker.date.past().toISOString(),
  updatedAt: params.updatedAt ?? faker.date.recent().toISOString(),
  isActive: params.isActive ?? true,
  ideology: params.ideology ?? faker.helpers.arrayElement(PARTY_IDEOLOGIES),
}));

// Specialized factories
export const MajorPartyFactory = Factory.define<Party>(({ params }) => ({
  ...PartyFactory.build(),
  memberCount: faker.number.int({ min: 5000, max: 50000 }),
  ...params,
}));

export const MinorPartyFactory = Factory.define<Party>(({ params }) => ({
  ...PartyFactory.build(),
  memberCount: faker.number.int({ min: 10, max: 500 }),
  ...params,
}));

export const InactivePartyFactory = PartyFactory.params({
  isActive: false,
  memberCount: 0,
});
