import { v4 as uuidv4 } from 'uuid';
export class PartyStore {
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
      INSERT INTO parties (id, name, description, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, input.name, input.description || null, input.color, now.toISOString());
    const result = {
      id,
      name: input.name,
      description: input.description,
      color: input.color,
      createdAt: now,
    };

    // Invalidate cache entries
    if (this.cache) {
      this.cache.del('parties:all');
      this.cache.del(`party:id:${id}`);
      this.cache.del(`party:name:${input.name}`);
    }

    return result;
  }
  getById(id) {
    const cacheKey = `party:id:${id}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;

    const result = {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    };

    // Cache for 15 minutes (parties change less frequently)
    if (this.cache) {
      this.cache.set(cacheKey, result, 900);
    }

    return result;
  }
  getByName(name) {
    const cacheKey = `party:name:${name}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      WHERE name = ?
    `);
    const row = stmt.get(name);
    if (!row) return null;

    const result = {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    };

    // Cache for 15 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 900);
    }

    return result;
  }
  getAll() {
    const cacheKey = 'parties:all';

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    const result = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    }));

    // Cache for 15 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 900);
    }

    return result;
  }
}
