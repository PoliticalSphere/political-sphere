// Proxy module to support CommonJS resolution from TypeScript-compiled code in tests
// Exports initializeDatabase and runMigrations from the API root migrations implementation

const { initializeDatabase, runMigrations } = require("../migrations.js");

module.exports = {
	initializeDatabase,
	runMigrations,
};
