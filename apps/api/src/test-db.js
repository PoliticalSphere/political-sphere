import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_DB_PATH } from "./config.js";
import { initializeDatabase, runMigrations } from "./migrations/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(process.cwd(), DEFAULT_DB_PATH); // Make absolute from root

console.log("DB Path:", dbPath);

try {
	const db = initializeDatabase(dbPath);

	console.log("DB created and opened");

	// Test pragma
	db.pragma("journal_mode = WAL");
	console.log("Pragma WAL set");

	// Test prepare
	const stmt = db.prepare("SELECT 1 as test");
	const row = stmt.get();
	console.log("Prepare and query success:", row);

	// Test exec
	db.exec("CREATE TABLE IF NOT EXISTS test (id INTEGER PRIMARY KEY)");
	console.log("Exec success");

	// Test migrations
	console.log("Running migrations...");
	await runMigrations(db);
	console.log("Migrations completed successfully");

	db.close();
	console.log("Test completed successfully");
} catch (error) {
	console.error("Test failed:", error.message);
	if (error.stack) {
		console.error("Stack trace:", error.stack);
	}
}
