/**
 * API Server
 * Main Express application with auth and game routes
 */
// Load environment variables from .env if present (local dev convenience)
import "dotenv/config";

import { app } from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/auth`);
  console.log(`🎮 Game endpoints: http://localhost:${PORT}/game`);
});

export default app;
