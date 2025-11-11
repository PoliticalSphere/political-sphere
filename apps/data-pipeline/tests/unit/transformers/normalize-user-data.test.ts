/**
 * Unit tests for NormalizeUserDataTransformer
 *
 * @module tests/unit/transformers/normalize-user-data
 */

import { describe, it, expect, beforeEach } from "vitest";

import { NormalizeUserDataTransformer } from "../../../src/transformers/normalize-user-data.js";

describe("NormalizeUserDataTransformer", () => {
  let transformer: NormalizeUserDataTransformer;

  beforeEach(() => {
    transformer = new NormalizeUserDataTransformer();
  });

  describe("transform", () => {
    it("should transform valid user data correctly", () => {
      const rawData = {
        id: "123",
        email: "test@example.com",
        name: "John Doe",
        createdAt: "2023-01-01T00:00:00Z",
        metadata: { role: "user", preferences: { theme: "dark" } },
      };

      const result = transformer.transform(rawData);

      expect(result).toEqual({
        id: "123",
        email: "test@example.com",
        name: "John Doe",
        createdAt: new Date("2023-01-01T00:00:00Z"),
        metadata: { role: "user", preferences: { theme: "dark" } },
      });
    });

    it("should handle alternative field names", () => {
      const rawData = {
        userId: "456",
        email: "jane@example.com",
        username: "Jane Smith",
      };

      const result = transformer.transform(rawData);

      expect(result.id).toBe("456");
      expect(result.name).toBe("Jane Smith");
    });

    it("should normalize email to lowercase and trim", () => {
      const rawData = {
        id: "789",
        email: "  TEST@EXAMPLE.COM  ",
        name: "Test User",
      };

      const result = transformer.transform(rawData);

      expect(result.email).toBe("test@example.com");
    });

    it("should trim name field", () => {
      const rawData = {
        id: "101",
        email: "trim@example.com",
        name: "  Trimmed Name  ",
      };

      const result = transformer.transform(rawData);

      expect(result.name).toBe("Trimmed Name");
    });

    it("should use current date if createdAt is invalid", () => {
      const rawData = {
        id: "102",
        email: "date@example.com",
        name: "Date Test",
        createdAt: "invalid-date",
      };

      const result = transformer.transform(rawData);

      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it("should handle missing optional metadata", () => {
      const rawData = {
        id: "103",
        email: "no-metadata@example.com",
        name: "No Metadata",
      };

      const result = transformer.transform(rawData);

      expect(result.metadata).toEqual({});
    });

    it("should throw error for invalid input data", () => {
      expect(() => transformer.transform(null)).toThrow("Invalid user data format");
      expect(() => transformer.transform("string")).toThrow("Invalid user data format");
      expect(() => transformer.transform({})).toThrow("Invalid user data format");
    });

    it("should throw error for missing required fields after validation", () => {
      const rawData = {
        // Missing id, email, name
        createdAt: "2023-01-01T00:00:00Z",
      };

      expect(() => transformer.transform(rawData)).toThrow();
    });
  });

  describe("transformBatch", () => {
    it("should transform multiple records correctly", () => {
      const rawDataArray = [
        { id: "1", email: "user1@example.com", name: "User 1" },
        { id: "2", email: "user2@example.com", name: "User 2" },
      ];

      const results = transformer.transformBatch(rawDataArray);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe("1");
      expect(results[1].id).toBe("2");
    });

    it("should handle empty array", () => {
      const results = transformer.transformBatch([]);

      expect(results).toEqual([]);
    });

    it("should throw error if any record is invalid", () => {
      const rawDataArray = [
        { id: "1", email: "user1@example.com", name: "User 1" },
        null, // Invalid
      ];

      expect(() => transformer.transformBatch(rawDataArray)).toThrow();
    });
  });

  describe("isValidRawData", () => {
    it("should return true for valid objects", () => {
      expect(transformer["isValidRawData"]({ id: "1" })).toBe(true);
    });

    it("should return false for null or non-objects", () => {
      expect(transformer["isValidRawData"](null)).toBe(false);
      expect(transformer["isValidRawData"]("string")).toBe(false);
      expect(transformer["isValidRawData"](123)).toBe(false);
    });
  });
});
