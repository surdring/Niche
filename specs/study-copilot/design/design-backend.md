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

## Response Caching (R13)

### Cache Key
- key 必须 deterministic，且包含：
  - tenantId / projectId
  - templateRef
  - 输入 messages 摘要
  - 检索摘要（当前实现基于检索输入：providerId + query）
  - modelInfo（**必须包含 modelId**；否则为避免跨模型错误命中，应禁用缓存）

### Semantics
- 缓存以“请求输入”为准：相同输入 => 相同 key。
- 检索结果（citations）会随索引/数据变化而变化；当前实现不会把检索输出纳入 key（因为需要在命中缓存时跳过检索）。
  - 这意味着在 TTL 未过期时可能返回“旧的 citations/文本”。

### Invalidation
- 当前仅支持 TTL 过期与 LRU 淘汰。
- 不支持主动失效（例如模板更新、数据更新时按 tag/pattern 批量清除）。
  - 作为已知限制，建议在后续任务引入显式 invalidation API 与更强的版本/etag 机制。

### Observability
- 目前以结构化日志/事件记录 cache hit/miss/store。
- 聚合指标（命中率、缓存大小、淘汰次数等）建议后续接入 Prometheus/Grafana。

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
