import { initializeDatabase, runMigrations } from "./migrations/index.js";
import { UserStore } from "./user-store.js";
import { PartyStore } from "./party-store.js";
import { BillStore } from "./bill-store.js";
import { VoteStore } from "./vote-store.js";
import { CacheService } from "./cache.ts";
export class DatabaseConnection {
  db;
  cache;
  users;
  parties;
  bills;
  votes;
  constructor() {
    this.db = initializeDatabase();
    runMigrations(this.db);
    // Initialize cache service (will use Redis if available, otherwise no-op)
    this.cache = new CacheService();
    this.users = new UserStore(this.db, this.cache);
    this.parties = new PartyStore(this.db, this.cache);
    this.bills = new BillStore(this.db, this.cache);
    this.votes = new VoteStore(this.db, this.cache);
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
