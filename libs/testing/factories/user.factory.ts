import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
  role?: 'user' | 'admin' | 'moderator';
  isActive?: boolean;
  lastLoginAt?: string | null;
}

export const UserFactory = Factory.define<User>(({ sequence, params }) => ({
  id: params.id ?? `user-${sequence}`,
  username: params.username ?? faker.internet.username().toLowerCase(),
  email: params.email ?? faker.internet.email().toLowerCase(),
  passwordHash: params.passwordHash ?? faker.string.alphanumeric(60),
  createdAt: params.createdAt ?? faker.date.past().toISOString(),
  updatedAt: params.updatedAt ?? faker.date.recent().toISOString(),
  role: params.role ?? 'user',
  isActive: params.isActive ?? true,
  lastLoginAt: params.lastLoginAt ?? faker.date.recent().toISOString(),
}));

// Specialized factories
export const AdminUserFactory = Factory.define<User>(({ params }) => ({
  ...UserFactory.build(),
  role: 'admin',
  username: `admin_${faker.internet.username().toLowerCase()}`,
  ...params,
}));

export const ModeratorUserFactory = Factory.define<User>(({ params }) => ({
  ...UserFactory.build(),
  role: 'moderator',
  username: `mod_${faker.internet.username().toLowerCase()}`,
  ...params,
}));

export const InactiveUserFactory = UserFactory.params({
  isActive: false,
  lastLoginAt: null,
});
