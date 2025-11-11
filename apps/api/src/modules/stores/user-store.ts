import type { CreateUserInput, User } from '@political-sphere/shared';
import type Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line no-restricted-imports
import { CACHE_TTL, type CacheService, cacheKeys } from '../../utils/cache.js';

interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

export class UserStore {
  constructor(
    private db: Database.Database,
    private cache?: CacheService
  ) {}

  async create(input: CreateUserInput): Promise<User> {
    const id = uuidv4();
    const now = new Date();

    // Handle optional passwordHash and role fields
    const passwordHash = input.passwordHash;
    const role = input.role || 'VIEWER';

    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, email, password_hash, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.username,
      input.email,
      passwordHash || null,
      role,
      now.toISOString(),
      now.toISOString()
    );

    const user: User = {
      id,
      username: input.username,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    };

    if (this.cache) {
      await Promise.all([
        this.cache.set(cacheKeys.user(id), user, CACHE_TTL.USER),
        this.cache.set(cacheKeys.userByUsername(input.username), user, CACHE_TTL.USER),
        this.cache.set(cacheKeys.userByEmail(input.email), user, CACHE_TTL.USER),
        this.cache.invalidatePattern('user:*:bills'),
        this.cache.invalidatePattern('user:*:votes'),
      ]);
    }

    return user;
  }

  async getById(id: string): Promise<User | null> {
    // Try cache first
    if (this.cache) {
      const cached = await this.cache.get<User>(cacheKeys.user(id));
      if (cached) return cached;
    }

    const row = this.db
      .prepare<
        [string],
        UserRow
      >(`SELECT id, username, email, created_at, updated_at FROM users WHERE id = ?`)
      .get(id);
    if (!row) return null;

    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache the result
    if (this.cache) {
      await this.cache.set(cacheKeys.user(id), user, CACHE_TTL.USER);
    }

    return user;
  }

  async getByUsername(username: string): Promise<User | null> {
    // Try cache first
    if (this.cache) {
      const cached = await this.cache.get<User>(cacheKeys.userByUsername(username));
      if (cached) return cached;
    }

    const row = this.db
      .prepare<
        [string],
        UserRow
      >(`SELECT id, username, email, created_at, updated_at FROM users WHERE username = ?`)
      .get(username);
    if (!row) return null;

    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache the result
    if (this.cache) {
      await this.cache.set(cacheKeys.userByUsername(username), user, CACHE_TTL.USER);
    }

    return user;
  }

  async getByEmail(email: string): Promise<User | null> {
    // Try cache first
    if (this.cache) {
      const cached = await this.cache.get<User>(cacheKeys.userByEmail(email));
      if (cached) return cached;
    }

    const row = this.db
      .prepare<
        [string],
        UserRow
      >(`SELECT id, username, email, created_at, updated_at FROM users WHERE email = ?`)
      .get(email);
    if (!row) return null;

    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache the result
    if (this.cache) {
      await this.cache.set(cacheKeys.userByEmail(email), user, CACHE_TTL.USER);
    }

    return user;
  }
  /**
   * Retrieve all users (no paging needed for current test scope)
   */
  async getAll(): Promise<User[]> {
    const rows = this.db
      .prepare<
        [],
        UserRow
      >(`SELECT id, username, email, created_at, updated_at FROM users ORDER BY created_at DESC`)
      .all();
    return rows.map(r => ({
      id: r.id,
      username: r.username,
      email: r.email,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    }));
  }

  /**
   * Update username/email for a user, returning updated record or null if not found
   */
  async update(
    id: string,
    updates: Partial<Pick<User, 'username' | 'email'>>
  ): Promise<User | null> {
    const current = await this.getById(id);
    if (!current) return null;
    const newUsername = updates.username ?? current.username;
    const newEmail = updates.email ?? current.email;
    const now = new Date().toISOString();
    this.db
      .prepare(`UPDATE users SET username = ?, email = ?, updated_at = ? WHERE id = ?`)
      .run(newUsername, newEmail, now, id);
    return await this.getById(id);
  }

  /**
   * Delete a user by id
   */
  async delete(id: string): Promise<boolean> {
    const result = this.db.prepare(`DELETE FROM users WHERE id = ?`).run(id);
    if (result.changes > 0 && this.cache) {
      await Promise.all([
        this.cache.del(cacheKeys.user(id)),
        this.cache.invalidatePattern(`user:${id}:*`),
      ]);
    }
    return result.changes > 0;
  }

  /**
   * Get user with password hash for authentication (internal use only)
   * Returns user with passwordHash and role fields included
   */
  async getUserForAuth(usernameOrEmail: string): Promise<{
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: string;
  } | null> {
    const row = this.db
      .prepare<
        [string, string],
        UserRow & { password_hash: string; role: string }
      >(`SELECT id, username, email, password_hash, role, created_at, updated_at FROM users WHERE username = ? OR email = ?`)
      .get(usernameOrEmail, usernameOrEmail);

    if (!row || !row.password_hash) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      passwordHash: row.password_hash,
      role: row.role,
    };
  }
}
