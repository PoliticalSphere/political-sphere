/**
 * Express App (without server listen) for testing and composition
 */
import cors from "cors";
import express from "express";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./auth/auth.routes.ts";
import gameRoutes from "./game/game.routes.ts";

export const createApp = () => {
  const app = express();

  // General rate limiting - applies to all routes
  const generalLimiter = expressRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per 15 minutes
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.path === "/health", // Health checks don't count
  });
  app.use(generalLimiter);

  // Strict rate limiting for authentication routes (prevent brute force)
  const authLimiter = expressRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Only 5 attempts per 15 minutes
    message: "Too many authentication attempts, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
  });
  app.use("/auth/login", authLimiter);
  app.use("/auth/register", authLimiter);

  // Security middleware
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
      credentials: true,
    }),
  );

  // Logging
  app.use(morgan("combined"));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "api",
    });
  });

  // Routes
  app.use("/auth", authRoutes);
  app.use("/game", gameRoutes);

  // 404 handler (placed before error handler to allow custom errors)
  app.use((_req, res, next) => {
    if (res.headersSent) return next();
    res.status(404).json({ error: "Not found" });
  });

  // Error handler
  app.use(
    (err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      // Log errors only in development to prevent information leakage
      if (process.env.NODE_ENV === "development") {
        console.error("Unhandled error:", err);
      }
      res.status(500).json({
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    },
  );

  return app;
};

export const app = createApp();
