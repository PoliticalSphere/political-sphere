import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Party, CreatePartyInput } from '@political-sphere/shared';

export class PartyStore {
  constructor(private db: Database.Database) {}

  create(input: CreatePartyInput): Party {
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

  getById(id: string): Party | null {
    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }

  getByName(name: string): Party | null {
    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      WHERE name = ?
    `);

    const row = stmt.get(name) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }

  getAll(): Party[] {
    const stmt = this.db.prepare(`
      SELECT id, name, description, color, created_at
      FROM parties
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      createdAt: new Date(row.created_at),
    }));
  }
}
