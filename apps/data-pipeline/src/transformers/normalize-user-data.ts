/**
 * Normalize User Data Transformer
 *
 * Normalizes user data to a consistent format, handling different
 * input schemas and data quality issues with robust validation and security.
 *
 * @module transformers/normalize-user-data
 */

import { z } from "zod";

// Constants for field names and limits
const FIELD_NAMES = {
  ID: "id",
  USER_ID: "userId",
  EMAIL: "email",
  NAME: "name",
  USERNAME: "username",
  CREATED_AT: "createdAt",
  METADATA: "metadata",
} as const;

const LIMITS = {
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
  MAX_ID_LENGTH: 50,
} as const;

// Custom error classes for better error handling
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class TransformationError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = "TransformationError";
  }
}

// Zod schema for input validation
// Note: Email validation is lenient - we trim/lowercase in normalizeEmail
const RawUserDataSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  email: z.string(),
  name: z.string().optional(),
  username: z.string().optional(),
  createdAt: z.string().optional(),
  metadata: z.any().optional(),
});

type RawUserData = z.infer<typeof RawUserDataSchema>;

export interface UserData {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  metadata: Record<string, unknown>;
}

export class NormalizeUserDataTransformer {
  /**
   * Transform raw user data to normalized format with validation and sanitization
   *
   * @param rawData - The raw input data to transform
   * @returns Normalized UserData object
   * @throws {ValidationError} If input validation fails
   * @throws {TransformationError} If transformation fails
   *
   * @example
   * ```typescript
   * const transformer = new NormalizeUserDataTransformer();
   * const result = transformer.transform({
   *   id: '123',
   *   email: 'user@example.com',
   *   name: 'John Doe'
   * });
   * ```
   */
  transform(rawData: unknown): UserData {
    try {
      // Validate input structure
      if (!this.isValidRawData(rawData)) {
        throw new ValidationError("Invalid user data format");
      }

      // Validate with Zod schema
      const validatedData = RawUserDataSchema.parse(rawData);

      // Manual validation for required field combinations
      if (!validatedData[FIELD_NAMES.ID] && !validatedData[FIELD_NAMES.USER_ID]) {
        throw new ValidationError("Either id or userId must be provided");
      }
      if (!validatedData[FIELD_NAMES.NAME] && !validatedData[FIELD_NAMES.USERNAME]) {
        throw new ValidationError("Either name or username must be provided");
      }

      // Sanitize and normalize fields
      const normalizedData: UserData = {
        id: this.normalizeId(validatedData),
        email: this.normalizeEmail(validatedData[FIELD_NAMES.EMAIL]),
        name: this.normalizeName(validatedData),
        createdAt: this.normalizeCreatedAt(validatedData[FIELD_NAMES.CREATED_AT]),
        metadata: this.sanitizeMetadata(validatedData[FIELD_NAMES.METADATA] || {}),
      };

      return normalizedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Re-throw as Invalid user data format for consistency with tests
        throw new ValidationError("Invalid user data format");
      }
      if (error instanceof ValidationError || error instanceof TransformationError) {
        throw error;
      }
      throw new TransformationError("Unexpected error during transformation", error as Error);
    }
  }

  /**
   * Validate raw data structure (basic type check)
   */
  private isValidRawData(data: unknown): data is Record<string, unknown> {
    return typeof data === "object" && data !== null;
  }

  /**
   * Normalize ID field with fallback to userId
   */
  private normalizeId(data: RawUserData): string {
    return String(data[FIELD_NAMES.ID] || data[FIELD_NAMES.USER_ID]).trim();
  }

  /**
   * Normalize email: lowercase, trim, validate format
   */
  private normalizeEmail(email: string): string {
    const normalized = email.toLowerCase().trim();
    // Validate email format after normalization
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      throw new ValidationError("Invalid email format", "email");
    }
    return normalized;
  }

  /**
   * Normalize name field with fallback to username
   */
  private normalizeName(data: RawUserData): string {
    return String(data[FIELD_NAMES.NAME] || data[FIELD_NAMES.USERNAME]).trim();
  }

  /**
   * Normalize createdAt to Date object with fallback
   */
  private normalizeCreatedAt(createdAt?: string): Date {
    if (createdAt) {
      try {
        return new Date(createdAt);
      } catch {
        // Invalid date string, fall back to current date
      }
    }
    return new Date();
  }

  /**
   * Sanitize metadata by removing potentially dangerous content
   * This is a basic implementation; enhance based on specific security requirements
   */
  private sanitizeMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(metadata)) {
      // Remove keys that might be dangerous (basic filtering)
      if (typeof key === "string" && !key.includes("<script") && !key.includes("javascript:")) {
        // For string values, basic sanitization
        if (typeof value === "string") {
          sanitized[key] = value.replace(/<[^>]*>/g, "").trim(); // Remove HTML tags
        } else if (typeof value === "object" && value !== null) {
          // Recursively sanitize nested objects (basic)
          sanitized[key] = this.sanitizeMetadata(value as Record<string, unknown>);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }

  /**
   * Batch transform multiple user records
   *
   * @param rawDataArray - Array of raw data objects
   * @returns Array of normalized UserData objects
   * @throws {ValidationError|TransformationError} If any record fails validation/transformation
   */
  transformBatch(rawDataArray: unknown[]): UserData[] {
    return rawDataArray.map((data, index) => {
      try {
        return this.transform(data);
      } catch (error) {
        throw new TransformationError(
          `Failed to transform record at index ${index}`,
          error as Error,
        );
      }
    });
  }
}
