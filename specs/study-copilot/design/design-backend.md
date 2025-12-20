# Study Copilot - Design (Backend)

## Summary
本文件描述后端（Fastify + GraphQL/REST）架构与集成点：Vercel AI SDK、RAGFlow、鉴权隔离、可观测性、可靠性与缓存。

## Requirements Mapping
- R2 中间件（wrapLanguageModel）
- R4 流式响应协议
- R9 会话管理能力
- R10 API 服务层
- R11 可观测性与监控
- R12 降级策略
- R14 多模型路由系统
- R20 快速搭建 RAG 管道
- R21 引用证据
- R41 Project/Workspace 隔离（projectId）
- R26 预埋多租户隔离（tenantId）
- R13 响应缓存

## Architecture / Components
- Fastify server
  - GraphQL (Mercurius 或等价)
  - REST endpoints（stream/upload/evidence）
- AI Orchestration Adapters
  - Provider adapter
  - RAGFlow adapter
- Storage
  - PostgreSQL（可选）
  - Redis（可选）

## Key Flows
### Flow: GraphQL createTask
- 校验 tenantId/projectId
- 校验 templateId/templateDefinition
- 创建 Task/Session

### Flow: Streaming
- 建立 stream 连接
- 执行 Agent/模型调用
- 输出 data stream protocol + 错误块
- 客户端断开/取消：取消底层模型请求

### Flow: Evidence
- 根据 citationId 获取证据
- 校验 projectId 隔离

## Interfaces / Contracts
- 引用 `design-contracts.md`

## NFR (Security/Performance/Reliability)
- 鉴权与隔离：tenantId/projectId 默认强制。
- 可靠性：超时、重试、熔断、provider 故障转移。
- 性能：TTFT、并发、缓存。

## Observability
- OpenTelemetry：
  - request span
  - model call span（含 token usage）
  - tool call span
- 结构化日志：按 requestId 聚合。

## Testing Strategy
- 契约测试：
  - data stream protocol
  - error model
  - RAGFlow 字段映射
- 集成测试：
  - createTask -> stream -> evidence

## Open Questions
- tasks/session 的最小持久化模型如何定义？
- 引用证据是否允许直接存 snippet（与合规/版权相关）？
