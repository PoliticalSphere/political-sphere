import { initializeDatabase, runMigrations } from './migrations';
import { UserStore } from './user-store';
import { PartyStore } from './party-store';
import { BillStore } from './bill-store';
import { VoteStore } from './vote-store';
export class DatabaseConnection {
  db;
  users;
  parties;
  bills;
  votes;
  constructor() {
    this.db = initializeDatabase();
    runMigrations(this.db);
    this.users = new UserStore(this.db);
    this.parties = new PartyStore(this.db);
    this.bills = new BillStore(this.db);
    this.votes = new VoteStore(this.db);
  }
  close() {
    this.db.close();
  }
}
// Singleton pattern for database connection
let dbConnection = null;
export function getDatabase() {
  if (!dbConnection) {
    dbConnection = new DatabaseConnection();
  }
  return dbConnection;
}
export function closeDatabase() {
  if (dbConnection) {
    dbConnection.close();
    dbConnection = null;
  }
}
