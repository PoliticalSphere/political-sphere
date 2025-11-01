import { v4 as uuidv4 } from 'uuid';
export class PartyStore {
  db;
  constructor(db) {
    this.db = db;
  }
  create(input) {
    const id = uuidv4();
    const now = new Date();
    const stmt = this.db.prepare(`
      INSERT INTO parties (id, name, description, color, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, input.name, input.description || null, input.color, now.toISOString());
    return {
      id,
      name: input.name,
      description: input.description,
      color: input.color,
      createdAt: now,
    };
  }
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }
  getByName(name) {
    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      WHERE name = ?
    `);
    const row = stmt.get(name);
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }
  getAll() {
    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    }));
  }
}
