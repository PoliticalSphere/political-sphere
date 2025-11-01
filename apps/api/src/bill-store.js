import { v4 as uuidv4 } from 'uuid';
export class BillStore {
  db;
  constructor(db) {
    this.db = db;
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
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
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
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
  getAll() {
    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
  getByProposerId(proposerId) {
    const stmt = this.db.prepare(`
      SELECT id, title, description, proposer_id, status, created_at, updated_at
      FROM bills
      WHERE proposer_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(proposerId);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      proposerId: row.proposer_id,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }
}
