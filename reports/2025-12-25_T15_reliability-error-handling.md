# 验收日志：T15 - 降级/重试/错误模型统一 + Guardrails 接入

- 日期：2025-12-25
- 任务：T15
- 目标：统一 AppError 错误模型（GraphQL/REST/stream），实现 provider 重试/降级策略，接入 guardrails 阻断与安全事件记录，并补齐回归测试与文档。

## 变更摘要

### 1) GraphQL 错误统一（extensions.appError）
- API：`apps/api/src/graphql.ts`
  - 增加 Mercurius `errorFormatter`，确保 `errors[].extensions.appError` 为可 parse 的 `AppError`。
  - resolver 中将裸 `Error` 替换为结构化 `AppError`（如 AUTH_ERROR / VALIDATION_ERROR / CONTRACT_VIOLATION）。
- Core 合同：`packages/core/src/contracts/graphql.ts`
  - `GraphqlErrorSchema` 支持 `extensions.appError`。
- Web 解析：`apps/web/src/lib/api/http.ts`
  - `parseAppErrorResponse` 优先使用 `errors[].extensions.appError`，否则 fallback 用 message 拼接并包装为 `UPSTREAM_UNAVAILABLE`。
- 测试：`apps/api/src/graphql.test.ts`
  - 新增用例验证 GraphQL errors 中存在可 parse 的 `extensions.appError`，且包含 `requestId`。

### 2) Provider 重试/降级策略（仅 retryable）
- Core：`packages/core/src/providers/routed-language-model.ts`
  - 使用 `routing.retryPolicy.maxRetries` 对每个候选 provider 执行有限重试。
  - 仅当 `appError.retryable=true` 时重试；否则直接进入 fallback。
- 测试：`packages/core/src/providers/provider-routing.test.ts`
  - 覆盖：retry 成功不 fallback、retry 耗尽后 fallback、non-retryable 不重试直接 fallback。

### 3) Guardrails 阻断与安全事件
- Core：`packages/core/src/contracts/events.ts`
  - 新增 `SecurityEventSchema`（`guardrail_blocked`）。
- Core：`packages/core/src/agent/agent-proxy.ts`
  - guardrails 输入/输出阻断时 emit `guardrail_blocked` 安全事件（脱敏：stage/reason/contentLength）。
- 测试：`packages/core/src/agent/agent-proxy.test.ts`
  - 断言 guardrails 阻断返回 `GUARDRAIL_BLOCKED` 且会记录 `guardrail_blocked` 安全事件。

### 4) 契约违规（CONTRACT_VIOLATION）硬失败回归
- 测试：`packages/core/src/agent/agent-proxy.test.ts`
  - citation.projectId 与 ctx.projectId 不一致 => `CONTRACT_VIOLATION`
  - citations 不符合 `CitationSchema` => `CONTRACT_VIOLATION`

### 5) 文档
- 新增：`specs/study-copilot/t15-reliability-error-handling.md`
  - 错误码表
  - GraphQL error 约定（extensions.appError）
  - retry/fallback 策略
  - guardrails 安全事件
  - 回归用例清单

### 6) 补齐集成测试（tests/integration）
- 新增：`tests/integration/retry-and-fallback.test.ts`
  - provider 超时/不可用触发 fallback
  - all providers fail 时抛出统一 `AppError`（含 requestId）
- 新增：`tests/integration/guardrails.test.ts`
  - guardrails 阻断 -> `GUARDRAIL_BLOCKED` 且 `retryable=false`
  - 大内容（>10KB）扫描 smoke/perf-like（宽松上限，避免卡死）
- 新增：`tests/integration/contract-violation.test.ts`
  - 不可验证 citation -> `CONTRACT_VIOLATION`（含 requestId）
- 根脚本：`package.json`
  - `npm run test` 追加执行 `vitest run tests/integration`，确保集成测试在 CI/本地默认执行。

### 7) 文档补齐（问题清单要求）
- 新增：`docs/ERROR_CODES.md`
  - 错误码表 + 触发条件 + retryable + 处理建议。
- 更新：`packages/core/src/providers/README.md`
  - 补充 `retryPolicy.maxRetries` 配置示例与 retryable 语义说明。

### 8) 额外边界覆盖与可读性改进
- 测试增强：`packages/core/src/providers/provider-routing.test.ts`
  - 覆盖：all providers fail / maxAttempts=0 schema 拒绝 / skipProviderIds 覆盖全部 provider。
- 错误消息可读性：`packages/core/src/contracts/error.ts`
  - `createAppError` 支持 `message` 为空时按 `code` 生成默认英文 message，并自动附加 requestId。
  - 测试：`packages/core/src/contracts/contracts.test.ts` 新增覆盖。

## 验证（自动化命令与结果）
以下命令均在仓库根目录执行并通过：
- `npm run build` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅

## 风险与后续
- 当前 security event 仅在 core 层通过 sink 发出，API 侧尚未持久化（如需落库/审计管道，可在后续任务扩展）。
- GraphQL errorFormatter 与 web 端解析已对齐；后续若新增 error extension 字段需保持向后兼容。
