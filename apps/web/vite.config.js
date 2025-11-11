import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  root: ".", // Current directory (apps/web)
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173, // Standard Vite port
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:3001", // Proxy to API on 3001
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
