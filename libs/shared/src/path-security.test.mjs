#!/usr/bin/env node

/**
 * Security Test Suite for path-security.mjs
 *
 * Tests path traversal prevention and input validation
 */

import assert from "node:assert";
import path from "node:path";
import { describe, it } from "node:test";
import {
  isPathWithinBase,
  safeJoin,
  validateFilename,
  validateRelativePath,
  validateTrustedPath,
} from "./path-security.mjs";

describe("Path Security Library Tests", () => {
  describe("validateFilename", () => {
    it("should accept valid filenames", () => {
      assert.strictEqual(validateFilename("file.txt"), "file.txt");
      assert.strictEqual(validateFilename("test-file_123.json"), "test-file_123.json");
      assert.strictEqual(validateFilename(".gitignore"), ".gitignore");
    });

    it("should reject filenames with path separators", () => {
      // These will be caught by the path separator check
      assert.throws(() => validateFilename("dir/file.txt"), /path separators|invalid characters/);
      assert.throws(() => validateFilename("../file.txt"), /path separators|invalid characters/);
      assert.throws(() => validateFilename("..\\file.txt"), /path separators|invalid characters/);
    });
    it("should reject filenames with null bytes", () => {
      assert.throws(() => validateFilename("file\0.txt"), /null bytes/);
    });

    it("should reject filenames with invalid characters", () => {
      assert.throws(() => validateFilename("file<script>.txt"), /invalid characters/);
      assert.throws(() => validateFilename("file;rm-rf.txt"), /invalid characters/);
    });

    it("should reject empty or non-string input", () => {
      assert.throws(() => validateFilename(""), /non-empty string/);
      assert.throws(() => validateFilename(null), /non-empty string/);
      assert.throws(() => validateFilename(undefined), /non-empty string/);
    });
  });

  describe("validateRelativePath", () => {
    it("should accept valid relative paths", () => {
      assert.strictEqual(
        validateRelativePath("sub/dir/file.txt"),
        path.normalize("sub/dir/file.txt"),
      );
      assert.strictEqual(validateRelativePath("src/index.js"), path.normalize("src/index.js"));
    });

    it("should reject absolute paths", () => {
      // On Windows, C:\ might not be detected by path.isAbsolute in all contexts
      // Test with Unix-style absolute path which is more reliable
      if (process.platform !== "win32") {
        assert.throws(() => validateRelativePath("/etc/passwd"), /must be relative/);
      }
      // This should always work as it contains ..
      assert.throws(() => validateRelativePath("../etc/passwd"), /parent directory/);
    });

    it("should reject parent directory references", () => {
      assert.throws(() => validateRelativePath("../etc/passwd"), /parent directory/);
      assert.throws(() => validateRelativePath("sub/../../escape"), /parent directory/);
    });

    it("should reject paths with null bytes", () => {
      assert.throws(() => validateRelativePath("file\0/path"), /null bytes/);
    });

    it("should normalize paths", () => {
      const result = validateRelativePath("sub//dir/./file.txt");
      assert.ok(!result.includes("//"));
      assert.ok(!result.includes("/."));
    });
  });

  describe("safeJoin", () => {
    it("should safely join base and filename", () => {
      const result = safeJoin("/base", "file.txt");
      assert.strictEqual(result, path.resolve("/base/file.txt"));
    });

    it("should safely join base and subdirectories with allowSubdirs", () => {
      const result = safeJoin("/base", "sub/dir/file.txt", {
        allowSubdirs: true,
      });
      assert.strictEqual(result, path.resolve("/base/sub/dir/file.txt"));
    });

    it("should reject paths that escape base directory", () => {
      assert.throws(() => safeJoin("/base", "../escape"), /path separators|outside base/);
    });

    it("should reject paths with traversal attempts", () => {
      assert.throws(
        () => safeJoin("/base", "../../etc/passwd", { allowSubdirs: true }),
        /outside base|parent directory/,
      );
    });

    it("should require non-empty inputs", () => {
      assert.throws(() => safeJoin("", "file.txt"), /non-empty string/);
      assert.throws(() => safeJoin("/base", ""), /non-empty string/);
    });

    it("should ensure result is within base directory", () => {
      const base = "/base";
      const result = safeJoin(base, "file.txt");
      assert.ok(result.startsWith(path.resolve(base)));
    });
  });

  describe("validateTrustedPath", () => {
    it("should accept valid paths from trusted sources", () => {
      const result = validateTrustedPath("src/index.js", "/project");
      assert.strictEqual(result, path.resolve("/project/src/index.js"));
    });

    it("should reject parent directory references", () => {
      assert.throws(() => validateTrustedPath("../etc/passwd"), /parent directory/);
      assert.throws(() => validateTrustedPath("sub/../../../escape", "/base"), /parent directory/);
    });

    it("should reject null bytes", () => {
      assert.throws(() => validateTrustedPath("file\0/path"), /null bytes/);
    });

    it("should validate against base directory when provided", () => {
      const result = validateTrustedPath("sub/file.txt", "/base");
      assert.ok(result.startsWith(path.resolve("/base")));
    });

    it("should allow paths without base directory", () => {
      const result = validateTrustedPath("src/index.js");
      assert.strictEqual(result, "src/index.js");
    });
  });

  describe("isPathWithinBase", () => {
    it("should return true for paths within base", () => {
      assert.strictEqual(isPathWithinBase("/base", "/base/sub/file.txt"), true);
      assert.strictEqual(isPathWithinBase("/base", "/base"), true);
    });

    it("should return false for paths outside base", () => {
      assert.strictEqual(isPathWithinBase("/base", "/other/file.txt"), false);
      assert.strictEqual(isPathWithinBase("/base", "/base-other/file.txt"), false);
    });

    it("should handle errors gracefully", () => {
      assert.strictEqual(isPathWithinBase(null, "/some/path"), false);
    });
  });

  describe("Real-world attack scenarios", () => {
    it("should prevent classic ../ traversal", () => {
      assert.throws(
        () =>
          safeJoin("/var/www/uploads", "../../../etc/passwd", {
            allowSubdirs: true,
          }),
        /outside base|parent directory/,
      );
    });

    it("should prevent URL-encoded traversal", () => {
      // Note: URL decoding should happen before validation
      const decoded = decodeURIComponent("%2e%2e%2f%2e%2e%2fetc%2fpasswd");
      assert.throws(() => validateRelativePath(decoded), /parent directory/);
    });

    it("should prevent null byte injection", () => {
      assert.throws(() => safeJoin("/base", "file.txt\0.jpg"), /null bytes/);
    });

    it("should prevent mixed separator attacks", () => {
      // Backslashes become invalid characters after basename
      assert.throws(() => validateFilename("..\\..\\windows\\system32"), /invalid characters/);
    });

    it("should prevent absolute path injection", () => {
      assert.throws(
        () => safeJoin("/uploads", "/etc/passwd", { allowSubdirs: true }),
        /must be relative/,
      );
    });
  });

  describe("Edge cases", () => {
    it("should handle paths with spaces", () => {
      const result = validateFilename("file name.txt");
      assert.ok(result.includes(" "));
    });

    it("should handle very long paths", () => {
      const longPath = `${"a/".repeat(100)}file.txt`;
      const result = validateRelativePath(longPath);
      assert.ok(result.length > 0);
    });

    it("should handle unicode filenames", () => {
      // Unicode characters are not in the allowed set
      assert.throws(() => validateFilename("文件.txt"), /invalid characters/);
    });

    it("should handle case sensitivity correctly", () => {
      const result1 = validateFilename("File.TXT");
      const result2 = validateFilename("file.txt");
      assert.strictEqual(result1, "File.TXT");
      assert.strictEqual(result2, "file.txt");
    });
  });
});

console.log(`\n✅ All path security tests defined. Run with: node --test path-security.test.mjs\n`);
