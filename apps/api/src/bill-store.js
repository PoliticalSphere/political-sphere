import { v4 as uuidv4 } from 'uuid';
export class BillStore {
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
      INSERT INTO bills (id, title, description, proposer_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      input.title,
      input.description || null,
      input.proposerId,
      'proposed',
      now.toISOString(),
      now.toISOString()
    );
    const result = {
      id,
      title: input.title,
      description: input.description,
      proposerId: input.proposerId,
      status: 'proposed',
      createdAt: now,
      updatedAt: now,
    };

    // Invalidate all bills cache and proposer-specific cache
    if (this.cache) {
      this.cache.del('bills:all');
      this.cache.del(`bills:proposer:${input.proposerId}`);
    }

    return result;
  }
  getById(id) {
    const cacheKey = `bill:${id}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;

    const result = {
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Cache for 10 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 600);
    }

    return result;
  }
  updateStatus(id, status) {
    const now = new Date();
    const stmt = this.db.prepare(`
      UPDATE bills
      SET status = ?, updated_at = ?
      WHERE id = ?
      RETURNING id, title, description, proposer_id, status, created_at, updated_at
    `);
    const row = stmt.get(status, now.toISOString(), id);
    if (!row) return null;

    const result = {
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    // Invalidate cache for this bill, all bills list, and proposer-specific cache
    if (this.cache) {
      this.cache.del(`bill:${id}`);
      this.cache.del('bills:all');
      this.cache.del(`bills:proposer:${result.proposerId}`);
    }

    return result;
  }
  getAll() {
    const cacheKey = 'bills:all';

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    const result = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    // Cache for 5 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 300);
    }

    return result;
  }
  getByProposerId(proposerId) {
    const cacheKey = `bills:proposer:${proposerId}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      WHERE proposer_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(proposerId);
    const result = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));

    // Cache for 5 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 300);
    }

    return result;
  }
}
