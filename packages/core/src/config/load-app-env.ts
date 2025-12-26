import { AppEnvSchema, type AppEnv } from "./schema";
import { loadDotenvIfPresent } from "./load-dotenv";

export const loadAppEnv = (): AppEnv => {
  loadDotenvIfPresent(process.cwd());

  const parsed = AppEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue: { path: Array<string | number>; message: string }) => {
        return `${issue.path.join(".") || "(root)"}: ${issue.message}`;
      })
      .join("; ");

    throw new Error(`Invalid environment variables: ${issues}`);
  }

  return parsed.data;
};
