# T13 验收日志：导出（Markdown/Obsidian 友好格式）

- 任务：T13
- 日期：2025-12-24
- 范围：Phase 1 核心闭环

## 结论
已实现 deterministic 的 Markdown 导出（正文 + 引用列表 + Obsidian 友好 YAML 元数据块），并在 Web 侧提供预览 + Copy/Download。单元测试与 e2e-ish 流程测试覆盖，且已通过仓库验证命令：`npm run build` / `npm run typecheck` / `npm run lint` / `npm run test`。

## 导出格式（Markdown 示例）
```markdown
# 任务结果

这是回答的正文内容...

## 引用

1. [c_xyz] 来源：document, 项目：proj_123, 位置：page 5, offset 100-200
2. [c_abc] 来源：ragflow_chunk, 项目：proj_123, 位置：section 2.3

---

<!-- Metadata (Obsidian friendly) -->

```yaml
citations:
  -
    citationId: "c_abc"
    degradedReason: null
    documentId: null
    locator:
      section: "2.3"
    projectId: "proj_123"
    snippet: null
    sourceType: "ragflow_chunk"
    status: "unavailable"
  -
    citationId: "c_xyz"
    degradedReason: null
    documentId: null
    locator:
      offsetEnd: 200
      offsetStart: 100
      page: 5
    projectId: "proj_123"
    snippet: null
    sourceType: "document"
    status: "verifiable"
meta:
  exportVersion: "v1"
  requestId: null
  sessionId: null
  taskId: null
  templateRef: null
```
```

说明：
- `## 引用` 为人类可读引用列表。
- `<!-- Metadata (Obsidian friendly) -->` 下方的 ` ```yaml ` 块为可机器解析的引用元数据（用于 citationId -> Evidence API 等追溯）。
- 输出包含 citationId / projectId / locator 等关键字段，且按 citationId 排序保证 deterministic。

## Formatter 输入/输出契约说明
### 输入：`MarkdownExportInput`
实现位置：`packages/core/src/export/markdown.ts`

- 必填字段：
  - `output: string`
  - `citations: Citation[]`（以 `@niche/core/contracts` 的 `CitationSchema` 为准）
- 可选字段：
  - `title?: string`
  - `taskId?: string`
  - `sessionId?: string`
  - `requestId?: string`
  - `templateRef?: TemplateRef`

校验：
- 入参通过 `MarkdownExportInputSchema`（Zod）校验。
- 校验失败会抛出英文错误：`Invalid markdown export input`。

### 输出：`string`
- 必然包含：
  - 标题：`# {title}`
  - 正文（`output`，空白则归一为 `(no output)`）
  - 引用块：`## 引用` + 列表（或 `(no citations)`）
  - YAML 元数据块：包含 `meta` 与 `citations`

deterministic 规则：
- `citations` 会被排序：先按 `citationId` 字典序，再按 `locator` 的稳定序列化结果。
- YAML 输出：对象 key 按字典序输出；`undefined` 归一为 `null`，避免不稳定。

## 实现变更摘要（关键文件）
- `packages/core/src/export/markdown.ts`
  - 新增 `exportToMarkdown(input: unknown): string`（Zod 校验 + deterministic 输出 + Obsidian YAML block）。
- `packages/core/src/export/markdown.test.ts`
  - 单元：deterministic（不同输入顺序输出一致）
  - 单元：快照（输出格式与 YAML 元数据结构稳定）
- `packages/core/package.json`
  - 新增子路径导出：`./export/markdown`（避免 Web 侧误引入 node-only exports）。
- `apps/web/src/lib/export.ts`
  - 改为 `import { exportToMarkdown } from "@niche/core/export/markdown"`。
- `apps/web/src/lib/export.test.ts`
  - 更新断言，验证导出包含 `## 引用`、YAML block、`citationId/projectId/locator`。
- `apps/web/src/app.e2e-ish.test.tsx`
  - 新增 e2e-ish 用例：导出预览与 Copy 内容包含正文 + 引用 + YAML 元数据。

## 测试文件清单与断言点（至少 3 条）
- `packages/core/src/export/markdown.test.ts`
  - 断言 1：相同语义输入（citations 顺序不同）导出字符串完全一致（deterministic）。
  - 断言 2：导出包含 `citationId`、`projectId`、`locator.page/offsetStart/offsetEnd` 且输出与 inline snapshot 一致。
- `apps/web/src/lib/export.test.ts`
  - 断言 3：Web format 导出包含 `## 引用`、`citationId`、`projectId`、`offsetStart`，并包含 ` ```yaml ` 元数据块。
- `apps/web/src/app.e2e-ish.test.tsx`
  - 断言 4（流程）：点击 Run 后 export preview 出现，且 Copy 写入剪贴板的内容包含正文 + 引用元数据。

## 关于 E2E 测试文件（为何未实现 tests/e2e/export.test.ts）
本仓库当前未引入独立的 E2E runner（例如 Playwright/Cypress），也未建立 root 级 `tests/e2e` 目录与对应脚本。
因此导出流程的端到端覆盖采用了 **Vitest e2e-ish** 方式实现：

- 覆盖位置：`apps/web/src/app.e2e-ish.test.tsx` 中的用例 `export: preview and copy include output and citation metadata`
- 覆盖断言：
  - 导出预览中包含正文输出
  - 导出预览中包含 `## 引用`、`citationId/projectId/locator` 等关键元数据
  - 点击 Copy 后写入剪贴板的内容与预览一致

后续若引入 Playwright/Cypress，可将该用例平移至 `tests/e2e/export.test.ts` 并增加“下载文件落盘”的更完整断言。

## Verification（已执行）
- `npm run typecheck` ✅
- `npm run build` ✅
- `npm run lint` ✅
- `npm run test` ✅

## 备注/已知风险
- 当前导出 YAML 格式是“子集 YAML”（不覆盖所有 YAML 特性），但对我们需要的对象/数组/标量稳定输出足够。
- 若未来需要更复杂 YAML（多行字符串等），建议引入标准 YAML 库并固定其序列化选项以保证 deterministic。
