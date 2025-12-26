# T17 验收日志：契约测试（stream/events/citation/ragflow 映射）

- Date: 2025-12-26
- Task: T17

## 变更清单（新增测试文件）

- `packages/core/src/contracts/stream.contract.test.ts`
- `packages/core/src/contracts/events.contract.test.ts`
- `packages/core/src/contracts/citation-evidence.contract.test.ts`
- `packages/core/src/adapters/ragflow/ragflow-mapping.contract.test.ts`

## 覆盖的契约点

### 1) stream protocol

- **成功块可解析**
  - 使用 `decodeVercelAiDataStreamLinesFromText` + `parseVercelAiDataStreamDataItems` 解码 mock stream payload
  - 断言至少包含：`data-stage` / `data-step-event` / `data-citations`
- **错误块可解析为 AppError**
  - 断言 `data-app-error` 可被 `AppErrorSchema` 解析
  - 同时断言存在 data-stream 的 `error` 行（`3:`）
- **取消路径可识别**
  - 用 `toAppError(requestId, abortError)` 将 `AbortError` 映射为 `AppError.code=CANCELLED`

### 2) events schema

- **StepEvent 6 类事件 parse**
  - `step_started` / `step_progress` / `tool_called` / `tool_result` / `step_completed` / `step_failed` 全部可被 `StepEventSchema` parse
- **tool_called.argsSummary 脱敏**
  - 使用 `createToolArgsSummary()` 生成 `argsSummary`
  - 断言：敏感字段对应的 value 会变为 `"[REDACTED]"`，且原始敏感值（如 `sk-...`、`secret_value`）不会出现在摘要中

### 3) citation/evidence

- **Citation/Evidence 可 parse**
  - `CitationSchema` / `EvidenceSchema` 均可 parse
  - `projectId` 为必填字段（schema 强制）
- **projectId 隔离**
  - `verifyCitations()`：当 `citation.projectId !== ctx.projectId` 时返回失败（当前实现：`CONTRACT_VIOLATION`）
  - `getEvidenceByCitationId()`：当 ragflow citationId 中 projectId 与 ctx 不一致时返回失败（`AUTH_ERROR`）

### 4) RAGFlow 映射回归

- **mock RAGFlow 响应 -> 映射结果可 parse**
  - 用固定输入 chunk（包含 `chunk_id/content/page_number/...`）驱动 `retrieveWithRagflow()`
  - 断言输出的 `citations[0]` 可被 `CitationSchema` parse，并包含正确的 `projectId` 与 `sourceType=ragflow_chunk`
- **字段变更/缺失导致 parse 失败时测试必须失败（阻断回归）**
  - 用 `createRagflowClient({ fetchImpl })` mock 上游返回：`{ "wrong_field": [] }`
  - 断言 `client.search()` 返回 `ok=false` 且 `error.code=CONTRACT_VIOLATION`

## “字段变更导致失败”的示例说明（回归阻断）

- **场景**：RAGFlow 原本返回 `{"chunks": [...]}`，若上游改成 `{"wrong_field": [...]}`（或删除/重命名 `chunks`）
- **结果**：`RagflowSearchResponseSchema.safeParse(json)` 失败
- **表现**：`packages/core/src/adapters/ragflow/ragflow-mapping.contract.test.ts` 中的用例会失败，提示契约不满足，并返回 `AppError.code=CONTRACT_VIOLATION`

## Verification（本地可重复）

以下命令已在本地执行并通过：

- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test`

### Automation Evidence（命令输出摘要）

> 注：以下为本地执行命令的终端输出摘要（节选），用于满足“验收必须有自动化验证证据”的要求。

#### `npm run test -w @niche/core`（节选）

```text
Test Files  19 passed (19)
     Tests  79 passed | 1 skipped (80)
```

#### `npm run test`（节选）

```text
@niche/api:test:
Test Files  5 passed (5)
     Tests  20 passed (20)

@niche/web:test:
Test Files  11 passed (11)
     Tests  29 passed (29)

tests/integration:
Test Files  4 passed (4)
     Tests  8 passed (8)
```

#### `npm run build`（节选）

```text
Tasks:    3 successful, 3 total
```

#### `npm run typecheck`（节选）

```text
Tasks:    4 successful, 4 total
```

#### `npm run lint`（节选）

```text
Tasks:    3 successful, 3 total
```

## 补充改进（针对评审问题清单）

- 补充边界条件：
  - stream：空 payload、超长文本
  - events：空 argsSummary（应被 schema 拒绝）、深嵌套对象脱敏
  - citation/evidence：unavailable 允许空 locator；verifiable 必须 page/offsetStart；offsetEnd < offsetStart 失败
  - ragflow：空 chunks 数组
- 脱敏覆盖补齐：覆盖 `token/secret/password/apiKey/authorization/cookie` 等默认模式（包含大小写与嵌套场景）。

## 备注

- 本次契约测试实际落点在 `packages/core/src/**` 下，以确保 `npm run test -w @niche/core` 会默认执行；与任务描述的 `tests/contract/*` 建议路径不同，但满足“CI/本地一键运行”的 Done criteria。
