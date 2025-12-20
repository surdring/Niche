# Study Copilot - Design Overview

## Summary
本设计总览用于将 Study Copilot 的实现拆分为多个设计文档（UI / Frontend / Backend / Agent / Contracts），并提供端到端架构视图与关键流程。

- 目标：在不做多租户配额（R? backlog）的前提下，跑通 Study Copilot 的“模板启动 → 工作流编排 → 检索/生成 → 流式呈现 → 引用溯源 → 导出”的闭环。
- 范围：以 `requirements.md` 中的 `R#` 为准。

## Requirements Mapping
- R1 场景模板选择与运行时契约 -> `design/design-agent.md`, `design/design-contracts.md`
- R2 wrapLanguageModel 中间件 -> `design/design-backend.md`, `design/design-agent.md`
- R3 UI 与交互体验 -> `design/design-ui.md`, `design/design-frontend.md`
- R4 标准化流式响应 -> `design/design-contracts.md`, `design/design-backend.md`, `design/design-frontend.md`
- R5 以事件流展示 Agent 中间步骤 -> `design/design-contracts.md`, `design/design-agent.md`, `design/design-frontend.md`
- R6 结构化输出 -> `design/design-contracts.md`, `design/design-backend.md`, `design/design-agent.md`
- R7 内置安全护栏 -> `design/design-agent.md`, `design/design-backend.md`
- R9 会话管理能力 -> `design/design-backend.md`
- R10 API 服务层 -> `design/design-contracts.md`, `design/design-backend.md`
- R11 可观测性与监控 -> `design/design-backend.md`
- R12 降级策略 -> `design/design-backend.md`
- R13 响应缓存 -> `design/design-backend.md`
- R14 多模型路由系统 -> `design/design-backend.md`
- R15 多代理工作流引擎 -> `design/design-agent.md`
- R20 快速搭建 RAG 管道 -> `design/design-backend.md`
- R21 引用溯源与证据链 -> `design/design-contracts.md`, `design/design-backend.md`, `design/design-ui.md`
- R26 预埋多租户隔离（tenantId） -> `design/design-contracts.md`, `design/design-backend.md`
- R41 Project/Workspace 隔离 -> `design/design-contracts.md`, `design/design-backend.md`

## Architecture / Components
- UI
  - 展示模板、任务、流式输出、中间步骤、引用证据与导出。
- Frontend
  - GraphQL client + 事件/流式消费层；负责将后端的 stream/events 渲染为“阶段/步骤”的 UI 语义。
- Backend (Fastify)
  - GraphQL 主干（任务/项目/模板/会话等）；REST/流式端点用于 streaming 与上传。
  - 集成 Vercel AI SDK Core：streamText/streamObject/generateObject。
  - 集成 RAGFlow：摄入/检索/引用字段映射。
- Agent Layer
  - Agent Proxy 负责：模板解析、工具注册、工作流编排、guardrails、结构化输出、step events。
- External
  - RAGFlow、模型 provider（云端/本地）、可选 DB/Redis、观测系统（OTel/Prometheus）。

## Key Flows (Sequence)
### Flow 1: 选择模板并启动任务
- 用户在 UI 选择 `templateId` 或提交 `templateDefinition`（R1）
- Frontend 调用 GraphQL 创建任务/会话（R10/R9）
- Backend 解析模板并构造运行时配置（R1）
- Agent Proxy 启动工作流，开始输出 events/stream（R5/R4）

### Flow 2: Agent 工作流 + 检索增强 + 结构化输出
- Agent step: 生成检索 query / 调用检索工具（R20）
- Backend 调用 RAGFlow 返回 chunks + citations（R20/R21）
- Agent 生成回答：
  - 自由文本：streamText
  - 结构化输出：streamObject/generateObject（R6）
- Guardrails 在输入/输出阶段执行并产生日志/事件（R7）

### Flow 3: UI 呈现 steps + 引用点击证据
- Frontend 消费 stream/events，将其映射为“阶段/步骤”的 UI（R3/R5/R4）
- UI 展示引用，点击引用触发获取证据 API（R21）
- 若证据不可用，UI 显示降级原因（R3/R21）

### Flow 4: 导出
- UI 将最终内容导出 Markdown/Obsidian，保留引用元数据（R3/R21）

## NFR (Security/Performance/Reliability)
- 安全与合规：禁止伪造引用、禁止绕过 Honor Code，记录安全事件（R7）。
- 隔离：请求级上下文注入 `tenantId`/`projectId` 并默认生效（R26/R41）。
- 可靠性：provider 故障转移、超时、限流与熔断（R12）。
- 性能：TTFT、流式取消、缓存策略（R4/R13）。

## Observability
- 统一 requestId 贯穿前后端/模型调用/工具调用。
- 记录 token 用量、延迟（含 TTFT）、错误、缓存命中、provider 切换事件（R11）。

## Testing Strategy
- 契约测试：stream protocol、events schema、引用模型、RAGFlow 字段映射（R4/R5/R21/R20）。
- 端到端：模板启动 → 运行 → 引用点击 → 导出（R1/R3/R21）。
- Guardrails：注入/越狱/伪造引用用例（R7）。

## Open Questions
- GraphQL 的任务/项目/模板核心 schema 最小集合是什么？
- “step events” 与“data stream protocol”是统一通道还是双通道？
- 引用证据 API 需要返回“原文片段”还是“可定位元数据 + 拉取指令”？
