# Study Copilot - Design (Agent)

## Summary
本文件描述 Agent Proxy 与工作流编排：模板解析、工具注册、步骤事件、结构化输出、guardrails 与可扩展工作流策略。

## Requirements Mapping
- R1 场景模板运行时契约
- R2 wrapLanguageModel 中间件
- R5 step events
- R6 结构化输出
- R7 guardrails
- R15 多代理工作流引擎

## Architecture / Components
- Scenario Template Runtime
  - prompt
  - tools
  - output schema (Zod)
  - workflow policy (maxSteps/retry/fallback)
  - citation policy
  - guardrails policy
- Agent Proxy
  - step runner
  - tool executor
  - event emitter

## Key Flows
### Flow: 模板解析与注入
- templateId -> load template definition
- templateDefinition -> Zod 校验
- 生成 runtime config

### Flow: 工作流执行
- 每个 step：
  - 生成计划/调用工具/生成回答
  - 发出 step events
  - 执行 guardrails
  - 需要结构化时走 streamObject/generateObject

### Flow: Self-correction
- schema 校验失败 -> 触发修复重试
- 超出重试次数 -> 结构化错误返回

## Interfaces / Contracts
- 引用 `design-contracts.md`

## NFR
- 合规：禁止伪造引用，Honor Code 提示策略。
- 可控：maxSteps、取消传播、失败可恢复。

## Observability
- 每个 step/tool/model call 都要带 requestId/stepId。

## Testing Strategy
- 模板校验：Zod schema。
- workflow：maxSteps/重试/回退路径。
- guardrails：注入/越狱/伪造引用。

## Open Questions
- 工作流 DSL/配置格式采用 JSON Schema 还是 Zod 直出？
- step events 的粒度：以“工具调用”为 step 还是“阶段（plan/retrieve/answer）”为 step？
