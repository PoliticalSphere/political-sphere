import { v4 as uuidv4 } from 'uuid';
export class UserStore {
  db;
  cache;
  constructor(db, cache = null) {
    this.db = db;
    this.cache = cache;
  }
  create(input) {
    const id = uuidv4();
    const now = new Date();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, input.username, input.email, now.toISOString(), now.toISOString());
    const result = {
      id,
      username: input.username,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    };

    // Invalidate cache entries for this user (though unlikely to exist for new user)
    if (this.cache) {
      this.cache.del(`user:id:${id}`);
      this.cache.del(`user:username:${input.username}`);
      this.cache.del(`user:email:${input.email}`);
    }

    return result;
  }
  getById(id) {
    const cacheKey = `user:id:${id}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;

    const result = {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache for 10 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 600);
    }

    return result;
  }
  getByUsername(username) {
    const cacheKey = `user:username:${username}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE username = ?
    `);
    const row = stmt.get(username);
    if (!row) return null;

    const result = {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache for 10 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 600);
    }

    return result;
  }
  getByEmail(email) {
    const cacheKey = `user:email:${email}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE email = ?
    `);
    const row = stmt.get(email);
    if (!row) return null;

    const result = {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache for 10 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 600);
    }

    return result;
  }
}
