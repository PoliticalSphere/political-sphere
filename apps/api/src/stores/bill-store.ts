import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import { Bill, CreateBillInput, BillStatus } from '@political-sphere/shared';

export class BillStore {
  constructor(private db: Database.Database) {}

  create(input: CreateBillInput): Bill {
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

    return {
      id,
      title: input.title,
      description: input.description,
      proposerId: input.proposerId,
      status: 'proposed',
      createdAt: now,
      updatedAt: now,
    };
  }

  getById(id: string): Bill | null {
    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      WHERE id = ?
    `);

    const row = stmt.get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status as BillStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  updateStatus(id: string, status: BillStatus): Bill | null {
    const now = new Date();

    const stmt = this.db.prepare(`
      UPDATE bills
      SET status = ?, updated_at = ?
      WHERE id = ?
      RETURNING id, title, description, proposer_id, status, created_at, updated_at
    `);

    const row = stmt.get(status, now.toISOString(), id) as any;
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status as BillStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  getAll(): Bill[] {
    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      ORDER BY created_at DESC
    `);

    const rows = stmt.all() as any[];
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status as BillStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  getByProposerId(proposerId: string): Bill[] {
    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      WHERE proposer_id = ?
      ORDER BY created_at DESC
    `);

    const rows = stmt.all(proposerId) as any[];
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status as BillStatus,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
}
