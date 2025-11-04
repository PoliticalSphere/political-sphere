import { v4 as uuidv4 } from 'uuid';

export class VoteStore {
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
      INSERT INTO votes (id, bill_id, user_id, vote, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, input.billId, input.userId, input.vote, now.toISOString());

    // Invalidate vote count cache for this bill
    if (this.cache) {
      this.cache.del(`vote_counts:${input.billId}`);
    }

    return {
      id,
      billId: input.billId,
      userId: input.userId,
      vote: input.vote,
      createdAt: now,
    };
  }
  getById(id) {
    const stmt = this.db.prepare(`
      SELECT id, bill_id, user_id, vote, created_at
      FROM votes
      WHERE id = ?
    `);
    const row = stmt.get(id);
    if (!row) return null;
    return {
      id: row.id,
      billId: row.bill_id,
      userId: row.user_id,
      vote: row.vote,
      createdAt: new Date(row.created_at),
    };
  }
  getByBillId(billId) {
    const stmt = this.db.prepare(`
      SELECT id, bill_id, user_id, vote, created_at
      FROM votes
      WHERE bill_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(billId);
    return rows.map((row) => ({
      id: row.id,
      billId: row.bill_id,
      userId: row.user_id,
      vote: row.vote,
      createdAt: new Date(row.created_at),
    }));
  }
  getByUserId(userId) {
    const stmt = this.db.prepare(`
      SELECT id, bill_id, user_id, vote, created_at
      FROM votes
      WHERE user_id = ?
      ORDER BY created_at DESC
    `);
    const rows = stmt.all(userId);
    return rows.map((row) => ({
      id: row.id,
      billId: row.bill_id,
      userId: row.user_id,
      vote: row.vote,
      createdAt: new Date(row.created_at),
    }));
  }
  hasUserVotedOnBill(userId, billId) {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM votes
      WHERE user_id = ? AND bill_id = ?
    `);
    const row = stmt.get(userId, billId);
    return row.count > 0;
  }
  getVoteCounts(billId) {
    const cacheKey = `vote_counts:${billId}`;

    // Try cache first
    if (this.cache) {
      const cached = this.cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
    }

    const stmt = this.db.prepare(`
      SELECT
        SUM(CASE WHEN vote = 'aye' THEN 1 ELSE 0 END) as aye,
        SUM(CASE WHEN vote = 'nay' THEN 1 ELSE 0 END) as nay,
        SUM(CASE WHEN vote = 'abstain' THEN 1 ELSE 0 END) as abstain
      FROM votes
      WHERE bill_id = ?
    `);
    const row = stmt.get(billId);
    const result = {
      aye: row.aye || 0,
      nay: row.nay || 0,
      abstain: row.abstain || 0,
    };

    // Cache the result for 5 minutes
    if (this.cache) {
      this.cache.set(cacheKey, result, 300);
    }

    return result;
  }
}
