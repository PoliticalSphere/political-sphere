/**
 * Authentication Service
 * Handles user registration, login, and JWT token generation
 */

import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(64).toString("hex");
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || randomBytes(64).toString("hex");
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// In-memory user store (replace with DB in Phase 2)
interface User {
  id: string;
  username: string;
  passwordHash: string;
  email?: string;
  createdAt: string;
  reputation: number;
}

const users = new Map<string, User>();
const usersByUsername = new Map<string, User>();

export interface RegisterInput {
  username: string;
  password: string;
  email?: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  type: "access" | "refresh";
}

export class AuthService {
  async register(input: RegisterInput): Promise<{
    user: Omit<User, "passwordHash">;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const { username, password, email } = input;
    if (!username || username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    if (usersByUsername.has(username.toLowerCase())) {
      throw new Error("Username already exists");
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      username,
      passwordHash,
      email,
      createdAt: new Date().toISOString(),
      reputation: 0,
    };
    users.set(user.id, user);
    usersByUsername.set(username.toLowerCase(), user);
    const tokens = this.generateTokens(user);
    const { passwordHash: _ignored, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  async login(input: LoginInput): Promise<{
    user: Omit<User, "passwordHash">;
    tokens: { accessToken: string; refreshToken: string };
  }> {
    const { username, password } = input;
    const user = usersByUsername.get(username.toLowerCase());
    if (!user) {
      throw new Error("Invalid username or password");
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error("Invalid username or password");
    }
    const tokens = this.generateTokens(user);
    const { passwordHash: _ignored, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, tokens };
  }

  private generateTokens(user: User): {
    accessToken: string;
    refreshToken: string;
  } {
    const accessPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      type: "access",
    };
    const refreshPayload: TokenPayload = {
      userId: user.id,
      username: user.username,
      type: "refresh",
    };
    const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    const refreshToken = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
    });
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
      if (payload.type !== "access") {
        throw new Error("Invalid token type");
      }
      return payload;
    } catch {
      throw new Error("Invalid or expired token");
    }
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET
      ) as TokenPayload;
      if (payload.type !== "refresh") {
        throw new Error("Invalid token type");
      }
      const user = users.get(payload.userId);
      if (!user) {
        throw new Error("User not found");
      }
      const accessPayload: TokenPayload = {
        userId: user.id,
        username: user.username,
        type: "access",
      };
      const accessToken = jwt.sign(accessPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
      });
      return { accessToken };
    } catch {
      throw new Error("Invalid or expired refresh token");
    }
  }

  async getUserById(
    userId: string
  ): Promise<Omit<User, "passwordHash"> | null> {
    const user = users.get(userId);
    if (!user) {
      return null;
    }
    const { passwordHash: _ignored, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateReputation(userId: string, delta: number): Promise<void> {
    const user = users.get(userId);
    if (user) {
      user.reputation = Math.max(0, user.reputation + delta);
    }
  }
}

export const authService = new AuthService();
