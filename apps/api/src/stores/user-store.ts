import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserInput } from '@political-sphere/shared';

export class UserStore {
  constructor(private db: Database.Database) {}

  create(input: CreateUserInput): User {
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

  getById(id: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  getByUsername(username: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE username = ?
    `);

    const row = stmt.get(username) as any;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  getByEmail(email: string): User | null {
    const stmt = this.db.prepare(`
      SELECT id, username, email, created_at, updated_at
      FROM users
      WHERE email = ?
    `);

    const row = stmt.get(email) as any;
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
