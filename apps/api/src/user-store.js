import { v4 as uuidv4 } from 'uuid';
export class UserStore {
  db;
  constructor(db) {
    this.db = db;
  }
  create(input) {
    const id = uuidv4();
    const now = new Date();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, username, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, input.username, input.email, now.toISOString(), now.toISOString());
    return {
      id,
      username: input.username,
      email: input.email,
      createdAt: now,
      updatedAt: now,
    };
  }
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
  getByUsername(username) {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE username = ?
    `);
    const row = stmt.get(username);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
  getByEmail(email) {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE email = ?
    `);
    const row = stmt.get(email);
    if (!row) return null;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
