import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { z } from "zod";

const ChecklistPath = "docs/release-checklist.md" as const;

function mustInclude(text: string, needle: string): string {
  if (!text.includes(needle)) {
    throw new Error(`Contract violation: expected release checklist to include ${JSON.stringify(needle)}`);
  }
  return needle;
}

describe("docs/release-checklist.contract", () => {
  it("release checklist exists and includes required sections/items", () => {
    expect(existsSync(ChecklistPath)).toBe(true);

    const raw = readFileSync(ChecklistPath, "utf-8");
    const content = z.string().min(1).parse(raw);

    const found = {
      envSection: mustInclude(content, "## 环境变量"),
      loggingSection: mustInclude(content, "## 日志/告警"),
      rollbackSection: mustInclude(content, "## 回滚/降级策略"),
      dbBackup: mustInclude(content, "数据库备份（如适用）"),
      verificationSection: mustInclude(content, "## 验证命令"),
      ciCacheSection: mustInclude(content, "## CI 缓存策略说明"),
      ciCacheNpm: mustInclude(content, "cache: npm"),
      ciCacheLockfile: mustInclude(content, "package-lock.json"),
      preReleaseCheck: mustInclude(content, "pre-release-check.sh"),
      apiPort: mustInclude(content, "API_PORT"),
      webPort: mustInclude(content, "WEB_PORT"),
      ragflowUrl: mustInclude(content, "RAGFLOW_API_URL"),
      ragflowKey: mustInclude(content, "RAGFLOW_API_KEY"),
      providerKey: mustInclude(content, "PROVIDER_API_KEY"),
      cmdLint: mustInclude(content, "npm run lint"),
      cmdTypecheck: mustInclude(content, "npm run typecheck"),
      cmdTest: mustInclude(content, "npm run test"),
      cmdBuild: mustInclude(content, "npm run build")
    };

    const FoundSchema = z
      .object({
        envSection: z.string().min(1),
        loggingSection: z.string().min(1),
        rollbackSection: z.string().min(1),
        dbBackup: z.string().min(1),
        verificationSection: z.string().min(1),
        ciCacheSection: z.string().min(1),
        ciCacheNpm: z.string().min(1),
        ciCacheLockfile: z.string().min(1),
        preReleaseCheck: z.string().min(1),
        apiPort: z.string().min(1),
        webPort: z.string().min(1),
        ragflowUrl: z.string().min(1),
        ragflowKey: z.string().min(1),
        providerKey: z.string().min(1),
        cmdLint: z.string().min(1),
        cmdTypecheck: z.string().min(1),
        cmdTest: z.string().min(1),
        cmdBuild: z.string().min(1)
      })
      .strict();

    FoundSchema.parse(found);
  });
});
