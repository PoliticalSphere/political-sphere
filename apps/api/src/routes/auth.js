import bcrypt from "bcrypt";
import express from "express";
import jwt from "jsonwebtoken";

import logger from "../logger.js";
import { getDatabase } from "../modules/stores/index.ts";

const router = express.Router();

function getUserStore() {
  return getDatabase().users;
}

// POST /register - Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email, and password are required",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const store = getUserStore();
    const user = await store.create({
      username,
      email,
      passwordHash,
      role: "VIEWER",
    });

    logger.info("User registered successfully", { userId: user.id, username });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);

    // Handle duplicate user
    if (error.message?.includes("UNIQUE constraint")) {
      return res.status(409).json({
        success: false,
        error: "User already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: "Registration failed",
    });
  }
});

// POST /login - Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Email and password required",
      });
    }

    // Get user with password hash for authentication
    const store = getUserStore();
    const user = await store.getUserForAuth?.(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || "default-secret",
      { expiresIn: "7d" },
    );

    logger.info("User logged in", { userId: user.id, username: user.username });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

// POST /logout - Logout user
router.post("/logout", (_req, res) => {
  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
