# T15 - 降级/重试/错误模型统一 + Guardrails 接入（Phase 2）

## 目标
- 统一错误模型：GraphQL / REST / Streaming 的错误都使用 `AppError`（Zod 可 parse），并强制包含 `requestId`。
- Provider 降级/重试：对 **retryable=true** 的错误做有限重试，并在主 provider 失败时自动 fallback。
- Guardrails：输入/输出扫描，触发时硬阻断（`GUARDRAIL_BLOCKED` 且 `retryable=false`），并记录可观测的安全事件。
- 契约违规：不可映射 citation / 跨 projectId / schema parse 失败等必须硬失败为 `CONTRACT_VIOLATION`。

## 错误模型（AppError）

### Schema
- `code: string`
- `message: string`（必须包含 `requestId=...`，便于日志检索与端到端关联）
- `details?: object`
- `retryable: boolean`
- `requestId: string`

### 统一处理原则
- 对外返回（GraphQL/REST/streaming error block）必须能被 `AppErrorSchema` 解析。
- **只有 retryable 的错误**才允许重试/降级；契约违规和 guardrail 阻断必须是 non-retryable。

## 错误码表（当前实现）

| code | retryable | 典型触发 | 处理建议 |
|---|---:|---|---|
| `VALIDATION_ERROR` | false | Zod 解析失败 / 参数不合法 | 修正输入后重试 |
| `AUTH_ERROR` | false | 缺 tenantId/projectId；projectId 不匹配 | 修正上下文或权限 |
| `RATE_LIMITED` | true/false（视上游映射） | 上游限流 | 退避后重试/切换 provider |
| `UPSTREAM_TIMEOUT` | true | 上游超时 | 重试或 fallback |
| `UPSTREAM_UNAVAILABLE` | true | 上游不可用/网络错误/未知 provider 错误 | 重试或 fallback |
| `CONTRACT_VIOLATION` | false | citations 不可验证/跨 projectId；schema parse 失败 | 修复实现或数据契约，不应自动重试 |
| `GUARDRAIL_BLOCKED` | false | 输入/输出触发 guardrails | 调整内容，必要时人工介入 |
| `CANCELLED` | true | 客户端取消/AbortError | 可由用户主动重试 |

## GraphQL 错误输出约定
- 服务器返回的 `errors[]` 中：
  - `errors[i].message`：对用户可读，且包含 `requestId=...`
  - `errors[i].extensions.appError`：结构化 `AppError`（权威来源）

客户端解析策略：优先读取 `errors[].extensions.appError`，否则 fallback 到拼接 `message` 并包装为 `UPSTREAM_UNAVAILABLE`。

## Provider 重试/降级策略

### 配置
- `routing.retryPolicy.maxRetries: number`
  - 对每个候选 route（primary + fallbacks）生效。
  - 仅当错误 `retryable=true` 时重试。

### 行为
- 对候选 provider 依次尝试。
- 每个 provider 最多尝试 `1 + maxRetries` 次。
- 若该 provider 的尝试失败且不再应重试，则切换到下一个候选 provider。
- 所有 provider 均失败时，抛出 `UPSTREAM_UNAVAILABLE`（并带 requestId）。

## Guardrails 与安全事件

### 阻断规则
- 输入阶段与输出阶段都可触发。
- 触发后返回 `GUARDRAIL_BLOCKED`，且 `retryable=false`。

### 安全事件（SecurityEvent）
- 事件类型：`guardrail_blocked`
- 事件仅记录 **脱敏信息**：
  - `stage`（input/output/tool_call）
  - `reason`
  - `contentLength`
  - 以及 request/tenant/project/task/step 关联字段（如可得）

## 回归用例清单（自动化）

### GraphQL
- GraphQL 发生错误时，`errors[].extensions.appError` 必须存在并可被 `AppErrorSchema` parse。

### Provider Retry/Fallback
- retry 成功：primary 第一次失败、第二次成功，不应触发 fallback。
- retry 耗尽：primary 连续失败到上限后触发 fallback。
- non-retryable：primary 返回 non-retryable `AppError` 时，不应重试，直接 fallback。

### Guardrails
- 输入阻断：返回 `GUARDRAIL_BLOCKED` 且 `retryable=false`，并产生 `guardrail_blocked` 安全事件。

### Contract Violation
- citations：
  - citation.projectId 与 ctx.projectId 不一致 => `CONTRACT_VIOLATION`
  - citations 不符合 `CitationSchema` => `CONTRACT_VIOLATION`
- structured output：schema 校验失败且超出重试次数 => `CONTRACT_VIOLATION`

## 相关实现文件（索引）

### Core
- `packages/core/src/contracts/error.ts`
- `packages/core/src/contracts/graphql.ts`
- `packages/core/src/contracts/events.ts`
- `packages/core/src/providers/routed-language-model.ts`
- `packages/core/src/providers/router.ts`
- `packages/core/src/providers/provider-routing.test.ts`
- `packages/core/src/agent/guardrails.ts`
- `packages/core/src/agent/agent-proxy.ts`
- `packages/core/src/agent/agent-proxy.test.ts`

### API
- `apps/api/src/graphql.ts`
- `apps/api/src/graphql.test.ts`

### Web
- `apps/web/src/lib/api/http.ts`

## 验证命令
- `npm run build`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
