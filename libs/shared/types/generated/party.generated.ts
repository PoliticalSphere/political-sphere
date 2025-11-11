/**
 * This file was automatically generated from party.schema.json.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSON Schema file,
 * and run `npm run schemas:generate` to regenerate this file.
 */

/**
 * A political party in the Political Sphere platform
 */
export interface Party {
  /**
   * Unique identifier for the party
   */
  id: string;
  /**
   * Full name of the political party
   */
  name: string;
  /**
   * Short abbreviation for the party
   */
  abbreviation: string;
  /**
   * Detailed description of the party's platform and values
   */
  description?: string | null;
  /**
   * ISO 8601 date when the party was founded
   */
  foundedAt: string;
  /**
   * Whether the party is currently active
   */
  isActive: boolean;
  /**
   * Number of members in the party
   */
  memberCount?: number;
  /**
   * ISO 8601 timestamp of party creation in system
   */
  createdAt: string;
  /**
   * ISO 8601 timestamp of last update
   */
  updatedAt: string;
  [k: string]: unknown;
}
