import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { Party, CreatePartyInput } from "@political-sphere/shared";

interface PartyRow {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
}

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
    const row = this.db
      .prepare<[string], PartyRow>(
        `SELECT id, name, description, color, created_at FROM parties WHERE id = ?`,
      )
      .get(id);
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }

  getByName(name: string): Party | null {
    const row = this.db
      .prepare<[string], PartyRow>(
        `SELECT id, name, description, color, created_at FROM parties WHERE name = ?`,
      )
      .get(name);
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      color: row.color,
      createdAt: new Date(row.created_at),
    };
  }

  getAll(): Party[] {
    const stmt = this.db.prepare<[], PartyRow>(
      `SELECT id, name, description, color, created_at FROM parties ORDER BY created_at DESC`,
    );
    const rows = stmt.all();
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description ?? undefined,
      color: row.color,
      createdAt: new Date(row.created_at),
    }));
  }
}
