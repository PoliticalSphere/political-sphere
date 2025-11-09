/**
 * Secure Path Utilities for ESM Modules
 *
 * Prevents path traversal attacks by validating and sanitizing file paths
 * before use in filesystem operations.
 *
 * This is the ESM version of libs/shared/src/path-security.js
 */

import path from "path";
import { fileURLToPath } from "url";

/**
 * Validates that a filename doesn't contain path traversal sequences
 * @param {string} filename - The filename to validate
 * @returns {string} Sanitized filename
 * @throws {Error} If filename contains invalid characters or traversal attempts
 */
export function validateFilename(filename) {
  if (!filename || typeof filename !== "string") {
    throw new Error("Filename must be a non-empty string");
  }

  // Remove any path components - only allow the basename
  const basename = path.basename(filename);

  // Check for path traversal attempts
  if (filename !== basename) {
    throw new Error("Filename cannot contain path separators");
  }

  // Block null bytes
  if (basename.includes("\0")) {
    throw new Error("Filename cannot contain null bytes");
  }

  // Validate filename characters (alphanumeric, dash, underscore, dot, space)
  // Allow spaces in filenames
  if (!/^[a-zA-Z0-9_. -]+$/.test(basename)) {
    throw new Error("Filename contains invalid characters");
  }

  return basename;
}

/**
 * Validates a relative path from trusted sources (like git)
 * Allows forward slashes but prevents traversal
 * @param {string} relativePath - The relative path to validate
 * @returns {string} Validated path
 * @throws {Error} If path contains traversal attempts
 */
export function validateRelativePath(relativePath) {
  if (!relativePath || typeof relativePath !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  // Block null bytes
  if (relativePath.includes("\0")) {
    throw new Error("Path cannot contain null bytes");
  }

  // Block absolute paths
  if (path.isAbsolute(relativePath)) {
    throw new Error("Path must be relative, not absolute");
  }

  // Block parent directory references - check before normalization
  const normalized = path.normalize(relativePath);

  // Block parent directory references in normalized path too
  if (relativePath.includes("..") || normalized.includes("..")) {
    throw new Error("Path cannot contain parent directory references (..)");
  }

  // Ensure normalization didn't introduce traversal
  if (normalized.includes("..") || path.isAbsolute(normalized)) {
    throw new Error("Path normalization resulted in traversal attempt");
  }

  return normalized;
}

/**
 * Safely joins a base directory with a user-provided path
 * Ensures the resulting path stays within the base directory
 * @param {string} baseDir - The trusted base directory
 * @param {string} userInput - User-provided path component
 * @param {Object} options - Options
 * @param {boolean} options.allowSubdirs - Allow subdirectories in userInput (default: false)
 * @returns {string} Safe resolved path
 * @throws {Error} If path would escape the base directory
 */
export function safeJoin(baseDir, userInput, options = {}) {
  if (!baseDir || typeof baseDir !== "string") {
    throw new Error("Base directory must be a non-empty string");
  }

  if (!userInput || typeof userInput !== "string") {
    throw new Error("User input must be a non-empty string");
  }

  // Sanitize based on whether subdirectories are allowed
  const sanitized = options.allowSubdirs
    ? validateRelativePath(userInput)
    : validateFilename(userInput);

  // Join the paths
  const joined = path.join(baseDir, sanitized);

  // Resolve to absolute path
  const resolved = path.resolve(joined);
  const resolvedBase = path.resolve(baseDir);

  // Ensure the resolved path is within the base directory
  if (!resolved.startsWith(resolvedBase + path.sep) && resolved !== resolvedBase) {
    throw new Error("Path traversal detected: resulting path is outside base directory");
  }

  return resolved;
}

/**
 * Validates a path from a trusted source (like git output)
 * More permissive than user input, but still prevents traversal
 * @param {string} trustedPath - Path from a trusted source
 * @param {string} baseDir - Base directory to validate against (optional)
 * @returns {string} Validated path
 * @throws {Error} If path contains obvious traversal attempts
 */
export function validateTrustedPath(trustedPath, baseDir = null) {
  if (!trustedPath || typeof trustedPath !== "string") {
    throw new Error("Path must be a non-empty string");
  }

  // Even trusted paths shouldn't have null bytes
  if (trustedPath.includes("\0")) {
    throw new Error("Path cannot contain null bytes");
  }

  // Block obvious traversal attempts
  const pathParts = trustedPath.split(/[/\\]/);
  for (const part of pathParts) {
    if (part === "..") {
      throw new Error("Path cannot contain parent directory references");
    }
  }

  // If base directory provided, ensure path resolves within it
  if (baseDir) {
    const resolved = path.resolve(baseDir, trustedPath);
    const resolvedBase = path.resolve(baseDir);

    if (!resolved.startsWith(resolvedBase + path.sep) && resolved !== resolvedBase) {
      throw new Error("Path resolves outside base directory");
    }

    return resolved;
  }

  return trustedPath;
}

/**
 * Checks if a path is within a base directory (without throwing)
 * @param {string} baseDir - The base directory
 * @param {string} testPath - The path to test
 * @returns {boolean} True if testPath is within baseDir
 */
export function isPathWithinBase(baseDir, testPath) {
  try {
    const resolvedBase = path.resolve(baseDir);
    const resolvedTest = path.resolve(testPath);

    return resolvedTest.startsWith(resolvedBase + path.sep) || resolvedTest === resolvedBase;
  } catch {
    return false;
  }
}

/**
 * Gets the current directory name for ES modules (equivalent to __dirname)
 * @param {string} importMetaUrl - import.meta.url
 * @returns {string} Directory name
 */
export function getDirname(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}
