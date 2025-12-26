# T7 验收日志 - Agent Proxy 最小实现

- Date: 2025-12-22
- Task: T7 Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链
- Scope: packages/core（Agent Proxy 核心代码 + 测试）

## 变更概述

- 新增 `@niche/core` 的 Agent 相关模块导出：`packages/core/src/agent/*`。
- 落地内容覆盖：
  - runtime config 构建（基于 TemplateDefinition/TemplateSelection）
  - `wrapLanguageModel` 中间件链（顺序执行 + 允许短路）
  - guardrails hook 接入点（输入/输出阶段）+ 可观测 step 事件
  - 引用合规：citations 必须能通过 EvidenceProvider 验证；不可映射/跨 projectId -> `CONTRACT_VIOLATION`
  - structured output：`generateObject` 重试 + 结构化错误；并提供 `streamObjectWithRetries`（fallback 到 generateObject）

## 关键文件

- `packages/core/src/agent/runtime-config.ts`
- `packages/core/src/agent/wrap-language-model.ts`
- `packages/core/src/agent/guardrails.ts`
- `packages/core/src/agent/evidence.ts`
- `packages/core/src/agent/structured-output.ts`
- `packages/core/src/agent/agent-proxy.ts`

## 覆盖的自动化验证

- `wrapLanguageModel` onion 顺序不变性（属性测试风格循环 50 次）
  - `packages/core/src/agent/wrap-language-model.test.ts`
- structured output schema 不匹配触发重试；超限返回结构化错误（`CONTRACT_VIOLATION`）
  - `packages/core/src/agent/structured-output.test.ts`
- guardrails 可稳定阻断，并通过 StepEvent 可观测（包含 requestId，error.details.reason）
  - `packages/core/src/agent/agent-proxy.test.ts`
- 引用合规：
  - citations -> EvidenceProvider 可返回证据则通过
  - citations 不可映射（evidence 返回 undefined）则返回 `CONTRACT_VIOLATION`
  - `packages/core/src/agent/agent-proxy.test.ts`

## 验证命令与结果

- `npm run test` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅

## 备注

- 当前 Agent Proxy 为最小实现：
  - 工具调用阶段（`tool_call`）guardrails hook 已预留类型/阶段枚举，但未实现真实 tool executor；后续任务可接入真实工具调用链并补事件。
  - citations 目前在 structured output 对象中约定读取 `citations` 字段并进行验证；后续可在契约中进一步明确 output schema 的 citations 位置或抽象解析器。
