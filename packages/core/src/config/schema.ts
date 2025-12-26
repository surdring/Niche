import { z } from "zod";

export const AppEnvSchema = z.object({
  /**
   * Runtime environment.
   *
   * - development: Local development.
   * - test: Unit/integration tests.
   * - production: Production runtime.
   */
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  /**
   * Port for the API server (@niche/api).
   */
  API_PORT: z.coerce.number().int().positive().default(3001),
  /**
   * Port for the web dev server (@niche/web).
   */
  WEB_PORT: z.coerce.number().int().positive().default(5173)
});

export type AppEnv = z.infer<typeof AppEnvSchema>;
