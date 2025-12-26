import { defineConfig, type UserConfigExport } from "vitest/config";
import react from "@vitejs/plugin-react";

const config = {
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environment: "jsdom"
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
} as unknown as UserConfigExport;

export default defineConfig(config);
