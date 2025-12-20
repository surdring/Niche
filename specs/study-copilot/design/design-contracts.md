# Study Copilot - Design Contracts

## Summary
本文档集中定义跨 UI/Frontend/Backend/Agent 共享的契约：GraphQL/REST、事件流、错误模型与引用模型。

## Requirements Mapping
- R4 流式响应协议
- R5 中间步骤事件流
- R6 结构化输出
- R10 API 服务层
- R21 引用溯源与证据链
- R41 Project/Workspace 隔离
- R26 tenantId 预埋

## Contract Principles
- 结构化、可版本化：所有对外契约需具备版本策略或向后兼容策略。
- 可观测：契约字段需支持 requestId/traceId 关联。
- 可扩展：允许新增字段而不破坏旧客户端。

## GraphQL (Main API)
### Core Entities (Draft)
- `Template`
  - `id`, `version`, `name`, `description`, `definition`, `capabilities`
- `Project`
  - `id`, `tenantId`, `name`, `createdAt`
- `Task`
  - `id`, `projectId`, `templateRef`, `status`, `createdAt`, `updatedAt`
- `Session`
  - `id`, `taskId`, `messages`, `state`, `createdAt`

### Key Operations (Draft)
- Query
  - `templates` / `template(id)`
  - `projects` / `project(id)`
  - `tasks(projectId)` / `task(id)`
- Mutation
  - `createTask(input: { projectId, templateId?, templateDefinition? })`
  - `cancelTask(taskId)`
- Subscription (Optional)
  - `taskEvents(taskId)` 或等价事件通道

### Context Injection
- request context MUST 包含：`requestId`, `tenantId`, `projectId?`。
- `tenantId`/`projectId` 默认强制校验并用于数据隔离过滤。

## REST / HTTP
### Streaming Endpoint (Draft)
- `POST /api/stream`
  - input: `{ taskId | sessionId, messages, templateRef, options }`
  - output: data stream protocol

### Upload Endpoint (Draft)
- `POST /api/upload`
  - 支持大文件；可能触发异步解析任务（backlog）。

### Evidence Endpoint (Draft)
- `GET /api/evidence?citationId=...`
  - 返回证据展示所需信息（片段/来源/定位元数据/可复制摘录等）。

## Streaming Protocol
- 采用 Vercel AI Data Stream Protocol。
- 必须包含：
  - 错误块定义（可被前端识别）
  - 阶段/步骤标记（用于 UI 分段）
  - 可取消语义（客户端断开/用户取消 -> server 取消模型请求）

## Step Events Schema (Draft)
事件用于表达 Agent 多步过程（可与 streaming 同通道或独立通道）。

- `StepEvent`
  - `type`: `step_started` | `step_progress` | `tool_called` | `tool_result` | `step_completed` | `step_failed`
  - `taskId`, `stepId`, `stepName`
  - `timestamp`
  - `requestId`
  - `payload`

约束：
- `tool_called` 的参数摘要必须脱敏。
- `step_failed` 必须包含结构化错误（见 Error Model）。

## Error Model
- `AppError`
  - `code`: string
  - `message`: string
  - `details?`: object
  - `retryable`: boolean
  - `requestId`: string

错误分类建议：
- `VALIDATION_ERROR`（Zod/输入校验）
- `AUTH_ERROR`
- `RATE_LIMITED`
- `UPSTREAM_TIMEOUT`
- `UPSTREAM_UNAVAILABLE`
- `CONTRACT_VIOLATION`（RAGFlow/外部契约不满足）
- `GUARDRAIL_BLOCKED`

## Citation / Evidence Model
- `Citation`
  - `citationId`
  - `sourceType`: `ragflow_chunk` | `document` | `web`
  - `documentId?`
  - `projectId`
  - `locator`: `{ page?, offsetStart?, offsetEnd?, section?, bbox? }`
  - `snippet?`（可选，若允许直接返回证据片段）
  - `status`: `verifiable` | `unavailable` | `degraded`
  - `degradedReason?`

约束：
- citation MUST 可映射回真实检索/深读结果。
- `projectId` 必须一致，跨 Project 需显式标注与二次确认策略。

## Versioning
- GraphQL：通过 schema 演进（新增字段向后兼容）。
- REST：路径或 header 版本化（如 `/api/v1/...`）。
- Events：`payload` 内包含 `schemaVersion`（如需要）。
