import * as fs from "node:fs";
import * as path from "node:path";

export const findWorkspaceRoot = (startDir: string): string => {
  let current = path.resolve(startDir);

  while (true) {
    const pnpmWorkspace = path.join(current, "pnpm-workspace.yaml");
    const turboConfig = path.join(current, "turbo.json");
    const gitDir = path.join(current, ".git");

    if (fs.existsSync(pnpmWorkspace) || fs.existsSync(turboConfig) || fs.existsSync(gitDir)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return startDir;
    }
    current = parent;
  }
};
