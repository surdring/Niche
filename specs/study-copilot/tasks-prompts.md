# tasks-prompts.md

> 本文件仅借鉴任务提示词的组织方式（排版结构），不引入其他文档的内容规范；一切需求/设计/任务口径以 `specs/study-copilot/` 下文档为准。
> 
> 本文件基于 `specs/study-copilot/tasks.md` + `specs/study-copilot/design/` 系列设计文档整理为 **中文任务提示词**。
>
> 使用方式：执行某个任务 `T#` 时，把对应任务的 Prompt（代码块）整体复制到对话中，并补充你本地的工程现状（目录结构、已有包名、是否已初始化 monorepo 等）。

---

## 范围与关键决策（当前迭代）

- **主目标**：跑通 Study Copilot MVP 闭环：模板启动 → createTask → stream/events → citations → evidence → UI 展示 → 导出。
- **RAG（检索）**：RAGFlow 作为外部知识库服务（摄入/检索/引用溯源）。回答生成通过 Vercel AI SDK 调用模型完成。
- **多租户/配额**：当前迭代不实现配额与计费（R27 backlog），但必须预埋并贯穿 `tenantId` / `projectId`（R26/R41）。

## Conventions（约定）

1. **文档权威来源**
   - 需求：`specs/study-copilot/requirements.md`
   - 任务：`specs/study-copilot/tasks.md`
   - 设计：
     - `specs/study-copilot/design-overview.md`
     - `specs/study-copilot/design/design-ui.md`
     - `specs/study-copilot/design/design-frontend.md`
     - `specs/study-copilot/design/design-backend.md`
     - `specs/study-copilot/design/design-agent.md`
     - `specs/study-copilot/design/design-contracts.md`

2. **工程结构（建议对齐仓库规范）**
   - 若当前仓库尚未建立 monorepo，则在 `T1` 中创建并对齐：
     - `packages/core`：核心编排、Agent、契约类型
     - `apps/api`：Fastify + GraphQL/REST/Streaming
     - `apps/web`：UI（模板选择、运行、step events、引用、导出）
     - `tests/{unit,property,integration,e2e}`：测试

3. **默认验证命令（若任务未单独指定）**
   - 运行仓库现有的 lint/test 命令集合。
   - 若仓库使用 pnpm，可参考：`pnpm -r lint`、`pnpm -r test`。

4. **全局编码规范（强制）**
   - TypeScript Strict（**禁止 `any`**）
   - 所有输入/输出/配置/工具参数必须用 **Zod** 校验
   - 错误消息（message）必须用 **英文**（便于日志搜索）；注释可中文

5. **自动化验收原则（强制）**
   - 每个任务的 Verification 优先写成**可自动化断言**（单元/集成/契约测试），避免仅“手工目测”。
   - 契约相关（GraphQL/REST/Events/Streaming/Citation/Error）一律以 `specs/study-copilot/design/design-contracts.md` 为准，并使用 Zod schema 做断言。

---

## Phase 0：准备/基建（T1-T4）

### Task T1：工程初始化与开发工作流

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T1：工程初始化与开发工作流。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- Zod 覆盖所有 schema（输入/输出/配置）。
- 错误 message 使用英文。
- 测试框架遵循仓库现状；若仓库尚未建立测试框架，可选用 Vitest（并在需要时使用属性测试库）。

# References
- tasks: specs/study-copilot/tasks.md (T1)
- coding standards: （可选）若仓库内已有统一编码规范文件则遵循；本任务以 specs/study-copilot 为准

# Execution Plan
1) 建立 monorepo（若尚未存在）
- Files:
  - pnpm workspace / turbo（如采用）
  - root package.json / tsconfig / eslint / test runner config
  - packages/core, apps/api, apps/web 的最小目录
- Requirements:
  - 能一条命令启动 dev（API 与 Web 可先占位）
  - 能一条命令运行 lint/test

2) 建立环境变量模板与配置加载入口
- Files:
  - .env.example（或等价）
  - packages/core/src/config/*（若采用）
- Verification:
  - 运行仓库现有 lint 命令（例如 `pnpm -r lint`）
  - 运行仓库现有 test 命令（例如 `pnpm -r test`）

# Checklist
- [x] monorepo/目录结构就绪
- [x] lint/test/build 脚本可运行
- [x] .env.example 存在且字段最小可用

# Output
- 输出你新增/修改的文件清单与关键设计决策（为何如此组织目录/脚本）。
- 输出你实际使用的验证命令（lint/test/dev 启动命令）。
```

### Task T2：共享类型与契约基线（GraphQL/REST/Events）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T2：共享类型与契约基线（GraphQL/REST/Events）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有契约必须以 Zod Schema 为单一事实源（z.infer）。

# References
- contracts: specs/study-copilot/design/design-contracts.md
- requirements: specs/study-copilot/requirements.md (R4, R5, R6, R10, R21)
- tasks: specs/study-copilot/tasks.md (T2)

# Execution Plan
1) 落地共享契约类型
- Scope:
  - Streaming 协议相关：error block、阶段标记
  - StepEvent：type/stepId/requestId/payload
  - Citation/Evidence：citationId/sourceType/locator/status
- Files（建议）:
  - packages/core/src/contracts/{stream.ts, events.ts, citation.ts, error.ts}

2) 编写最小契约解析/序列化工具
- Scope:
  - stream parsing/encoding（按设计选择）
  - events payload 脱敏辅助

# Verification
- 至少 1 个单元测试验证：schema 能解析/拒绝非法输入。

# Checklist
- [x] contracts 以 Zod schema 形式定义
- [x] 前后端可共享/复用（至少路径规划明确）

# Output
- 输出：契约文件路径 + 核心 schema 片段说明 + 测试用例。
```

### Task T3：可观测性基线（requestId 贯穿 + 结构化日志）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T3：可观测性基线。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T3)

# Execution Plan
1) 定义 requestId 生成与透传策略
- Scope:
  - API 入站生成/读取 requestId
  - 贯穿到：GraphQL resolver、stream handler、Agent step events

2) 结构化日志字段规范
- 必含：requestId, tenantId, projectId(可选), taskId/sessionId(可选)

# Verification
- 自动化断言（至少一条）：
  - 触发一次最小请求（可 mock），断言日志输出包含同一个 `requestId`，且该 `requestId` 同时出现在：入站日志、至少一个模型/工具/事件输出（按当前实现路径选择其一）。

# Checklist
- [x] 定义 requestId 生成与透传策略
- [x] 结构化日志字段规范落地（requestId/tenantId/projectId/taskId/sessionId）
- [x] 自动化断言：同一 requestId 同时出现在入站日志与至少一个事件/输出中

# Output
- 输出：实现方式 + 示例日志行（脱敏）。
```

### Task T4：隔离上下文（tenantId/projectId 注入与强制校验）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T4：隔离上下文。

# References
- requirements: specs/study-copilot/requirements.md (R26, R41)
- contracts: specs/study-copilot/design/design-contracts.md (Context Injection)

# Execution Plan
1) 定义 RequestContext
- Fields: requestId, tenantId, projectId?

2) 在 API 层强制校验与注入
- GraphQL：resolver 上下文
- REST：/api/stream、/api/evidence、/api/upload（若存在）

3) 默认隔离策略
- 所有读写必须带 tenantId 过滤
- 所有检索与 evidence 必须带 projectId 且默认限制

# Verification
- 自动化断言（至少覆盖以下 2 类）：
  - 缺少 `tenantId` 的请求：返回 `AUTH_ERROR`（或等价授权错误）且包含 `requestId`。
  - 缺少 `projectId` 的检索/证据请求：返回 `AUTH_ERROR`（或等价隔离错误）且包含 `requestId`。

# Checklist
- [x] 定义 RequestContext（requestId/tenantId/projectId?）
- [x] API 层强制注入与校验（REST: /api/stream、/api/evidence、/api/upload）
- [x] 自动化断言：缺 tenantId -> AUTH_ERROR + requestId
- [x] 自动化断言：缺 projectId（检索/证据）-> AUTH_ERROR + requestId

# Output
- 输出：上下文类型定义 + 关键拦截点（中间件/插件）列表。
```

---

## Phase 1：核心闭环（T5-T13）

### Task T5：模板定义 Schema 与校验（含结构化输出 Schema）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
目标：完成 T5（模板定义 Schema 与校验）。

# References
- requirements: specs/study-copilot/requirements.md (R1, R6)
- design: specs/study-copilot/design/design-agent.md

# Execution Plan
1) 定义 TemplateDefinition（Zod）
- 必含：prompt/systemPrompt、tools、outputSchema(可选)、workflowPolicy(如 maxSteps/retry)、citationPolicy、guardrailsPolicy

2) 定义 TemplateRef（用于可复现）
- templateId 模式：至少包含 `templateId`，并支持携带 `templateVersion`（或等价字段）
- templateDefinition 模式：计算并记录 `templateDefinitionHash`（或等价字段），用于运行记录与复现定位

3) 校验失败错误模型
- message(英文) + details（指明违规字段路径）

4) 默认模板策略
- 未指定 templateId/templateDefinition 时使用 default template

# Verification
- 单元/属性测试（至少覆盖以下断言）：
  - 随机生成部分字段缺失/非法类型输入 -> 必须被 schema 拒绝，并在错误 details 中包含字段路径。
  - 对合法模板：`TemplateDefinition` 可被 parse 成功，并且生成的 `TemplateRef`（version/hash）字段不为空。

# Checklist
- [x] 定义 TemplateDefinition（Zod）并包含 required 字段
- [x] 定义 TemplateRef（templateId/version 或 templateDefinitionHash）用于可复现
- [x] 校验失败返回结构化错误（英文 message + details.issues 含字段路径）
- [x] 默认模板策略（未指定 template 时 fallback）
- [x] 单元/属性测试覆盖：非法输入拒绝且 details 含路径；合法模板生成 ref 的 version/hash 非空

# Output
- 输出：TemplateDefinition schema + TemplateRef 定义 + 校验入口函数 + 测试。
```

### Task T6：GraphQL 主干（Template/Project/Task/Session + createTask/cancelTask）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T6：GraphQL 主干（Template/Project/Task/Session + createTask/cancelTask）。

# References
- requirements: specs/study-copilot/requirements.md (R9, R10, R26, R41)
- contracts: specs/study-copilot/design/design-contracts.md (GraphQL draft)

# Execution Plan
1) GraphQL schema 最小集合
- Query: templates/projects/tasks
- Mutation: createTask, cancelTask

2) createTask 行为
- 校验 tenantId/projectId
- 校验 templateId/templateDefinition（二选一）
- 创建 task/session（可先 in-memory，但需抽象接口便于后续 DB）
- 运行记录可复现：Task/Session 必须记录 `templateRef` 的 version/hash（见 T5）

3) cancelTask 行为
- 可取消正在运行的流式/工作流（与 T8/T9 对齐）

# Verification
- integration test（至少覆盖以下断言）：
  - createTask -> 返回 taskId
  - createTask 返回/可查询的 task/session 数据中包含 `templateRef`（version/hash）且非空
  - cancelTask -> 状态变更可观测

# Checklist
- [x] 实现 GraphQL schema：Query templates/projects/tasks
- [x] 实现 Mutation：createTask/cancelTask（含输入输出类型）
- [x] createTask：校验 tenantId/projectId、templateId/templateDefinition（二选一），创建 task/session
- [x] 记录可复现字段：Task/Session 包含 `templateRef` 的 version/hash
- [x] integration tests 覆盖：createTask 返回 taskId；templateRef 非空；cancelTask 状态可观测

# Output
- 输出：schema + resolver + 测试（含 templateRef 复现字段断言）。
```

### Task T7：Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T7：Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链。

# References
- requirements: specs/study-copilot/requirements.md (R1, R2, R6, R7, R15)
- design: specs/study-copilot/design/design-agent.md
- tasks: specs/study-copilot/tasks.md (T7)

# Execution Plan
1) runtime config 构建
- templateId/templateDefinition -> runtime config

2) wrapLanguageModel 中间件链
- 顺序执行 + 允许短路
- 支持 MockLanguageModel（便于测试）

3) guardrails hook（预留/接入点）
- 输入/工具调用/输出阶段：允许插入 guardrails 扫描
- guardrails 触发时：
  - 能阻断输出
  - 能产生可观测事件/日志（至少 requestId 可关联）

4) 引用合规（禁止伪造引用）
- 当输出包含 citations 时：citation MUST 可映射回真实检索/深读结果（至少在 mock 环境也要能通过 Evidence API 验证）
- 不可映射或跨 projectId：必须视为 `CONTRACT_VIOLATION`（或等价错误），禁止“编造 citationId”

5) structured output
- streamObject/generateObject + self-correction（重试上限可配置）

# Verification
- 属性测试：中间件顺序不变性（onion 模型）
- 单元/集成：schema 不匹配触发重试，超过次数返回结构化错误
- guardrails：至少 1 个可控用例可稳定阻断，并能在日志/事件里观测到原因
- 引用合规：至少 1 个用例断言“输出中包含 citationId -> 调用 Evidence API 可返回对应证据”；不可映射时必须返回 `CONTRACT_VIOLATION`（或等价错误）

# Checklist
- [x] runtime config 构建（templateId/templateDefinition -> runtime config）
- [x] wrapLanguageModel 中间件链：顺序执行 + 允许短路
- [x] 支持 MockLanguageModel（便于测试）
- [x] guardrails hook：可阻断输出且可观测（StepEvent 含 requestId）
- [x] 引用合规：citations 可映射回 EvidenceProvider；不可映射/跨 projectId -> CONTRACT_VIOLATION
- [x] structured output：schema 不匹配触发重试；超过次数返回结构化错误

# Output
- 输出：Agent Proxy 核心代码 + 测试。
```

### Task T8：Streaming Endpoint：Vercel AI Data Stream Protocol 输出

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T8：Streaming Endpoint：Vercel AI Data Stream Protocol 输出。

# References
- requirements: specs/study-copilot/requirements.md (R4, R10)
- contracts: specs/study-copilot/design/design-contracts.md (Streaming Protocol)
- tasks: specs/study-copilot/tasks.md (T8)

# Execution Plan
1) 实现 POST /api/stream
- 输入：taskId/sessionId + messages + templateRef + options
- 输出：严格遵循 Vercel AI Data Stream Protocol

2) TTFT（Time To First Token）
- 记录 TTFT 与总耗时
- 与 requestId 关联（日志或 metrics 任一即可）

3) 错误块与取消
- streaming 中异常必须转换为可识别 error block
- 客户端断开/取消 -> 取消底层模型请求

# Verification
- 自动化断言（至少覆盖以下断言）：
  - integration：请求 `/api/stream` 能收到数据流，且能被“协议解析器”（按你实现的 decoder）完整解析
  - error block：人为制造一次错误（例如 mock provider 抛错），断言返回可识别 error block，且可解析为 `AppError`（含 `code/message/retryable/requestId`）
  - cancel：模拟客户端断开或调用 cancel，断言 server 侧取消底层模型请求（可通过 mock/spy/日志断言）
  - TTFT：至少一次真实/模拟调用可观测到 TTFT 被记录（日志或 metrics 任一）

# Output
- 输出：路由实现 + 协议测试。
```

# Checklist
- [x] 实现 `POST /api/stream` 请求体校验（Zod）
- [x] 输出严格遵循 Vercel AI Data Stream Protocol v1（`X-Vercel-AI-Data-Stream: v1` + `text/plain; charset=utf-8`）
- [x] 提供协议 encoder/decoder（@niche/core）并在集成测试中使用 decoder 断言可解析
- [x] streaming error 转换为可识别 error block（包含可解析 `AppError`）
- [x] 客户端断开触发取消（AbortController）并可在测试中观测到底层 provider 被 abort
- [x] TTFT 与总耗时可观测（与 requestId 关联）
- [x] 集成测试覆盖：parseability / error block / cancel / TTFT

### Task T9：Step Events：事件模型与发射策略

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T9（Step Events）：
：事件模型与发射策略。

# References
- requirements: specs/study-copilot/requirements.md (R5)
- contracts: specs/study-copilot/design/design-contracts.md (Step Events Schema)
- tasks: specs/study-copilot/tasks.md (T9)

# Execution Plan
1) 事件定义
- step_started/step_progress/tool_called/tool_result/step_completed/step_failed

2) 脱敏策略
- tool_called 的参数摘要必须脱敏

3) 通道策略
- 选择：与 stream 同通道或双通道（先实现一种 MVP）

4) 前端可消费的区分规则
- 明确 events 与正文 token 的区分方式（例如 block type、字段标记、或独立通道）
- 明确 UI 侧如何按 `stepId/timestamp` 归并与排序（与 `design-frontend.md` 的“Normalizer”思路一致）

5) 取消与可恢复状态
- 用户取消后：事件流与任务状态进入稳定的“可恢复/可重试”状态
- 前端可重新发起运行（不要求复用原连接，但要求状态机一致）

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元：任意 StepEvent 都能被 Zod schema parse；`step_failed` 的 payload（若包含 error）可被 `AppError` schema parse。
  - 单元：`tool_called` 的参数摘要已脱敏（断言不包含原始敏感字段；按你实现的脱敏策略写断言）。
  - 集成：执行一次最小任务，事件流/通道至少出现 3 类事件（例如 `step_started`/`tool_called`/`step_completed`），且每条事件均包含 `requestId/taskId/stepId/timestamp`。
  - 集成：取消任务后，不再产生新的 StepEvent，且 task 状态进入取消态（或等价的可恢复/可重试状态）。

# Output
- 输出（强制包含以下内容）：
  - 事件发射点列表
  - 至少 3 类事件示例（含 `requestId/taskId/stepId/timestamp`）
  - 本次选择的通道策略（同通道/双通道）+ 区分规则（前端如何识别）

# Checklist
- [x] 实现 StepEvent 事件定义：step_started/step_progress/tool_called/tool_result/step_completed/step_failed
- [x] tool_called.argsSummary 使用脱敏摘要（不泄露 token/apiKey/secret 等字段）
- [x] 选择并实现通道策略：同通道（Vercel AI Data Stream `data-step-event` part）
- [x] 明确前端区分规则：token(`0:`) vs event(part.type=`data-step-event`)
- [x] 集成测试：最小任务至少出现 3 类事件，且包含 requestId/taskId/stepId/timestamp
- [x] 集成测试：取消任务后停止产生新的 StepEvent，task 进入 cancelled（可重试）状态
```

### Task T10：RAGFlow Adapter（检索 + 引用字段映射）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T10（RAGFlow Adapter）。

# References
- requirements: specs/study-copilot/requirements.md (R20, R21, R41)
- contracts: specs/study-copilot/design/design-contracts.md (Citation / Evidence Model)

# Execution Plan
1) 实现检索适配器
- 输入：query + filters（默认含 projectId）
- 输出：chunks + citations（映射为统一 Citation 模型）

2) 降级策略
- RAGFlow 字段缺失/能力不足时，返回 citation.status=degraded 并记录原因

# Verification
- 自动化断言（至少覆盖以下断言）：
  - mock RAGFlow 返回 -> citations 字段映射完整，且可被 `Citation` schema parse
  - 默认携带 projectId filter：当缺 projectId 或 projectId 不匹配时必须拒绝或降级并标注原因（按你的隔离策略实现）
  - 字段缺失降级：缺少定位字段时 `status=degraded` 且 `degradedReason` 非空

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] RAGFlow adapter 输入/输出 schema 定义完成（Zod）
- [x] RAGFlow client 实现完成（含 requestId/tenantId/projectId 透传）
- [x] RAGFlow -> Citation 字段映射完成
- [x] 降级策略完成（status=degraded + degradedReason）
- [x] 错误模型对齐（AppError/等价，英文 message）
- [x] 单元测试覆盖：映射/隔离/降级/错误分支
- [x] 集成测试覆盖：端到端执行可返回 citations（可用 mock）

# Output
- 输出：adapter + 映射表（字段 -> 统一模型）+ 降级示例（status=degraded + degradedReason）。
```

### Task T11：Evidence API（citationId -> 证据展示数据）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T11（Evidence API）。

# References
- requirements: specs/study-copilot/requirements.md (R21, R41, R10)
- contracts: specs/study-copilot/design/design-contracts.md (Evidence Endpoint)

# Execution Plan
1) GET /api/evidence?citationId=...
- 返回：来源标识、定位元数据、snippet(可选)

2) 隔离校验
- projectId 必须一致；跨 Project 默认拒绝或要求显式开关

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 合法 citationId 返回成功响应，且响应能被 Evidence 的 Zod schema 解析（以 T2 落地的 contracts schema 为准）
  - 跨 projectId：返回 `AUTH_ERROR`（或等价隔离错误），且包含 `requestId`
  - citation 不可验证：返回中能表达 `status=unavailable` 或等价降级信息，不允许伪造 snippet

# Output
- 输出：endpoint + 示例响应（脱敏）。
```

### Task T12：UI：模板选择/运行/steps/citations 的最小可用实现

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T12（UI 最小可用实现）。

# References
- requirements: specs/study-copilot/requirements.md (R3, R4, R5, R21)
- design: specs/study-copilot/design/design-ui.md
- design: specs/study-copilot/design/design-frontend.md
- tasks: specs/study-copilot/tasks.md (T12)

# Execution Plan
0) 前置依赖确认
- citations 数据来源：来自 T10（RAGFlow Adapter）
- 引用点击证据：来自 T11（Evidence API）

1) Template Picker + Task Runner
2) Stream 渲染 + Step Timeline
3) 引用点击 -> Evidence Panel
4) 错误提示与重试

5) 可用性验收（R3 关键点）
- 键盘可完成核心流程（模板选择 -> 启动 -> 聚焦输出/步骤 -> 打开引用证据）
- 响应式布局：常见断点下不遮挡核心交互
- 状态反馈齐全：loading/empty/error/cancelled

# Verification
- 自动化断言（E2E 优先；使用仓库现有 e2e runner；若暂无则先建立最小可运行的 e2e 骨架并在本任务中落地）：
  - 启动闭环：选择模板 -> 点击启动 -> 触发 `createTask` 并进入运行态（断言 UI 状态从 idle 进入 running，且能关联到 taskId 或等价标识）
  - 流式增量：断言输出区存在“增量更新”（至少 2 次内容追加，而非只出现最终一次性渲染）
  - Step Timeline：断言至少渲染 3 条事件（例如 `step_started`/`tool_called`/`step_completed`），并且每条事件都能显示或持有 `requestId/taskId/stepId/timestamp`
  - 引用点击证据：断言点击引用后会触发 Evidence 请求，并在侧栏/弹层展示证据的来源标识 + 定位信息 + 状态（可验证/降级/不可用）
  - 取消：运行中点击取消 -> 断言 stream 终止、UI 状态进入 cancelled（或等价状态），并且提供“重试/重新运行”入口
  - 错误块：模拟后端返回 error block（或等价错误响应）-> 断言 UI 能展示错误信息，并提供重试入口
  - 键盘可用性（可自动化）：使用键盘事件完成“选择模板 -> 启动 -> 聚焦输出/步骤 -> 打开引用证据 -> 关闭弹层/侧栏 -> 取消/重试”最小闭环（断言焦点状态与关键按钮可触达）
  - 响应式断点（可自动化）：至少在 2 个 viewport 下跑通同一条 e2e 用例（例如移动端与桌面端），断言核心操作区无需水平滚动且关键按钮可见

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] 测试通过（npm run test）
- [x] 启动闭环：选择模板 -> createTask -> running
- [x] 流式增量：输出至少追加 2 次
- [x] Step Timeline：至少渲染 3 条事件
- [x] 引用点击证据：触发 Evidence 请求并展示
- [x] 取消：进入 cancelled 且提供重试入口
- [x] 键盘可用性：核心流程可用
- [x] 响应式断点：移动端/桌面端核心交互可用

# Output
- 输出：
  - UI 关键组件清单 + 交互说明
  - E2E 用例列表与断言点
  - 测试数据/Mock 的组织方式（如何保证稳定复现）
  - 失败排查指引：如何用 requestId 定位后端日志与前端步骤
```

### Task T13：导出（Markdown/Obsidian 友好）

```markdown
# Context
你是 负责落地与验收的工程师.
目标：完成 T13（导出）。

# References
- requirements: specs/study-copilot/requirements.md (R3)
- tasks: specs/study-copilot/tasks.md (T13)

# Execution Plan
1) 导出格式规范
- 正文 + 引用元数据（可点击/可追溯）

2) UI：导出预览 + 导出后反馈

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元：导出函数/formatter 对同一输入输出 deterministic（同输入同输出），适合快照测试
  - 单元：导出内容必须保留引用元数据（至少包含 citationId 与 locator/projectId 等关键字段，按你在 contracts 中落地的 schema）
  - E2E（若导出在前端触发）：点击导出 -> 断言导出内容中包含正文 + 引用信息（或元数据块），并且导出完成后 UI 给出明确反馈

# Checklist
- [x] formatter 对同一输入输出 deterministic（快照/等价断言）
- [x] 导出内容保留引用元数据（citationId/locator/projectId 等）
- [x] UI：导出预览 + Copy/Download 反馈（含单元测试）

# Output
- 输出：
  - 导出格式示例（Markdown）
  - formatter 的输入/输出契约说明（哪些字段必须存在、哪些可选）
  - 对应的单元测试/快照测试用例清单
```

---

## Phase 2：可靠性/性能/成本（T14-T16）

### Task T14：Provider 与多模型路由

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T14（Provider 与多模型路由）。

# References
- requirements: specs/study-copilot/requirements.md (R14)
- tasks: specs/study-copilot/tasks.md (T14)

# Execution Plan
1) Provider Adapter 抽象
- 统一模型调用入口（对齐 Vercel AI SDK 的 generateText/streamText 等调用方式）
- 支持从配置切换 provider/model 而不改业务逻辑

2) 路由策略（最小可用）
- 基于配置或简单启发式（例如复杂度阈值）选择模型

3) 指标
- 至少记录：延迟、错误、token 用量（若可得）

# Verification
- 自动化断言（至少覆盖以下断言）：
  - integration：切换 provider 或模型配置后，业务代码无需修改即可生效
  - integration：当主 provider 不可用时能走 fallback（可用 mock/spy 断言）

# Checklist
- [x] Provider Adapter 抽象已落地（generateText/streamText）
- [x] 最小确定性路由策略已落地（primary + fallbacks）
- [x] integration：切换 provider/model 配置后可生效（无需改业务代码）
- [x] integration：主 provider 失败触发 fallback
- [x] integration：路由决策日志包含 requestId/taskId/providerId/modelId

# Output
- 输出：路由策略说明 + 配置示例 + 最小回归用例。
```

### Task T15：降级/重试/错误模型统一 + Guardrails

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T15（降级/重试/错误模型 + Guardrails）。

# References
- requirements: specs/study-copilot/requirements.md (R7, R12)
- contracts: specs/study-copilot/design/design-contracts.md (Error Model)
- tasks: specs/study-copilot/tasks.md (T15)

# Execution Plan
1) AppError 统一模型
- GraphQL/REST/stream 的错误输出统一

2) Provider 故障转移/超时/熔断

3) Guardrails
- 输入/输出扫描
- 阻断与安全事件记录

# Verification
- 自动化断言（至少覆盖以下断言）：
  - provider 超时/不可用：触发 fallback，且错误/降级路径输出统一 `AppError`（含 `code/message/retryable/requestId`）
  - guardrails 阻断：输入或输出触发阻断时，返回 `GUARDRAIL_BLOCKED`（或等价错误码），且 `retryable=false`
  - 引用契约违规：当出现不可映射 citation（或跨 projectId）时，返回 `CONTRACT_VIOLATION`（或等价错误码）

# Output
- 输出：错误码表 + 触发条件 + 最小回归用例。
```

### Task T16：响应缓存

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T16（响应缓存）。

# References
- requirements: specs/study-copilot/requirements.md (R13)
- tasks: specs/study-copilot/tasks.md (T16)

# Execution Plan
1) cache key 设计（包含模板/输入/检索摘要等）
2) TTL + LRU
3) 命中标记（响应携带 cached 标识）

# Verification
- 自动化断言（至少覆盖以下断言）：
  - integration：同输入重复请求命中缓存（断言：第二次请求不触发模型调用或等价昂贵路径；可用 mock/spy）
  - integration：命中时响应显式标记缓存来源（字段名按你的契约实现）

# Output
- 输出：缓存 key 规则 + 命中示例 + 最小回归用例。
```

---

## Phase 3：测试与质量（T17-T19）

### Task T17：契约测试（stream/events/citation/ragflow）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T17（契约测试）。

# References
- requirements: specs/study-copilot/requirements.md (R4, R5, R20, R21)
- contracts: specs/study-copilot/design/design-contracts.md
- tasks: specs/study-copilot/tasks.md (T17)

# Execution Plan
1) stream protocol 测试
2) events schema 测试（含脱敏断言）
3) citation/evidence + projectId 隔离测试
4) RAGFlow 字段映射回归测试

# Verification
- 自动化断言：契约测试必须在 CI/本地可重复运行并通过（使用仓库现有 test 命令）。
- 最小断言清单（至少覆盖以下点）：
  - stream protocol：成功块可解析、错误块可解析为 `AppError`、取消路径可被识别
  - events schema：字段完整性 + `tool_called` 参数摘要脱敏断言
  - citation/evidence：字段可被 schema parse + projectId 隔离断言
  - RAGFlow 映射：字段变更导致 schema parse 失败时测试应失败（阻断回归）

# Output
- 输出：测试文件清单 + 覆盖的契约点。
```

### Task T18：端到端测试（模板启动 -> 运行 -> 引用 -> 导出）

```markdown
# Context
你是 负责落地与验收的工程师.
目标：完成 T18（端到端测试）。

# References
- design: specs/study-copilot/design-overview.md (Flow 1-4)

# Execution Plan
- 用例覆盖：启动/取消/失败重试/引用点击/导出
- 测试可复现性策略：
  - provider / RAGFlow / Evidence 尽量用 mock 或确定性测试数据，保证 CI 可重复
  - 所有测试失败必须输出 requestId（或等价追踪字段）便于定位

# Verification
- 自动化断言：在 CI 或本地稳定可重复执行（以仓库现有 e2e runner 为准）
- 最小用例矩阵（至少覆盖以下用例与断言点）：
  - Happy path：模板选择 -> createTask -> stream 增量输出 -> step events 渲染 -> citations 出现 -> 点击 citation 拉取 evidence -> 导出成功
  - Cancel：运行中取消 -> stream 停止 + 状态进入 cancelled -> 可重新运行
  - Error：模拟 provider 失败 -> UI/客户端可识别 error block 并展示错误（含 retryable 语义）-> 重试后成功（或返回明确不可重试）
  - Isolation：跨 projectId 的 evidence 请求必须失败（AUTH_ERROR 或等价隔离错误）

# Output
- 输出：
  - E2E 用例列表与断言点
  - 测试数据/Mock 的组织方式（如何保证稳定复现）
  - 失败排查指引：如何用 requestId 定位后端日志与前端步骤
```

### Task T19：安全与合规测试（注入/越狱/伪造引用）

```markdown
# Context
你是 QA + Security Specialist.
目标：完成 T19（安全与合规测试）。

# References
- requirements: specs/study-copilot/requirements.md (R7)

# Execution Plan
1) 注入/越狱样例库
2) 伪造引用回归样例

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 注入/越狱用例：触发 guardrails 时必须返回 `GUARDRAIL_BLOCKED`（或等价错误码），且 `retryable=false`，并包含 `requestId`
  - 伪造引用用例：当出现不可映射 citation 或试图编造 citationId 时，必须返回 `CONTRACT_VIOLATION`（或等价错误码），并包含 `requestId`
  - 回归保障：上述用例集在 CI/本地可重复运行（使用仓库现有 test runner），任一回归必须阻断

# Output
- 输出：
  - 安全用例清单（按类别分组：注入/越狱/伪造引用/跨 projectId 等）
  - 每条用例的期望行为（对应的 AppError.code / guardrail 事件）
  - 最小自动化测试文件清单
```

---

## Phase 4：发布与运维（T20-T21）

### Task T20：CI/CD 与发布检查清单

```markdown
# Context
你是 负责落地与验收的工程师.
目标：完成 T20（CI/CD 与发布检查清单）。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T20)

# Execution Plan
1) CI：lint/test/build
2) 发布检查清单：环境变量、RAGFlow 配置、日志/告警开关

# Verification
- 自动化断言：
  - CI 在主分支/PR 上执行 lint/test/build（使用仓库现有命令），失败则阻断合入
  - 发布检查清单以 markdown 形式落盘（路径由你在本任务中确定），并至少包含：环境变量、RAGFlow 配置、日志/告警开关、回滚/降级策略

# Output
- 输出：
  - CI 配置片段
  - 发布检查清单（markdown，含文件路径）
```

### Task T21：运行手册与故障排查指引

```markdown
# Context
你是 负责落地与验收的工程师.
目标：完成 T21（运行手册与故障排查）。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T21)

# Execution Plan
- 常见故障：provider 超时、RAGFlow 不可用、citation 降级
- 通过 requestId 追踪的排查步骤

# Verification
- 自动化/可验收断言：
  - runbook 以 markdown 落盘（路径由你在本任务中确定）
  - runbook 至少包含：本地启动步骤、常见故障（provider 超时、RAGFlow 不可用、citation 降级）、以及“按 requestId 串联排查”的步骤

# Output
- 输出：
  - runbook 文档内容（markdown，含文件路径）

```

---

## Backlog Prompts（规划，不阻塞 MVP）

> 说明：Backlog 任务通常不在当前迭代执行。若你要执行其中某项，请复制对应 Prompt，并在 Context 中明确“是否允许引入新依赖/新服务/新存储”。

### Task T22：多模态输入（R8）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T22（多模态输入）。

# References
- requirements: specs/study-copilot/requirements.md (R8)
- tasks: specs/study-copilot/tasks.md (T22)

# Execution Plan
- 选择支持的多模态输入类型（图片或音频优先其一）
- 模型选择与能力降级

# Verification
- 至少 1 条端到端演示

# Output
- 输出：能力范围与限制。
```

### Task T23：数据处理管道（R19）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T23（数据处理管道）。

# References
- requirements: specs/study-copilot/requirements.md (R19)
- tasks: specs/study-copilot/tasks.md (T23)

# Execution Plan
- 清洗/脱敏/增强流水线
- 明确输入/输出契约：输出应可被后续摄入/检索链路消费（与 T10/RAGFlow Adapter 对齐）

# Verification
- 至少一种文档格式可重复处理

# Output
- 输出：pipeline 分步说明。
```

### Task T24：OCR 支持（R19）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T24（OCR 支持：图片与扫描 PDF）。

# References
- requirements: specs/study-copilot/requirements.md (R19)
- tasks: specs/study-copilot/tasks.md (T24)

# Execution Plan
1) 选择 OCR 方案
- 优先：可替换的 OCR Adapter 抽象（便于后续替换供应商/本地模型）

2) 摄入路径对接
- 图片/扫描 PDF -> OCR -> 产出文本 -> 进入 T23 的数据处理管道

3) 错误与降级
- OCR 失败/低置信度：返回可解释错误（提示用户重试/上传更清晰版本）

# Verification
- 至少 1 个图片样例 + 1 个扫描 PDF 样例：OCR 输出非空且编码正确（可用 mock）
- 错误分支：失败时返回可解释原因

# Output
- 输出：OCR adapter 接口 + 摄入链路对接点 + 样例/测试用例。
```

### Task T25：插件化架构落地（R16）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T25（插件化架构落地）。

# References
- requirements: specs/study-copilot/requirements.md (R16)
- tasks: specs/study-copilot/tasks.md (T25)

# Execution Plan
1) 定义插件接口与生命周期
- 插件注册/初始化/启用/禁用

2) 示例插件
- 至少完成 1 项：注册 1 个 Tool 或注入 1 个 Prompt/Policy

# Verification
- 插件可启用/禁用并生效
- 最小自动化测试覆盖：加载与生效

# Output
- 输出：插件接口定义 + 示例插件 + 测试用例。
```

### Task T26：配置管理系统（R17）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T26（配置管理系统）。

# References
- requirements: specs/study-copilot/requirements.md (R17)
- tasks: specs/study-copilot/tasks.md (T26)

# Execution Plan
1) 配置加载与环境隔离
2) 热更新策略（若支持）与安全边界
3) 审计：记录时间/操作者/变更摘要

# Verification
- 配置缺失阻断启动并给出明确提示
- 变更可回溯（至少 1 条审计记录可查询）

# Output
- 输出：配置 schema + 加载入口 + 审计记录格式。
```

### Task T27：CLI 工具（R18）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T27（CLI 工具）。

# References
- requirements: specs/study-copilot/requirements.md (R18)
- tasks: specs/study-copilot/tasks.md (T27)

# Execution Plan
1) 选择 CLI 框架与命令结构
2) 实现至少 2 个核心命令（与项目当前阶段相关）
3) 错误与返回码规范：失败必须非 0，错误信息可定位

# Verification
- 两个命令可运行且 `--help` 可用
- 失败场景返回非 0 并输出可定位错误信息

# Output
- 输出：命令列表 + 使用示例 + 测试/验证方式。
```

### Task T28：反馈收集机制（R22）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T28（反馈收集机制）。

# References
- requirements: specs/study-copilot/requirements.md (R22)
- tasks: specs/study-copilot/tasks.md (T28)

# Execution Plan
1) 反馈入口（UI 或 API 任一）
2) 存储模型（最小可用）
3) 关联：feedback 必须关联 taskId/templateId（至少其一）

# Verification
- 一次任务结果可提交反馈并可被检索/查询

# Output
- 输出：数据模型 + API/组件 + 示例数据。
```

### Task T29：提示词管理系统（R23）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T29（提示词管理系统）。

# References
- requirements: specs/study-copilot/requirements.md (R23)
- tasks: specs/study-copilot/tasks.md (T29)

# Execution Plan
1) 版本化模型：templateVersion / promptVersion
2) 切换策略：按配置/按实验（最小可用即可）
3) 可复现性：运行记录可定位到版本号

# Verification
- 同一模板可维护多个版本并可切换
- 回滚到旧版本不影响既有运行记录的可复现定位

# Output
- 输出：版本模型 + 切换策略 + 运行记录字段。
```

### Task T30：评估框架（R24）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T30（评估框架）。

# References
- requirements: specs/study-copilot/requirements.md (R24)
- tasks: specs/study-copilot/tasks.md (T30)

# Execution Plan
1) 选择评估输入：数据集/场景定义
2) 运行与报告生成（最小可用）
3) 结构化导出：JSON/CSV 任一

# Verification
- 至少 1 个场景可输出评估报告
- 评估结果可导出为结构化格式

# Output
- 输出：评估配置样例 + 报告样例 + 导出格式。
```

### Task T31：合成数据生成（R25）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T31（合成数据生成）。

# References
- requirements: specs/study-copilot/requirements.md (R25)
- tasks: specs/study-copilot/tasks.md (T31)

# Execution Plan
1) 定义合成数据 schema（QA pairs 等）
2) 生成与质量控制
- 字段完整性/去重/格式校验
3) 让数据可被 T30 直接消费

# Verification
- 生成数据可直接被评估框架消费
- 质量检查可拦截明显无效样本

# Output
- 输出：schema + 生成策略 + 质量检查规则。
```

### Task T32：多租户与配额管理（R27）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T32（多租户与配额管理）。

# References
- requirements: specs/study-copilot/requirements.md (R27)
- tasks: specs/study-copilot/tasks.md (T32)

# Execution Plan
1) 配额模型与配置入口
2) 超限处理：限流/阻断（返回结构化错误）
3) 与 tenantId 关联

# Verification
- 超限必阻断并返回结构化错误
- 至少 1 个自动化测试覆盖超限场景

# Output
- 输出：配额模型 + 超限错误样例 + 测试用例。
```

## Research Copilot Prompts（规划，不阻塞 MVP）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：执行 Research Copilot 扩展任务（T33-T45）。请一次只执行一个任务。

# References
- requirements: specs/study-copilot/requirements.md (R28-R40)
- tasks: specs/study-copilot/tasks.md (T33-T45)

# Execution Plan
- 先选定一个任务（例如 T33 或 T37）
- 明确引用/证据链的契约与合规边界（snippet 是否可返回）
- 为该任务补充独立的回归用例

# Output
- 输出：该任务的实现与测试清单。
```

### Task T33：PDF 结构化解析与页码级引用溯源（R28）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T33（PDF 结构化解析与页码级引用溯源）。

# References
- requirements: specs/study-copilot/requirements.md (R28)
- tasks: specs/study-copilot/tasks.md (T33)

# Execution Plan
1) 摄入/解析：为 PDF 补充 page 元数据
2) 引用模型：citation/evidence 可携带 page
3) UI 展示：证据展示包含页码（缺失时可解释降级）

# Verification
- 证据展示至少包含页码定位；页码缺失时明确标注降级

# Output
- 输出：元数据字段设计 + 解析/摄入改动点 + 样例。
```

### Task T34：联网实时搜索并入库（R29）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T34（联网实时搜索并入库）。

# References
- requirements: specs/study-copilot/requirements.md (R29)
- tasks: specs/study-copilot/tasks.md (T34)

# Execution Plan
1) 搜索工具接入（可配置开关）
2) 入库与去重策略（最小可用）
3) 合规降级：版权/访问限制

# Verification
- 至少 1 条搜索结果可入库并可被后续检索命中

# Output
- 输出：搜索->入库链路 + 数据模型 + 回归用例。
```

### Task T35：研究项目工作台（R30）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T35（研究项目工作台）。

# References
- requirements: specs/study-copilot/requirements.md (R30)
- tasks: specs/study-copilot/tasks.md (T35)

# Execution Plan
1) 研究项目模型（课题/资料/结论/待办）
2) UI 视图：创建/打开/浏览

# Verification
- 可创建/打开研究项目并在 UI 查看资料与结论列表

# Output
- 输出：数据模型 + UI 页面/组件 + 交互说明。
```

### Task T36：导出到 Markdown/Obsidian 和 Notion（R31）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T36（Notion 导出）。

# References
- requirements: specs/study-copilot/requirements.md (R31)
- tasks: specs/study-copilot/tasks.md (T36)

# Execution Plan
1) Notion 导出通路（API/集成方式）
2) 错误模型与重试

# Verification
- 导出到 Notion 成功或返回结构化错误（含可重试建议）

# Output
- 输出：导出流程 + 错误样例 + 最小回归用例。
```

### Task T37：强引用模式（R32）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T37（强引用模式）。

# References
- requirements: specs/study-copilot/requirements.md (R32)
- tasks: specs/study-copilot/tasks.md (T37)

# Execution Plan
1) 新增 answerPolicy=force 配置
2) 生成策略：缺证据时明确标注“不确定/无证据”
3) 与 citations/证据链联动

# Verification
- 强引用模式下：关键结论均有 citation 或被明确标注无证据

# Output
- 输出：策略说明 + 示例输出 + 回归用例。
```

### Task T38：约束 RAGFlow 字段能力与契约（R33）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T38（约束 RAGFlow 字段能力与契约）。

# References
- requirements: specs/study-copilot/requirements.md (R33)
- tasks: specs/study-copilot/tasks.md (T38)

# Execution Plan
1) 明确必须字段与兼容策略（只增不改）
2) 契约测试：字段变更可被捕获并阻断回归

# Verification
- RAGFlow 字段变更可被契约测试捕获

# Output
- 输出：字段清单 + 契约测试用例 + 告警/错误策略。
```

### Task T39：长文档处理策略与成本控制（R34）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T39（长文档处理策略与成本控制）。

# References
- requirements: specs/study-copilot/requirements.md (R34)
- tasks: specs/study-copilot/tasks.md (T39)

# Execution Plan
1) 长文档分层策略与预算上限
2) 中间结果复用与缓存策略
3) 可观测：命中策略与原因可在日志中追踪

# Verification
- 长文档场景下可配置预算/上限，且日志可观测命中策略与原因

# Output
- 输出：策略配置 + 日志字段 + 基准场景。
```

### Task T40：深度解析（Deep Parsing）（R35）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T40（深度解析）。

# References
- requirements: specs/study-copilot/requirements.md (R35)
- tasks: specs/study-copilot/tasks.md (T40)

# Execution Plan
1) 深度解析管线：产生结构化中间结果
2) 降级策略：不可用时可解释

# Verification
- 深度解析可产出结构化中间结果，可用于引用定位/后续检索

# Output
- 输出：中间结果 schema + 解析步骤 + 示例数据。
```

### Task T41：引用定位到页面坐标区域（R36）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T41（页面坐标级引用）。

# References
- requirements: specs/study-copilot/requirements.md (R36)
- tasks: specs/study-copilot/tasks.md (T41)

# Execution Plan
1) 引用模型补充坐标元数据
2) 缺失时回退到页码/offset 并标注原因

# Verification
- 前端可基于坐标定位展示证据；缺失时能回退并标注原因

# Output
- 输出：坐标字段定义 + UI 展示方案 + 回退策略。
```

### Task T42：混合检索工具（R37）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T42（混合检索工具）。

# References
- requirements: specs/study-copilot/requirements.md (R37)
- tasks: specs/study-copilot/tasks.md (T42)

# Execution Plan
1) 实现混合检索 Tool（多策略/多源）
2) 返回结构化列表并与 citations 对齐

# Verification
- 至少 1 条混合检索结果可进入 citations 并被证据链消费

# Output
- 输出：Tool schema + 返回格式 + 示例。
```

### Task T43：按页范围深度阅读特定文档（R38）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T43（按页范围深度阅读）。

# References
- requirements: specs/study-copilot/requirements.md (R38)
- tasks: specs/study-copilot/tasks.md (T43)

# Execution Plan
1) 输入：docId + pageRange
2) 输出：内容 + 引用定位信息
3) 越界：结构化错误 + 可重试建议

# Verification
- 页范围越界返回结构化错误并给出可重试建议

# Output
- 输出：接口定义 + 错误样例 + 回归用例。
```

### Task T44：本地模型与异步解析能力（R39）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T44（本地模型与异步解析能力）。

# References
- requirements: specs/study-copilot/requirements.md (R39)
- tasks: specs/study-copilot/tasks.md (T44)

# Execution Plan
1) 本地模型接入（可配置）
2) 异步解析队列/任务（最小可用）
3) 观测：关键参数记录

# Verification
- 至少支持 1 种本地推理模式接入，并可观测关键参数

# Output
- 输出：配置项 + 运行参数记录 + 示例。
```

### Task T45：研究项目 bootstrap（R40）

```markdown
# Context
你是 负责落地与验收的工程师。
目标：完成 T45（研究项目 bootstrap）。

# References
- requirements: specs/study-copilot/requirements.md (R40)
- tasks: specs/study-copilot/tasks.md (T45)

# Execution Plan
1) 触发：选定课题
2) 自动准备：资料搜集/任务拆解/模板初始化

# Verification
- 至少 1 条课题可触发 bootstrap，并产出可执行的研究项目结构与待办

# Output
- 输出：bootstrap 产物结构定义 + 示例。
```
