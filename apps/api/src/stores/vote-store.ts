import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import { Vote, CreateVoteInput, VoteType } from "@political-sphere/shared";

interface VoteRow {
  id: string;
  bill_id: string;
  user_id: string;
  vote: VoteType | string;
  created_at: string;
}

interface VoteCountRow {
  aye: number | null;
  nay: number | null;
  abstain: number | null;
}

export class VoteStore {
  constructor(private db: Database.Database) {}

  create(input: CreateVoteInput): Vote {
    const id = uuidv4();
    const now = new Date();

    const stmt = this.db.prepare(`
      INSERT INTO votes (id, bill_id, user_id, vote, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.billId, input.userId, input.vote, now.toISOString());

    return {
      id,
      billId: input.billId,
      userId: input.userId,
      vote: input.vote,
      createdAt: now,
    };
  }

  getById(id: string): Vote | null {
    const row = this.db
      .prepare<[string], VoteRow>(
        `SELECT id, bill_id, user_id, vote, created_at FROM votes WHERE id = ?`,
      )
      .get(id);
    if (!row) return null;

    return {
      id: row.id,
      billId: row.bill_id,
      userId: row.user_id,
      vote: row.vote as VoteType,
      createdAt: new Date(row.created_at),
    };
  }

  getByBillId(billId: string): Vote[] {
    const stmt = this.db.prepare<[string], VoteRow>(
      `SELECT id, bill_id, user_id, vote, created_at FROM votes WHERE bill_id = ? ORDER BY created_at DESC`,
    );
    const rows = stmt.all(billId);
    return rows.map((row) => ({
      id: row.id,
      billId: row.bill_id,
      userId: row.user_id,
      vote: row.vote as VoteType,
      createdAt: new Date(row.created_at),
    }));
  }

  getByUserId(userId: string): Vote[] {
    const stmt = this.db.prepare<[string], VoteRow>(
      `SELECT id, bill_id, user_id, vote, created_at FROM votes WHERE user_id = ? ORDER BY created_at DESC`,
    );
    const rows = stmt.all(userId);
    return rows.map((row) => ({
      id: row.id,
      billId: row.bill_id,
      userId: row.user_id,
      vote: row.vote as VoteType,
      createdAt: new Date(row.created_at),
    }));
  }

  hasUserVotedOnBill(userId: string, billId: string): boolean {
    const stmt = this.db.prepare<[string, string], { count: number | null }>(
      `SELECT COUNT(*) as count FROM votes WHERE user_id = ? AND bill_id = ?`,
    );
    const row = stmt.get(userId, billId);
    return (row?.count ?? 0) > 0;
  }

  getVoteCounts(billId: string): { aye: number; nay: number; abstain: number } {
    const stmt = this.db.prepare<[string], VoteCountRow>(
      `SELECT
        SUM(CASE WHEN vote = 'aye' THEN 1 ELSE 0 END) as aye,
        SUM(CASE WHEN vote = 'nay' THEN 1 ELSE 0 END) as nay,
        SUM(CASE WHEN vote = 'abstain' THEN 1 ELSE 0 END) as abstain
      FROM votes
      WHERE bill_id = ?`,
    );

    const row = stmt.get(billId) ?? { aye: 0, nay: 0, abstain: 0 };
    return {
      aye: row.aye ?? 0,
      nay: row.nay ?? 0,
      abstain: row.abstain ?? 0,
    };
  }
}
