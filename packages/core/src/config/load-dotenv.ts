import * as fs from "node:fs";
import * as path from "node:path";
import * as dotenv from "dotenv";

import { findWorkspaceRoot } from "./workspace-root";

export const loadDotenvIfPresent = (cwd: string): void => {
  const root = findWorkspaceRoot(cwd);
  const envPath = path.join(root, ".env");

  if (!fs.existsSync(envPath)) {
    return;
  }

  dotenv.config({ path: envPath });
};
