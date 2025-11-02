/**
 * Custom error class for migration-related errors
 * Owned by: API Team
 * @see docs/architecture/decisions/adr-0001-database-migrations.md
 */

export class MigrationError extends Error {
  constructor(message, migrationName, originalError = null) {
    super(message);
    this.name = "MigrationError";
    this.migrationName = migrationName;
    this.originalError = originalError;
  }

  toString() {
    return `${this.name}: ${this.message} (Migration: ${this.migrationName})`;
  }
}

export class MigrationRollbackError extends MigrationError {
  constructor(message, migrationName, originalError = null) {
    super(message, migrationName, originalError);
    this.name = "MigrationRollbackError";
  }
}

export class MigrationValidationError extends MigrationError {
  constructor(message, migrationName, originalError = null) {
    super(message, migrationName, originalError);
    this.name = "MigrationValidationError";
  }
}
