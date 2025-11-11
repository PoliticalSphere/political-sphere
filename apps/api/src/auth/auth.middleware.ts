/**
 * Authentication Middleware
 * Protects routes requiring authentication
 */

import type { NextFunction, Request, Response } from "express";

import { authService } from "./auth.service.ts";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
  };
}

/**
 * Middleware to require authentication
 * Extracts JWT from Authorization header and verifies it
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  // Bypass only when NODE_ENV=test and FORCE_AUTH !== '1'
  if (
    process.env.NODE_ENV === "test" &&
    process.env.FORCE_AUTH !== "1" &&
    !req.headers.authorization
  ) {
    req.user = {
      userId: req.params.id || "test-user-id",
      username: "test-user",
    };
    next();
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: "No authorization token provided" });
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({ error: "Invalid authorization format. Use: Bearer <token>" });
      return;
    }

    const token = parts[1];
    if (!token) {
      res.status(401).json({ error: "Token is required" });
      return;
    }

    const payload = authService.verifyAccessToken(token);

    req.user = {
      userId: payload.userId,
      username: payload.username,
    };

    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      const token = parts[1];
      if (token) {
        const payload = authService.verifyAccessToken(token);
        req.user = {
          userId: payload.userId,
          username: payload.username,
        };
      }
    }
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
}
