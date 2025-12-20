# tasks-prompts.md

> 本文件参考 `specs/vertical-ai-framework/tasks-prompts-optimized.md` 的组织方式，基于 `specs/study-copilot/tasks.md` + `specs/study-copilot/design/` 系列设计文档整理为 **中文任务提示词**。
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
   - `pnpm -r lint`
   - `pnpm -r test`

4. **全局编码规范（强制）**
   - TypeScript 5.x Strict（**禁止 `any`**）
   - 所有输入/输出/配置/工具参数必须用 **Zod** 校验
   - 测试：Vitest + fast-check（核心不变量尽可能用属性测试表达）
   - 错误消息（message）必须用 **英文**（便于日志搜索）；注释可中文

---

## Phase 0：准备/基建（T1-T4）

### Task T1：工程初始化与开发工作流

```markdown
# Context
你是 Niche/Study Copilot 的 Lead Engineer。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T1：工程初始化与开发工作流。

# 全局约束与标准
- TypeScript 5.x Strict；禁止 any。
- Zod 覆盖所有 schema（输入/输出/配置）。
- 测试：Vitest + fast-check。
- 错误 message 使用英文。

# References
- tasks: specs/study-copilot/tasks.md (T1)
- coding standards: .windsurf/rules/coding-standards.md

# Execution Plan
1) 建立 monorepo（若尚未存在）
- Files:
  - pnpm workspace / turbo（如采用）
  - root package.json / tsconfig / eslint / vitest
  - packages/core, apps/api, apps/web 的最小目录
- Requirements:
  - 能一条命令启动 dev（API 与 Web 可先占位）
  - 能一条命令运行 lint/test

2) 建立环境变量模板与配置加载入口
- Files:
  - .env.example（或等价）
  - packages/core/src/config/*（若采用）
- Verification:
  - pnpm -r lint
  - pnpm -r test

# Checklist
- [ ] monorepo/目录结构就绪
- [ ] lint/test/build 脚本可运行
- [ ] .env.example 存在且字段最小可用

# Output
- 输出你新增/修改的文件清单与关键设计决策（为何如此组织目录/脚本）。
```

### Task T2：共享类型与契约基线（GraphQL/REST/Events）

```markdown
# Context
你是 Niche/Study Copilot 的 Lead Engineer。
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
- [ ] contracts 以 Zod schema 形式定义
- [ ] 前后端可共享/复用（至少路径规划明确）

# Output
- 输出：契约文件路径 + 核心 schema 片段说明 + 测试用例。
```

### Task T3：可观测性基线（requestId 贯穿 + 结构化日志）

```markdown
# Context
你是 Niche/Study Copilot 的 Lead Engineer。
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
- 触发一次最小请求（可 mock），日志里能搜到完整链路 requestId。

# Output
- 输出：实现方式 + 示例日志行（脱敏）。
```

### Task T4：隔离上下文（tenantId/projectId 注入与强制校验）

```markdown
# Context
你是 Niche/Study Copilot 的 Lead Engineer。
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
- 缺 tenantId / projectId 的请求必须失败并返回结构化错误。

# Output
- 输出：上下文类型定义 + 关键拦截点（中间件/插件）列表。
```

---

## Phase 1：核心闭环（T5-T13）

### Task T5：模板定义 Schema 与校验（含结构化输出 Schema）

```markdown
# Context
你是 Niche/Study Copilot 的 Lead Engineer。
你正在执行 Phase 1：核心闭环。
目标：完成 T5（模板定义 Schema 与校验）。

# References
- requirements: specs/study-copilot/requirements.md (R1, R6)
- design: specs/study-copilot/design/design-agent.md

# Execution Plan
1) 定义 TemplateDefinition（Zod）
- 必含：prompt/systemPrompt、tools、outputSchema(可选)、workflowPolicy(如 maxSteps/retry)、citationPolicy、guardrailsPolicy

2) 校验失败错误模型
- message(英文) + details（指明违规字段路径）

3) 默认模板策略
- 未指定 templateId/templateDefinition 时使用 default template

# Verification
- 单元/属性测试：随机生成部分字段缺失/非法类型输入 -> 必须被 schema 拒绝并包含字段路径。

# Output
- 输出：TemplateDefinition schema + 校验入口函数 + 测试。
```

### Task T6：GraphQL 主干（Template/Project/Task/Session + createTask/cancelTask）

```markdown
# Context
你是 Lead Engineer。
目标：完成 T6（GraphQL 主干）。

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

3) cancelTask 行为
- 可取消正在运行的流式/工作流（与 T8/T9 对齐）

# Verification
- integration test：createTask -> 返回 taskId；cancelTask -> 状态变更可观测。

# Output
- 输出：schema + resolver + 测试。
```

### Task T7：Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链

```markdown
# Context
你是 Lead Engineer。
目标：完成 T7（Agent Proxy 最小实现）。

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

4) structured output
- streamObject/generateObject + self-correction（重试上限可配置）

# Verification
- 属性测试：中间件顺序不变性（onion 模型）
- 单元/集成：schema 不匹配触发重试，超过次数返回结构化错误
- guardrails：至少 1 个可控用例可稳定阻断，并能在日志/事件里观测到原因

# Output
- 输出：Agent Proxy 核心代码 + 测试。
```

### Task T8：Streaming Endpoint：Vercel AI Data Stream Protocol 输出

```markdown
# Context
你是 Lead Engineer。
目标：完成 T8（Streaming Endpoint）。

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
- integration：请求 /api/stream 能收到数据流
- property：headers/协议块格式符合预期（若你定义了属性 ID，请标注）
- 观测：一次真实/模拟调用可看到 TTFT（日志或 metrics）

# Output
- 输出：路由实现 + 协议测试。
```

### Task T9：Step Events：事件模型与发射策略

```markdown
# Context
你是 Lead Engineer。
目标：完成 T9（Step Events）。

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

4) 取消与可恢复状态
- 用户取消后：事件流与任务状态进入稳定的“可恢复/可重试”状态
- 前端可重新发起运行（不要求复用原连接，但要求状态机一致）

# Verification
- 单元：事件 schema 校验
- 集成：执行一次任务能看到至少 3 类事件
- 集成：取消后状态可恢复/可重试（至少 1 条用例可稳定复现）

# Output
- 输出：事件发射点列表 + 事件示例。
```

### Task T10：RAGFlow Adapter（检索 + 引用字段映射）

```markdown
# Context
你是 Lead Engineer。
目标：完成 T10（RAGFlow Adapter）。

# References
- requirements: specs/study-copilot/requirements.md (R20, R21, R41)

# Execution Plan
1) 实现检索适配器
- 输入：query + filters（默认含 projectId）
- 输出：chunks + citations（映射为统一 Citation 模型）

2) 降级策略
- RAGFlow 字段缺失/能力不足时，返回 citation.status=degraded 并记录原因

# Verification
- integration：mock RAGFlow 返回 -> citations 字段映射完整

# Output
- 输出：adapter + 映射表（字段 -> 统一模型）。
```

### Task T11：Evidence API（citationId -> 证据展示数据）

```markdown
# Context
你是 Lead Engineer。
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
- integration：合法 citationId 返回；跨 projectId 返回 AUTH/隔离错误

# Output
- 输出：endpoint + 示例响应（脱敏）。
```

### Task T12：UI：模板选择/运行/steps/citations 的最小可用实现

```markdown
# Context
你是 Lead Engineer。
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
- e2e（最小）：启动 -> 看到流式输出 -> 看到 steps -> 点击引用拉证据
- 键盘验收：不使用鼠标可完成最小闭环

# Output
- 输出：UI 关键组件清单 + 交互说明。
```

### Task T13：导出（Markdown/Obsidian 友好）

```markdown
# Context
你是 Lead Engineer。
目标：完成 T13（导出）。

# References
- requirements: specs/study-copilot/requirements.md (R3)

# Execution Plan
1) 导出格式规范
- 正文 + 引用元数据（可点击/可追溯）

2) UI：导出预览 + 导出后反馈

# Verification
- 导出文件可在 Obsidian 打开阅读；引用元数据可保留

# Output
- 输出：导出格式示例（Markdown）。
```

---

## Phase 2：可靠性/性能/成本（T14-T16）

### Task T14：Provider 与多模型路由

```markdown
# Context
你是 Lead Engineer。
目标：完成 T14（Provider 与多模型路由）。

# References
- requirements: specs/study-copilot/requirements.md (R14)

# Execution Plan
1) Provider Adapter 抽象
2) 路由策略（按复杂度/配置）
3) 指标：延迟/成本/错误率

# Verification
- integration：切换 provider 或模型无需改业务逻辑

# Output
- 输出：路由策略说明 + 配置示例。
```

### Task T15：降级/重试/错误模型统一 + Guardrails

```markdown
# Context
你是 Lead Engineer。
目标：完成 T15（降级/重试/错误模型 + Guardrails）。

# References
- requirements: specs/study-copilot/requirements.md (R7, R12)
- contracts: specs/study-copilot/design/design-contracts.md (Error Model)

# Execution Plan
1) AppError 统一模型
- GraphQL/REST/stream 的错误输出统一

2) Provider 故障转移/超时/熔断

3) Guardrails
- 输入/输出扫描
- 阻断与安全事件记录

# Verification
- 集成：主 provider 故障 -> fallback 成功，并返回可读降级提示

# Output
- 输出：错误码表 + 触发条件。
```

### Task T16：响应缓存

```markdown
# Context
你是 Lead Engineer。
目标：完成 T16（响应缓存）。

# References
- requirements: specs/study-copilot/requirements.md (R13)

# Execution Plan
1) cache key 设计（包含模板/输入/检索摘要等）
2) TTL + LRU
3) 命中标记（响应携带 cached 标识）

# Verification
- 集成：同输入重复请求命中缓存（可观测）

# Output
- 输出：缓存 key 规则 + 命中示例。
```

---

## Phase 3：测试与质量（T17-T19）

### Task T17：契约测试（stream/events/citation/ragflow）

```markdown
# Context
你是 Lead Engineer。
目标：完成 T17（契约测试）。

# References
- requirements: specs/study-copilot/requirements.md (R4, R5, R20, R21)
- contracts: specs/study-copilot/design/design-contracts.md

# Execution Plan
1) stream protocol 测试
2) events schema 测试（含脱敏断言）
3) citation/evidence + projectId 隔离测试
4) RAGFlow 字段映射回归测试

# Verification
- pnpm -r test 必须通过

# Output
- 输出：测试文件清单 + 覆盖的契约点。
```

### Task T18：端到端测试（模板启动 -> 运行 -> 引用 -> 导出）

```markdown
# Context
你是 Lead Engineer。
目标：完成 T18（端到端测试）。

# References
- design: specs/study-copilot/design-overview.md (Flow 1-4)

# Execution Plan
- 用例覆盖：启动/取消/失败重试/引用点击/导出

# Verification
- CI 或本地稳定可重复执行

# Output
- 输出：E2E 用例列表与断言点。
```

### Task T19：安全与合规测试（注入/越狱/伪造引用）

```markdown
# Context
你是 QA + Security Specialist。
目标：完成 T19（安全与合规测试）。

# References
- requirements: specs/study-copilot/requirements.md (R7)

# Execution Plan
1) 注入/越狱样例库
2) 伪造引用回归样例

# Verification
- Guardrails 能稳定阻断并返回可解释原因

# Output
- 输出：安全用例清单 + 期望行为。
```

---

## Phase 4：发布与运维（T20-T21）

### Task T20：CI/CD 与发布检查清单

```markdown
# Context
你是 Lead Engineer。
目标：完成 T20（CI/CD 与发布检查清单）。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T20)

# Execution Plan
1) CI：lint/test/build
2) 发布检查清单：环境变量、RAGFlow 配置、日志/告警开关

# Verification
- 主分支合入具备质量门禁

# Output
- 输出：CI 配置片段 + 发布检查清单。
```

### Task T21：运行手册与故障排查指引

```markdown
# Context
你是 Lead Engineer。
目标：完成 T21（运行手册与故障排查）。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T21)

# Execution Plan
- 常见故障：provider 超时、RAGFlow 不可用、citation 降级
- 通过 requestId 追踪的排查步骤

# Verification
- 新同学可按文档完成本地启动与问题定位

# Output
- 输出：runbook 文档内容。
```

---

## Backlog Prompts（规划，不阻塞 MVP）

> 说明：Backlog 任务通常不在当前迭代执行。若你要执行其中某项，请复制对应 Prompt，并在 Context 中明确“是否允许引入新依赖/新服务/新存储”。

### Task T22：多模态输入（R8）

```markdown
# Context
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
你是 Lead Engineer。
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
