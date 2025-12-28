import { existsSync, readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { z } from "zod";

const RunbookPath = "docs/runbook.md" as const;
const RootPackageJsonPath = "package.json" as const;
const ApiPackageJsonPath = "apps/api/package.json" as const;
const WebPackageJsonPath = "apps/web/package.json" as const;

function mustInclude(text: string, needle: string): string {
  if (!text.includes(needle)) {
    throw new Error(`Contract violation: expected runbook to include ${JSON.stringify(needle)}`);
  }
  return needle;
}

function mustHaveScript(scripts: Record<string, string>, scriptName: string, pkgLabel: string): string {
  if (!(scriptName in scripts)) {
    throw new Error(`Contract violation: expected ${pkgLabel} to define script ${JSON.stringify(scriptName)}`);
  }
  return scriptName;
}

const PackageJsonSchema = z
  .object({
    scripts: z.record(z.string(), z.string()).optional()
  })
  .passthrough();

describe("docs/runbook.contract", () => {
  it("runbook exists and includes required sections/keywords", () => {
    expect(existsSync(RunbookPath)).toBe(true);

    const raw = readFileSync(RunbookPath, "utf-8");
    const content = z.string().min(1).parse(raw);

    expect(existsSync(RootPackageJsonPath)).toBe(true);
    expect(existsSync(ApiPackageJsonPath)).toBe(true);
    expect(existsSync(WebPackageJsonPath)).toBe(true);

    const rootPkg = PackageJsonSchema.parse(JSON.parse(readFileSync(RootPackageJsonPath, "utf-8")) as unknown);
    const apiPkg = PackageJsonSchema.parse(JSON.parse(readFileSync(ApiPackageJsonPath, "utf-8")) as unknown);
    const webPkg = PackageJsonSchema.parse(JSON.parse(readFileSync(WebPackageJsonPath, "utf-8")) as unknown);

    const rootScripts = z.record(z.string(), z.string()).parse(rootPkg.scripts ?? {});
    const apiScripts = z.record(z.string(), z.string()).parse(apiPkg.scripts ?? {});
    const webScripts = z.record(z.string(), z.string()).parse(webPkg.scripts ?? {});

    const found = {
      title: mustInclude(content, "# Study Copilot 运行手册"),

      sectionLocalStart: mustInclude(content, "## 1. 本地启动"),
      sectionInstall: mustInclude(content, "### 1.1 安装依赖"),
      sectionEnv: mustInclude(content, "### 1.2 配置环境变量"),
      sectionApi: mustInclude(content, "### 1.3 启动 API 服务"),
      sectionWeb: mustInclude(content, "### 1.4 启动 Web 服务"),

      sectionCommonIssues: mustInclude(content, "## 2. 常见故障"),
      issueProviderTimeout: mustInclude(content, "### 2.1 Provider 超时"),
      issueRagflowUnavailable: mustInclude(content, "### 2.2 RAGFlow 不可用"),
      issueCitations: mustInclude(content, "### 2.3 Citations 降级/unavailable"),

      sectionTroubleshooting: mustInclude(content, "## 3. 排查指引"),
      troubleshootByRequestId: mustInclude(content, "### 3.1 按 requestId 排查"),
      troubleshootLogCmd: mustInclude(content, "### 3.2 日志查询命令"),
      troubleshootEndToEnd: mustInclude(content, "UI -> API -> logs"),

      crossPlatformLabel: mustInclude(content, "Linux/macOS (bash/zsh)"),
      crossPlatformEnvCopyCmd: mustInclude(content, "cp .env.example .env"),
      crossPlatformLogTeeCmd: mustInclude(content, "| tee logs/api.log"),
      crossPlatformLogGrepCmd: mustInclude(content, "grep -n \"$rid\" logs/api.log"),

      cmdApiDev: mustInclude(content, "npm run dev -w @niche/api"),
      cmdWebDev: mustInclude(content, "npm run dev -w @niche/web"),
      rootScriptBuild: mustHaveScript(rootScripts, "build", RootPackageJsonPath),
      rootScriptTypecheck: mustHaveScript(rootScripts, "typecheck", RootPackageJsonPath),
      rootScriptLint: mustHaveScript(rootScripts, "lint", RootPackageJsonPath),
      rootScriptTest: mustHaveScript(rootScripts, "test", RootPackageJsonPath),
      apiScriptDev: mustHaveScript(apiScripts, "dev", ApiPackageJsonPath),
      webScriptDev: mustHaveScript(webScripts, "dev", WebPackageJsonPath),

      keywordProvider: mustInclude(content, "provider"),
      keywordRagflow: mustInclude(content, "ragflow"),
      keywordCitations: mustInclude(content, "citations")
    };

    const FoundSchema = z
      .object({
        title: z.string().min(1),

        sectionLocalStart: z.string().min(1),
        sectionInstall: z.string().min(1),
        sectionEnv: z.string().min(1),
        sectionApi: z.string().min(1),
        sectionWeb: z.string().min(1),

        sectionCommonIssues: z.string().min(1),
        issueProviderTimeout: z.string().min(1),
        issueRagflowUnavailable: z.string().min(1),
        issueCitations: z.string().min(1),

        sectionTroubleshooting: z.string().min(1),
        troubleshootByRequestId: z.string().min(1),
        troubleshootLogCmd: z.string().min(1),
        troubleshootEndToEnd: z.string().min(1),

        crossPlatformLabel: z.string().min(1),
        crossPlatformEnvCopyCmd: z.string().min(1),
        crossPlatformLogTeeCmd: z.string().min(1),
        crossPlatformLogGrepCmd: z.string().min(1),

        cmdApiDev: z.string().min(1),
        cmdWebDev: z.string().min(1),
        rootScriptBuild: z.string().min(1),
        rootScriptTypecheck: z.string().min(1),
        rootScriptLint: z.string().min(1),
        rootScriptTest: z.string().min(1),
        apiScriptDev: z.string().min(1),
        webScriptDev: z.string().min(1),

        keywordProvider: z.string().min(1),
        keywordRagflow: z.string().min(1),
        keywordCitations: z.string().min(1)
      })
      .strict();

    FoundSchema.parse(found);
  });
});
