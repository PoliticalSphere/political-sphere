import Database from 'better-sqlite3';
import { initializeDatabase, runMigrations } from './migrations';
import { UserStore } from './user-store';
import { PartyStore } from './party-store';
import { BillStore } from './bill-store';
import { VoteStore } from './vote-store';

export class DatabaseConnection {
  private db: Database.Database;
  public users: UserStore;
  public parties: PartyStore;
  public bills: BillStore;
  public votes: VoteStore;

  constructor() {
    this.db = initializeDatabase();
    runMigrations(this.db);

    this.users = new UserStore(this.db);
    this.parties = new PartyStore(this.db);
    this.bills = new BillStore(this.db);
    this.votes = new VoteStore(this.db);
  }

  close(): void {
    this.db.close();
  }
}

// Singleton pattern for database connection
let dbConnection: DatabaseConnection | null = null;

export function getDatabase(): DatabaseConnection {
  if (!dbConnection) {
    dbConnection = new DatabaseConnection();
  }
  return dbConnection;
}

export function closeDatabase(): void {
  if (dbConnection) {
    dbConnection.close();
    dbConnection = null;
  }
}
