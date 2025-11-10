import { Factory } from "fishery";
import { faker } from "@faker-js/faker";

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  createdAt: string;
  updatedAt: string;
  role?: "user" | "admin" | "moderator";
  isActive?: boolean;
  lastLoginAt?: string | null;
}

export const UserFactory = Factory.define<User>(({ sequence, params }) => ({
  id: params.id ?? `user-${sequence}`,
  username: params.username ?? faker.internet.userName().toLowerCase(),
  email: params.email ?? faker.internet.email().toLowerCase(),
  passwordHash: params.passwordHash ?? faker.string.alphanumeric(60),
  createdAt: params.createdAt ?? faker.date.past().toISOString(),
  updatedAt: params.updatedAt ?? faker.date.recent().toISOString(),
  role: params.role ?? "user",
  isActive: params.isActive ?? true,
  lastLoginAt: params.lastLoginAt ?? faker.date.recent().toISOString(),
}));

// Specialized factories
export const AdminUserFactory = UserFactory.params({
  role: "admin",
  username: () => `admin_${faker.internet.userName().toLowerCase()}`,
});

export const ModeratorUserFactory = UserFactory.params({
  role: "moderator",
  username: () => `mod_${faker.internet.userName().toLowerCase()}`,
});

export const InactiveUserFactory = UserFactory.params({
  isActive: false,
  lastLoginAt: null,
});
