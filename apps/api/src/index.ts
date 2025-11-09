/**
 * API Server
 * Main Express application with auth and game routes
 */
// Load environment variables from .env if present (local dev convenience)
import "dotenv/config";

import { app } from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
  console.log(`🎮 Game endpoints: http://localhost:${PORT}/game`);

  if (!process.env.JWT_SECRET) {
    // eslint-disable-next-line no-console
    console.warn(
      "⚠️  WARNING: Using auto-generated JWT_SECRET. Set JWT_SECRET in production!"
    );
  }
});

export default app;
