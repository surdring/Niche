# Error Codes

本文件是 Study Copilot 的统一错误码表（`AppError.code`），用于快速查阅：

- **触发条件**：何时会产生该错误
- **retryable**：是否允许自动重试/降级（仅对 `retryable=true` 的错误执行 retry/fallback）
- **处理建议**：调用方/开发者应该如何处理

> 统一错误模型契约：`packages/core/src/contracts/error.ts`（`AppErrorSchema`）

## AppError 字段

- `code: string`
- `message: string`（必须包含 `requestId=...`，便于端到端排查）
- `details?: object`（结构化细节，便于 UI 展示/日志检索）
- `retryable: boolean`
- `requestId: string`

## 错误码表

| code | retryable | 触发条件（示例） | 处理建议 |
|---|---:|---|---|
| `VALIDATION_ERROR` | false | 输入参数/请求体不符合 Zod schema；上游返回无法解析的结构 | 修正输入；对开发者：补齐 schema/契约测试 |
| `AUTH_ERROR` | false | 缺少 `tenantId`/`projectId`；越权访问（跨 projectId/tenantId） | 修复鉴权上下文；对开发者：补齐权限校验与测试 |
| `RATE_LIMITED` | true/false（取决于上游映射） | 上游限流（HTTP 429 等） | 退避重试；必要时切换 provider；对开发者：保持 retryable 映射准确 |
| `UPSTREAM_TIMEOUT` | true | 上游调用超时（HTTP 504 / timeout） | 允许自动重试；可配置重试上限；重试耗尽后 fallback |
| `UPSTREAM_UNAVAILABLE` | true | 上游不可用/网络异常/未知 provider 错误 | 允许自动重试或 fallback；若持续失败提示用户稍后重试 |
| `CONTRACT_VIOLATION` | false | 契约违规：
- citations 不可验证（evidence 缺失）
- citation/projectId 不匹配
- structured output schema parse 失败且重试耗尽
- response 结构无法映射为契约 | **硬失败**（禁止 silent ignore）；对开发者：修复实现或数据；对调用方：展示可理解错误并引导用户修正 |
| `GUARDRAIL_BLOCKED` | false | guardrails 输入/输出扫描命中阻断规则 | 不自动重试；提示用户调整内容；同时记录安全事件用于审计 |
| `CANCELLED` | true | 请求被用户取消/客户端断开导致 abort | 可由用户主动重试；服务端应停止后续事件输出 |

## 与重试/降级策略的关系

- 系统只会对 **`retryable=true`** 的错误进行：
  - **重试**（`routing.retryPolicy.maxRetries`）
  - **降级**（fallback provider）
- `CONTRACT_VIOLATION` / `GUARDRAIL_BLOCKED` / `AUTH_ERROR` / `VALIDATION_ERROR` 必须是 **non-retryable**。

## 参考实现

- 统一错误模型：`packages/core/src/contracts/error.ts`
- Provider retry/fallback：`packages/core/src/providers/routed-language-model.ts`
- Guardrails 阻断：`packages/core/src/agent/guardrails.ts`
- Citation 契约校验：`packages/core/src/agent/evidence.ts`
- GraphQL error extensions：`apps/api/src/graphql.ts`
