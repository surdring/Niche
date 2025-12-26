# tasks-prompts-v2.md (修正版 - 符合标准)

> 本文件是 `tasks-prompts.md` 的修正版本，所有 MVP 任务提示词已按照 `kiro/prompts/generate-backlog-prompts.md` 的标准进行完善。
> 
> **主要改进**：
> 1. 补充详细的 Execution Plan（Scope/Files/Requirements）
> 2. 补全 Checklist（至少 5 条）
> 3. 新增"依赖关系与风险评估"章节
> 4. 完善 Output 的测试/验证方式
> 5. 统一格式规范

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
   - 每个任务的 Verification 优先写成**可自动化断言**（单元/集成/契约测试），避免仅"手工目测"。
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
- 测试框架遵循仓库现状；若仓库尚未建立测试框架，可选用 Vitest（并在需要时使用属性测试库 fast-check）。

# References
- tasks: specs/study-copilot/tasks.md (T1)
- design: specs/study-copilot/design-overview.md
- coding standards: （可选）若仓库内已有统一编码规范文件则遵循；本任务以 specs/study-copilot 为准

# Execution Plan

1) 初始化 monorepo 结构（若尚未存在）
- Scope:
  - 选择包管理器：pnpm（推荐）或 npm workspaces
  - 选择构建工具：Turbo（推荐）或 nx
  - 创建 workspace 配置文件
- Files（建议）:
  - pnpm-workspace.yaml 或 package.json (workspaces)
  - turbo.json（若采用 Turbo）
  - .gitignore（补充 node_modules/dist/build 等）
- Requirements:
  - workspace 必须包含：packages/core, apps/api, apps/web
  - 支持 workspace 间依赖（例如 apps/api 依赖 packages/core）

2) 建立最小目录结构
- Scope:
  - packages/core：核心编排、Agent、契约类型
  - apps/api：Fastify + GraphQL/REST/Streaming
  - apps/web：UI（模板选择、运行、step events、引用、导出）
  - tests/：测试（可选，也可在各 workspace 内建立）
- Files（建议）:
  - packages/core/package.json + src/index.ts（占位）
  - apps/api/package.json + src/index.ts（占位）
  - apps/web/package.json + src/App.tsx（占位）
- Requirements:
  - 每个 workspace 必须有独立的 package.json
  - 每个 workspace 必须有 src/ 目录

3) 配置 TypeScript
- Scope:
  - root tsconfig.base.json（共享配置）
  - 各 workspace 继承 base config
- Files（建议）:
  - tsconfig.base.json（strict: true, noImplicitAny: true）
  - packages/core/tsconfig.json（extends root）
  - apps/api/tsconfig.json（extends root）
  - apps/web/tsconfig.json（extends root）
- Requirements:
  - 必须启用 strict 模式
  - 必须配置 paths（便于 workspace 间引用）

4) 配置 ESLint 与测试框架
- Scope:
  - ESLint 配置（TypeScript + 推荐规则）
  - 测试框架配置（Vitest 推荐）
- Files（建议）:
  - eslint.config.mjs 或 .eslintrc.js
  - vitest.config.ts（若采用 Vitest）
- Requirements:
  - ESLint 必须覆盖 .ts/.tsx 文件
  - 测试框架必须支持 TypeScript

5) 建立环境变量模板与配置加载
- Scope:
  - .env.example（最小字段集合）
  - 配置加载入口（packages/core/src/config/）
- Files（建议）:
  - .env.example（DATABASE_URL/RAGFLOW_API_URL/MODEL_API_KEY 等占位）
  - packages/core/src/config/index.ts（使用 Zod 校验环境变量）
- Requirements:
  - .env.example 必须包含所有必需字段（可为空值）
  - 配置加载必须使用 Zod 校验，缺失必填字段时抛出明确错误

6) 建立开发脚本
- Scope:
  - dev：启动开发服务器（API + Web）
  - build：构建所有 workspace
  - test：运行所有测试
  - lint：运行 ESLint
  - typecheck：运行 TypeScript 类型检查
- Files（建议）:
  - root package.json（scripts 字段）
  - turbo.json（若采用 Turbo，定义 pipeline）
- Requirements:
  - 所有脚本必须可在 root 执行
  - dev 脚本必须能同时启动 API 和 Web（可使用 concurrently 或 Turbo）

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 执行 `pnpm install`（或等价命令）成功，无依赖冲突
  - 执行 `pnpm run lint` 成功（即使是空项目也应通过）
  - 执行 `pnpm run typecheck` 成功
  - 执行 `pnpm run test` 成功（至少有 1 个占位测试通过）
  - 执行 `pnpm run build` 成功，产出 dist/ 目录
  - 执行 `pnpm run dev` 可启动服务（至少不报错，可手动验证）

# Checklist
- [ ] monorepo 结构就绪（pnpm-workspace.yaml 或等价配置存在）
- [ ] 目录结构完整（packages/core, apps/api, apps/web 存在且有 package.json）
- [ ] TypeScript 配置完成（tsconfig.base.json + 各 workspace tsconfig.json，strict 模式启用）
- [ ] ESLint 配置完成（eslint.config.mjs 或等价文件存在）
- [ ] 测试框架配置完成（vitest.config.ts 或等价文件存在）
- [ ] .env.example 存在且包含最小字段集合
- [ ] 配置加载入口实现（packages/core/src/config/index.ts，使用 Zod 校验）
- [ ] 开发脚本就绪（dev/build/test/lint/typecheck 可执行）
- [ ] 自动化验证通过（lint/typecheck/test/build 全部成功）

# Output
- 输出（强制包含以下内容）：
  - 文件清单：新增/修改的所有文件路径
  - 关键设计决策：
    - 选择的包管理器与构建工具（及原因）
    - 目录组织方式（为何如此划分 workspace）
    - 测试框架选择（及原因）
  - 验证命令输出：
    - `pnpm run lint` 的输出（截图或文本）
    - `pnpm run typecheck` 的输出
    - `pnpm run test` 的输出
    - `pnpm run build` 的输出
  - 环境变量清单：.env.example 中的所有字段及说明

# 依赖关系与风险评估

## 前置依赖
- 无（本任务是整个项目的起点）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| pnpm | 包管理器 | 低（免费开源） | 低（成熟工具） |
| turbo | 构建工具 | 低（免费开源） | 低（Vercel 官方维护） |
| vitest | 测试框架 | 低（免费开源） | 低（Vite 生态，性能优秀） |
| zod | Schema 校验 | 低（免费开源） | 低（TypeScript 生态标准） |
| typescript | 类型系统 | 低（免费开源） | 低（必需依赖） |
| eslint | 代码检查 | 低（免费开源） | 低（标准工具） |

## 高风险点
1. **monorepo 配置复杂度**：workspace 间依赖可能导致循环依赖或版本冲突
   - 缓解措施：使用 Turbo 的依赖图分析，严格控制依赖方向（core <- api/web）
2. **TypeScript 配置不当**：paths 配置错误可能导致模块解析失败
   - 缓解措施：使用 tsconfig paths 插件，确保 IDE 和构建工具一致
3. **环境变量泄露**：.env 文件可能被误提交
   - 缓解措施：.gitignore 必须包含 .env，仅提交 .env.example

## 回滚策略
- 若 monorepo 配置失败：回退到单 repo 结构，后续再迁移
- 若构建工具不适配：切换到 npm scripts + concurrently（最小可用方案）
- 若测试框架有问题：切换到 Jest（更成熟但较慢）
```

---


### Task T2：共享类型与契约基线（GraphQL/REST/Events）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T2：共享类型与契约基线（GraphQL/REST/Events）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有契约必须以 Zod Schema 为单一事实源（z.infer<typeof Schema>）。
- 错误 message 使用英文。

# References
- contracts: specs/study-copilot/design/design-contracts.md
- requirements: specs/study-copilot/requirements.md (R4, R5, R6, R10, R21)
- tasks: specs/study-copilot/tasks.md (T2)

# Execution Plan

1) 定义 Streaming 协议契约
- Scope:
  - Vercel AI Data Stream Protocol 的 TypeScript 类型定义
  - Error block 结构（AppError）
  - 阶段标记（phase/step markers）
  - 取消语义（cancellation）
- Files（建议）:
  - packages/core/src/contracts/stream.ts
  - packages/core/src/contracts/error.ts
- Requirements:
  - 必须符合 Vercel AI Data Stream Protocol v1 规范
  - Error block 必须可被前端解析为 AppError
  - 支持客户端取消传播到 server 侧

2) 定义 StepEvent 契约
- Scope:
  - 事件类型枚举：step_started/step_progress/tool_called/tool_result/step_completed/step_failed
  - 事件基础字段：type/stepId/requestId/taskId/timestamp/payload
  - 各类型事件的 payload 结构
- Files（建议）:
  - packages/core/src/contracts/events.ts
- Requirements:
  - 所有事件必须包含 requestId/taskId/stepId/timestamp
  - tool_called 的 payload 必须包含脱敏后的参数摘要
  - step_failed 的 payload 必须包含 AppError

3) 定义 Citation/Evidence 契约
- Scope:
  - Citation 模型：citationId/sourceType/documentId/projectId/locator/snippet/status
  - Evidence 模型：来源标识/定位元数据/snippet/status/degradedReason
  - Locator 结构：page/offsetStart/offsetEnd/section/bbox
- Files（建议）:
  - packages/core/src/contracts/citation.ts
  - packages/core/src/contracts/evidence.ts
- Requirements:
  - Citation 必须可映射回真实检索/深读结果
  - projectId 必须存在且用于隔离校验
  - status 必须支持：verifiable/unavailable/degraded

4) 定义 AppError 统一错误模型
- Scope:
  - 错误码枚举：VALIDATION_ERROR/AUTH_ERROR/RATE_LIMITED/UPSTREAM_TIMEOUT/UPSTREAM_UNAVAILABLE/CONTRACT_VIOLATION/GUARDRAIL_BLOCKED
  - 错误结构：code/message/details/retryable/requestId
- Files（建议）:
  - packages/core/src/contracts/error.ts
- Requirements:
  - message 必须使用英文
  - details 必须包含字段路径（用于 Zod 校验错误）
  - retryable 必须明确标注（true/false）

5) 编写契约解析/序列化工具
- Scope:
  - Stream encoder/decoder（按 Vercel AI Data Stream Protocol）
  - Events payload 脱敏辅助函数
  - Citation/Evidence 字段映射工具
- Files（建议）:
  - packages/core/src/utils/stream-parser.ts
  - packages/core/src/utils/sanitize.ts
  - packages/core/src/utils/citation-mapper.ts
- Requirements:
  - decoder 必须能完整解析 stream 并识别 error block
  - 脱敏函数必须移除 token/apiKey/secret 等敏感字段
  - 映射工具必须处理字段缺失降级

6) 导出统一入口
- Scope:
  - packages/core/src/contracts/index.ts（统一导出所有契约）
  - packages/core/src/index.ts（导出 contracts）
- Files（建议）:
  - packages/core/src/contracts/index.ts
- Requirements:
  - 前后端可通过 `import { ... } from '@niche/core/contracts'` 引用
  - 类型定义必须完整导出

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元测试：所有 Zod schema 能解析合法输入
  - 单元测试：所有 Zod schema 能拒绝非法输入（字段缺失/类型错误）
  - 单元测试：AppError schema 能解析包含 details.issues 的 Zod 错误
  - 单元测试：StepEvent schema 能解析所有 6 种事件类型
  - 单元测试：Citation schema 能解析包含 projectId 的引用
  - 单元测试：脱敏函数能移除敏感字段（断言输出不包含 'token'/'apiKey'/'secret' 等关键词）
  - 集成测试：stream decoder 能完整解析包含 error block 的 stream

# Checklist
- [ ] Streaming 协议契约定义完成（stream.ts + error.ts，符合 Vercel AI Data Stream Protocol v1）
- [ ] StepEvent 契约定义完成（events.ts，包含 6 种事件类型）
- [ ] Citation/Evidence 契约定义完成（citation.ts + evidence.ts，包含 projectId 隔离字段）
- [ ] AppError 统一错误模型定义完成（error.ts，包含 7+ 种错误码）
- [ ] 契约解析/序列化工具实现（stream-parser.ts + sanitize.ts + citation-mapper.ts）
- [ ] 统一导出入口实现（contracts/index.ts）
- [ ] 单元测试覆盖所有 schema（合法输入 parse 成功，非法输入被拒绝）
- [ ] 集成测试覆盖 stream decoder（可解析包含 error block 的 stream）
- [ ] 前后端可共享/复用（至少路径规划明确，可通过 @niche/core/contracts 引用）

# Output
- 输出（强制包含以下内容）：
  - 契约文件清单：所有新增的 .ts 文件路径
  - 核心 schema 片段说明：
    - AppError schema 定义（含错误码枚举）
    - StepEvent schema 定义（含 6 种事件类型）
    - Citation schema 定义（含 projectId 字段）
  - 测试用例清单：
    - 单元测试文件路径（至少 4 个：stream/events/citation/error）
    - 每个测试文件覆盖的断言点（合法输入/非法输入/边界情况）
  - 使用示例：
    - 如何在前端引用契约类型
    - 如何在后端使用 Zod schema 校验
    - 如何使用脱敏函数

# 依赖关系与风险评估

## 前置依赖
- T1：工程初始化与开发工作流（必须完成，提供 packages/core 目录结构）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| zod | Schema 校验与类型推导 | 低（免费开源） | 低（TypeScript 生态标准） |
| @ai-sdk/provider | Vercel AI SDK 类型定义 | 低（免费开源） | 低（官方维护） |

## 高风险点
1. **契约变更影响面大**：contracts 被前后端共享，变更可能导致多处代码失效
   - 缓解措施：优先向后兼容（只增不改），使用 Zod 的 `.extend()` 而非直接修改
2. **Vercel AI Data Stream Protocol 理解偏差**：协议解析错误可能导致前端无法消费
   - 缓解措施：参考官方文档与示例，编写集成测试覆盖协议解析
3. **脱敏策略不完善**：可能遗漏敏感字段
   - 缓解措施：使用白名单策略（仅保留明确安全的字段），而非黑名单

## 回滚策略
- 若契约变更导致前后端不兼容：回退到上一版本契约，使用版本号隔离（v1/v2）
- 若 Zod schema 性能有问题：考虑使用 `.passthrough()` 减少校验开销（仅在性能瓶颈时）
- 若脱敏策略过于严格：提供配置开关，允许在开发环境关闭脱敏
```

---

### Task T3：可观测性基线（requestId 贯穿 + 结构化日志）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T3：可观测性基线（requestId 贯穿 + 结构化日志）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 结构化日志必须使用 JSON 格式（便于日志聚合与查询）。
- 错误 message 使用英文。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- design: specs/study-copilot/design/design-backend.md
- tasks: specs/study-copilot/tasks.md (T3)

# Execution Plan

1) 定义 requestId 生成策略
- Scope:
  - 选择 ID 生成方式：UUID v4（推荐）或 nanoid
  - 定义 requestId 格式规范（例如：req_xxxxxx）
  - 实现 requestId 生成函数
- Files（建议）:
  - packages/core/src/utils/request-id.ts
- Requirements:
  - requestId 必须全局唯一
  - requestId 必须可读性好（便于日志搜索）
  - requestId 生成必须高性能（避免成为瓶颈）

2) 实现 requestId 透传机制
- Scope:
  - API 入站：从 header 读取或生成 requestId
  - GraphQL resolver：通过 context 传递 requestId
  - REST handler：通过 request.locals 或等价机制传递
  - Agent/模型调用：通过参数传递 requestId
  - Step events：每个事件包含 requestId
- Files（建议）:
  - apps/api/src/middleware/request-id.ts（Fastify 插件）
  - packages/core/src/context/request-context.ts（请求上下文类型）
- Requirements:
  - 入站请求必须在最早阶段注入 requestId
  - requestId 必须贯穿整个请求生命周期
  - 所有异步调用必须携带 requestId

3) 定义结构化日志字段规范
- Scope:
  - 必含字段：timestamp/level/requestId/message
  - 可选字段：tenantId/projectId/taskId/sessionId/userId
  - 上下文字段：service/module/function
  - 性能字段：duration/ttft（若适用）
- Files（建议）:
  - packages/core/src/logger/types.ts
- Requirements:
  - 所有日志必须包含 requestId
  - 日志格式必须为 JSON（便于解析）
  - 日志级别必须规范：debug/info/warn/error

4) 实现结构化日志工具
- Scope:
  - 选择日志库：pino（推荐，高性能）或 winston
  - 实现日志工具类/函数
  - 集成 requestId 自动注入
- Files（建议）:
  - packages/core/src/logger/index.ts
  - packages/core/src/logger/pino-config.ts（若使用 pino）
- Requirements:
  - 日志工具必须支持结构化输出
  - 日志工具必须支持日志级别过滤
  - 日志工具必须支持自定义字段注入

5) 集成到 API 层
- Scope:
  - Fastify 日志集成（使用 Fastify 的 logger 选项）
  - GraphQL resolver 日志（在 context 中注入 logger）
  - 错误日志（捕获并记录所有错误，包含 requestId）
- Files（建议）:
  - apps/api/src/server.ts（Fastify 配置）
  - apps/api/src/graphql/context.ts（GraphQL context）
- Requirements:
  - 所有 API 请求必须自动记录入站日志
  - 所有错误必须记录完整堆栈与 requestId
  - 日志输出必须可配置（开发环境 pretty，生产环境 JSON）

6) 实现日志查询辅助
- Scope:
  - 提供按 requestId 查询日志的示例命令
  - 提供日志聚合建议（例如使用 grep/jq）
- Files（建议）:
  - docs/logging.md（日志使用文档）
- Requirements:
  - 文档必须包含按 requestId 查询的示例
  - 文档必须包含常见故障排查场景

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元测试：requestId 生成函数返回唯一 ID（运行 1000 次无重复）
  - 单元测试：结构化日志输出包含必需字段（timestamp/level/requestId/message）
  - 集成测试：触发一次最小请求（可 mock），断言日志输出包含同一个 requestId
  - 集成测试：同一 requestId 同时出现在：入站日志、至少一个业务日志（例如 GraphQL resolver 或模型调用）
  - 集成测试：错误日志包含 requestId 和完整堆栈
  - 集成测试：日志格式为有效 JSON（可被 JSON.parse 解析）

# Checklist
- [ ] requestId 生成策略实现（UUID v4 或 nanoid）
- [ ] requestId 透传机制实现（API 入站 -> GraphQL/REST -> Agent -> Events）
- [ ] 结构化日志字段规范定义（必含 requestId/timestamp/level/message）
- [ ] 结构化日志工具实现（pino 或 winston，支持 JSON 输出）
- [ ] API 层日志集成完成（Fastify + GraphQL，所有请求自动记录）
- [ ] 错误日志包含 requestId 和堆栈
- [ ] 日志查询文档完成（docs/logging.md，包含按 requestId 查询示例）
- [ ] 单元测试覆盖：requestId 唯一性、日志字段完整性
- [ ] 集成测试覆盖：requestId 贯穿、日志格式有效性

# Output
- 输出（强制包含以下内容）：
  - 实现方式说明：
    - 选择的 ID 生成方式（及原因）
    - 选择的日志库（及原因）
    - requestId 透传路径图（入站 -> 各层级）
  - 示例日志行（脱敏）：
    - 入站日志示例（包含 requestId）
    - 业务日志示例（包含 requestId + 业务字段）
    - 错误日志示例（包含 requestId + 堆栈）
  - 测试用例清单：
    - 单元测试文件路径（至少 2 个）
    - 集成测试文件路径（至少 1 个）
  - 日志查询示例：
    - 如何按 requestId 查询日志（grep/jq 命令）
    - 如何按时间范围查询日志

# 依赖关系与风险评估

## 前置依赖
- T1：工程初始化与开发工作流（必须完成，提供基础目录结构）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| pino | 高性能日志库 | 低（免费开源） | 低（成熟且广泛使用） |
| pino-pretty | 开发环境日志美化 | 低（免费开源） | 低（仅开发依赖） |
| uuid | UUID 生成 | 低（免费开源） | 低（标准库） |

## 高风险点
1. **requestId 丢失**：异步调用链路中可能丢失 requestId
   - 缓解措施：使用 AsyncLocalStorage（Node.js）或等价机制自动传递上下文
   - 备选方案：显式传递 requestId 参数（更可靠但代码侵入性强）

2. **日志性能影响**：高频日志可能影响性能
   - 缓解措施：使用 pino（异步日志，性能优秀）
   - 备选方案：生产环境提高日志级别（仅 warn/error）

3. **日志存储成本**：大量日志可能导致存储成本上升
   - 缓解措施：配置日志轮转与保留策略
   - 备选方案：使用日志聚合服务（例如 Loki/Elasticsearch）

## 回滚策略
- 若 pino 有问题：切换到 winston（更成熟但性能稍低）
- 若 AsyncLocalStorage 不稳定：改为显式传递 requestId
- 若日志量过大：提高日志级别或采样（仅记录部分请求）
```

---

### Task T4：隔离上下文（tenantId/projectId 注入与强制校验）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 0：准备/基建。
你的目标是完成任务 T4：隔离上下文（tenantId/projectId 注入与强制校验）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有隔离校验必须在 API 层强制执行（不依赖客户端）。
- 错误 message 使用英文。

# References
- requirements: specs/study-copilot/requirements.md (R26, R41)
- contracts: specs/study-copilot/design/design-contracts.md (Context Injection)
- design: specs/study-copilot/design/design-backend.md
- tasks: specs/study-copilot/tasks.md (T4)

# Execution Plan

1) 定义 RequestContext 类型
- Scope:
  - 必含字段：requestId/tenantId
  - 可选字段：projectId/userId/sessionId
  - 元数据字段：timestamp/userAgent/ip
- Files（建议）:
  - packages/core/src/context/request-context.ts
- Requirements:
  - RequestContext 必须使用 Zod schema 定义
  - tenantId 必须为必填字段（非空）
  - projectId 在需要隔离的场景下必须存在

2) 实现 RequestContext 提取与校验
- Scope:
  - 从 HTTP header 提取 tenantId/projectId（例如 X-Tenant-Id/X-Project-Id）
  - 从 JWT token 提取 tenantId/userId（若使用认证）
  - 校验 tenantId/projectId 格式与有效性
- Files（建议）:
  - apps/api/src/middleware/context-extractor.ts
  - apps/api/src/middleware/context-validator.ts
- Requirements:
  - 缺少 tenantId 必须返回 AUTH_ERROR（401 或 403）
  - 无效 tenantId 必须返回 AUTH_ERROR
  - 所有错误必须包含 requestId

3) 在 API 层强制注入 RequestContext
- Scope:
  - Fastify 插件：在请求最早阶段注入 RequestContext
  - GraphQL context：将 RequestContext 注入到 resolver context
  - REST handler：将 RequestContext 注入到 request.locals
- Files（建议）:
  - apps/api/src/plugins/request-context.ts（Fastify 插件）
  - apps/api/src/graphql/context.ts（GraphQL context 构建）
- Requirements:
  - 所有 API 请求必须经过 RequestContext 注入
  - RequestContext 必须在认证之后、业务逻辑之前注入
  - RequestContext 必须可在整个请求生命周期访问

4) 实现默认隔离策略
- Scope:
  - 数据库查询：所有读写必须带 tenantId 过滤
  - RAGFlow 检索：所有检索必须带 projectId 过滤
  - Evidence API：所有证据请求必须校验 projectId 一致性
- Files（建议）:
  - packages/core/src/db/tenant-filter.ts（数据库隔离辅助）
  - packages/core/src/adapters/ragflow/isolation.ts（RAGFlow 隔离）
  - apps/api/src/routes/evidence.ts（Evidence API 隔离校验）
- Requirements:
  - 所有数据访问必须默认带 tenantId 过滤
  - 跨 tenant 访问必须显式标注并记录审计日志
  - 跨 project 访问必须显式开关控制

5) 实现隔离校验辅助函数
- Scope:
  - assertTenantId：断言 tenantId 存在且有效
  - assertProjectId：断言 projectId 存在且有效
  - assertSameTenant：断言资源属于同一 tenant
  - assertSameProject：断言资源属于同一 project
- Files（建议）:
  - packages/core/src/context/assertions.ts
- Requirements:
  - 所有断言失败必须抛出 AUTH_ERROR
  - 所有错误必须包含 requestId 和违规原因

6) 实现审计日志
- Scope:
  - 记录所有跨 tenant/project 访问尝试
  - 记录所有隔离校验失败事件
- Files（建议）:
  - packages/core/src/audit/isolation-audit.ts
- Requirements:
  - 审计日志必须包含：requestId/tenantId/projectId/action/result
  - 审计日志必须持久化（数据库或日志文件）

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元测试：RequestContext schema 能解析合法输入
  - 单元测试：RequestContext schema 能拒绝缺少 tenantId 的输入
  - 单元测试：assertTenantId 在 tenantId 缺失时抛出 AUTH_ERROR
  - 单元测试：assertSameProject 在 projectId 不一致时抛出 AUTH_ERROR
  - 集成测试：缺少 tenantId 的请求返回 AUTH_ERROR（含 requestId）
  - 集成测试：缺少 projectId 的检索/证据请求返回 AUTH_ERROR（含 requestId）
  - 集成测试：跨 projectId 的 evidence 请求返回 AUTH_ERROR
  - 集成测试：隔离校验失败事件被记录到审计日志

# Checklist
- [ ] RequestContext 类型定义完成（requestId/tenantId 必填，projectId 可选）
- [ ] RequestContext 提取与校验实现（从 header/JWT 提取，格式校验）
- [ ] API 层强制注入完成（Fastify 插件 + GraphQL context + REST handler）
- [ ] 默认隔离策略实现（数据库/RAGFlow/Evidence API 带 tenantId/projectId 过滤）
- [ ] 隔离校验辅助函数实现（assertTenantId/assertProjectId/assertSameTenant/assertSameProject）
- [ ] 审计日志实现（记录跨 tenant/project 访问与校验失败）
- [ ] 单元测试覆盖：RequestContext schema、断言函数
- [ ] 集成测试覆盖：缺 tenantId -> AUTH_ERROR、缺 projectId -> AUTH_ERROR、跨 projectId -> AUTH_ERROR
- [ ] 审计日志可查询（至少可通过 requestId 查询）

# Output
- 输出（强制包含以下内容）：
  - RequestContext 类型定义（TypeScript + Zod schema）
  - 关键拦截点列表：
    - Fastify 插件注入点
    - GraphQL context 构建点
    - REST handler 注入点
    - 数据库查询过滤点
    - RAGFlow 检索过滤点
    - Evidence API 校验点
  - 隔离策略说明：
    - 默认隔离规则（所有读写带 tenantId）
    - 跨 tenant/project 访问策略（显式开关 + 审计）
  - 测试用例清单：
    - 单元测试文件路径（至少 2 个）
    - 集成测试文件路径（至少 1 个）
  - 审计日志示例（脱敏）

# 依赖关系与风险评估

## 前置依赖
- T1：工程初始化与开发工作流（必须完成）
- T2：共享类型与契约基线（必须完成，提供 AppError 定义）
- T3：可观测性基线（必须完成，提供 requestId 机制）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 使用已有依赖（zod/fastify） | 低 | 低 |

## 高风险点
1. **隔离策略遗漏**：某些数据访问路径可能遗漏 tenantId 过滤
   - 缓解措施：使用 ORM/查询构建器的全局钩子强制注入过滤条件
   - 备选方案：代码审查 + 集成测试覆盖所有数据访问路径

2. **性能影响**：每次请求都校验 tenantId/projectId 可能影响性能
   - 缓解措施：使用缓存（例如 Redis）缓存 tenant/project 元数据
   - 备选方案：在 JWT token 中携带 tenant/project 信息（减少查询）
3. **跨 tenant 访问需求**：未来可能需要支持跨 tenant 数据共享
    - 缓解措施：预留显式开关与审计机制
    - 备选方案：使用权限系统（RBAC/ABAC）控制跨 tenant 访问

## 回滚策略
- 若隔离策略过于严格：提供配置开关，允许在开发环境关闭隔离校验
- 若性能有问题：优化校验逻辑（例如批量校验、缓存）
- 若审计日志量过大：采样记录或仅记录失败事件
```

---

## Phase 1：核心闭环（T5-T13）

### Task T5：模板定义 Schema 与校验（含结构化输出 Schema）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T5：模板定义 Schema 与校验（含结构化输出 Schema）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有输入/输出/配置/工具参数必须用 Zod 校验。
- 错误 message 使用英文。
- TemplateRef 必须可复现（version/hash 生成 deterministic）。

# References
- requirements: specs/study-copilot/requirements.md (R1, R6)
- tasks: specs/study-copilot/tasks.md (T5)
- design: specs/study-copilot/design/design-agent.md
- contracts: specs/study-copilot/design/design-contracts.md

# Execution Plan

1) 定义 TemplateDefinition（Zod Schema）
- Scope:
  - 定义模板核心字段：prompt/systemPrompt/tools
  - 预留扩展字段：outputSchema?/workflowPolicy?/citationPolicy?/guardrailsPolicy?
  - 明确 optional/default 策略（避免运行时字段缺失）
- Files（建议）:
  - packages/core/src/contracts/template.ts
- Requirements:
  - 必填字段缺失必须被 schema 拒绝
  - 校验失败必须包含字段路径（Zod issues.path）

2) 定义 TemplateRef（用于可复现）
- Scope:
  - templateId 模式：`{ templateId, templateVersion? }`
  - templateDefinition 模式：`{ templateDefinitionHash }`
  - hash 计算规则：SHA-256 + stable JSON（key 排序、忽略 undefined）
- Files（建议）:
  - packages/core/src/contracts/template-ref.ts
  - packages/core/src/utils/stable-json.ts
  - packages/core/src/utils/hash.ts
- Requirements:
  - hash 必须 deterministic（同输入同输出）
  - hash 计算必须集中在 core，避免前后端不一致

3) 实现模板解析/校验入口
- Scope:
  - `parseTemplateDefinition(input)`：输入 -> TemplateDefinition
  - `resolveTemplateRef(input)`：根据 templateId/templateDefinition 生成 TemplateRef
  - 明确 templateId/templateDefinition 的互斥规则（二选一或明确优先级）
- Files（建议）:
  - packages/core/src/templates/parse.ts
- Requirements:
  - 校验失败返回结构化错误（英文 message + details.issues）

4) 默认模板策略
- Scope:
  - 未提供 templateId/templateDefinition 时使用 default template
- Files（建议）:
  - packages/core/src/templates/default.ts
- Requirements:
  - default template 也必须通过同一套 schema 校验

5) 测试
- Scope:
  - schema：合法/非法输入 parse 行为
  - TemplateRef：version/hash 非空
  - hash：稳定性（重复计算一致）
- Files（建议）:
  - packages/core/src/contracts/__tests__/template.test.ts
  - packages/core/src/templates/__tests__/template-ref.test.ts
- Requirements:
  - 至少 3 条可自动化断言，覆盖 happy path + 至少 2 条错误分支

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元测试：缺少 prompt/systemPrompt -> schema 拒绝，issues 含字段路径
  - 单元测试：合法 TemplateDefinition -> parse 成功；TemplateRef 的 version/hash 非空
  - 单元/属性测试：同一 TemplateDefinition 连续计算 hash 100 次 -> 结果一致
  - 错误分支：templateId/templateDefinition 规则违规 -> 返回 VALIDATION_ERROR（或等价错误码），英文 message 且 details.issues 可定位

# Checklist
- [ ] TemplateDefinition schema 定义完成（必填字段 + optional/default 策略）
- [ ] TemplateRef 定义完成（templateId/version 或 templateDefinitionHash）
- [ ] stable JSON + hash 工具实现完成（deterministic）
- [ ] parse/resolve 入口实现完成（失败返回结构化错误）
- [ ] 默认模板策略落地（缺省 fallback）
- [ ] 单元/属性测试覆盖：schema parse/reject、hash 稳定性、TemplateRef 非空

# Output
- 输出（强制包含以下内容）：
  - TemplateDefinition/TemplateRef schema 文件路径与关键字段说明
  - hash 计算规则说明（为何 deterministic）
  - 1 个校验失败示例（英文 message + details.issues）
  - 测试文件清单与断言点列表

# 依赖关系与风险评估

## 前置依赖
- T2：共享类型与契约基线（Error Model/AppError）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用 zod + Node.js crypto | 低 | 低 |

## 高风险点
1. **可复现性缺陷**：hash 不稳定导致运行记录无法复现
    - 缓解措施：稳定序列化 + 测试覆盖稳定性
2. **schema 演进破坏兼容**：旧模板无法 parse
    - 缓解措施：只增不改；必要时版本化与迁移器（后续任务）

## 回滚策略
- 若 hash 模式引发兼容问题：暂时仅启用 templateId/version，保留 hash 为可选能力

---
### Task T6：GraphQL 主干（Template/Project/Task/Session + createTask/cancelTask）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T6：GraphQL 主干（Template/Project/Task/Session + createTask/cancelTask）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有输入必须用 Zod 校验（不要仅依赖 GraphQL 类型系统）。
- 错误 message 使用英文。
- 必须贯穿 tenantId/projectId/requestId（隔离 + 可观测）。
- 必须记录可复现字段：Task/Session 包含 templateRef（version/hash）。

# References
- requirements: specs/study-copilot/requirements.md (R9, R10, R26, R41)
- tasks: specs/study-copilot/tasks.md (T6)
- contracts: specs/study-copilot/design/design-contracts.md (GraphQL draft, Error Model)
- design: specs/study-copilot/design/design-backend.md

# Execution Plan

1) 落地 GraphQL Schema（最小集合）
- Scope:
  - Query：templates/projects/tasks（按 MVP 需要裁剪字段）
  - Mutation：createTask/cancelTask
  - 定义输入输出类型（CreateTaskInput/Task/Session 等）
- Files（建议）:
  - apps/api/src/graphql/schema.graphql（或等价位置）
  - apps/api/src/graphql/resolvers/*
- Requirements:
  - schema 字段口径以 design-contracts.md 为准

2) GraphQL context 注入 RequestContext
- Scope:
  - 从 HTTP header / request locals 注入 requestId/tenantId/projectId
  - resolver 统一从 context 读取（禁止散落解析 header）
- Files（建议）:
  - apps/api/src/graphql/context.ts
- Requirements:
  - 缺 tenantId/projectId 必须返回 AUTH_ERROR（英文 message + requestId）

3) Task/Session 最小存储抽象（先 in-memory）
- Scope:
  - 定义 repo 接口（便于后续替换 DB）
  - 支持按 tenantId/projectId 过滤查询
- Files（建议）:
  - packages/core/src/repos/task-repo.ts
  - packages/core/src/repos/session-repo.ts
  - packages/core/src/repos/memory/*
- Requirements:
  - 所有读写必须带 tenantId；涉及检索/证据的资源必须带 projectId

4) 实现 createTask
- Scope:
  - 校验 tenantId/projectId
  - 校验模板引用：templateId/templateDefinition（二选一，规则与 T5 对齐）
  - 创建 Task/Session 并记录 templateRef.version/hash
- Files（建议）:
  - apps/api/src/graphql/resolvers/mutation/createTask.ts
  - packages/core/src/services/task-service.ts
- Requirements:
  - 输入错误返回 VALIDATION_ERROR
  - 隔离错误返回 AUTH_ERROR

5) 实现 cancelTask
- Scope:
  - 将 task 状态置为 cancelled（或等价终态）
  - 若 task 正在运行，触发底层取消信号（与后续 T8/T9 对齐）
- Files（建议）:
  - apps/api/src/graphql/resolvers/mutation/cancelTask.ts
  - packages/core/src/services/cancel-service.ts
- Requirements:
  - cancel 必须幂等（重复调用不报错）

6) 测试（集成优先）
- Scope:
  - createTask 返回 taskId
  - 查询 task/session 可得到 templateRef
  - cancelTask 导致状态变化
- Files（建议）:
  - tests/integration/graphql.createTask.test.ts
  - tests/integration/graphql.cancelTask.test.ts
- Requirements:
  - 至少 3 条可自动化断言 + 至少 2 条错误分支

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 集成测试：createTask 成功返回 taskId（非空）
  - 集成测试：task/session 中 templateRef.version/hash 非空
  - 集成测试：cancelTask 后状态为 cancelled（或等价），重复 cancel 幂等
  - 错误分支：缺 tenantId 或 projectId -> AUTH_ERROR（含 requestId）
  - 错误分支：templateId/templateDefinition 规则违规 -> VALIDATION_ERROR（英文 message + issues）

# Checklist
- [ ] GraphQL schema 完成（Query templates/projects/tasks）
- [ ] GraphQL schema 完成（Mutation createTask/cancelTask）
- [ ] GraphQL context 注入 RequestContext（requestId/tenantId/projectId）
- [ ] Task/Session repo 抽象完成（支持 in-memory 实现）
- [ ] createTask 实现：隔离校验 + 模板输入校验 + 记录 templateRef
- [ ] cancelTask 实现：状态变更 + 幂等 + 预留底层取消
- [ ] 集成测试覆盖：happy path + 2 类错误分支

# Output
- 输出（强制包含以下内容）：
  - GraphQL schema 文件路径与核心类型说明
  - createTask/cancelTask 的输入校验规则说明
  - Task/Session 的可复现字段说明（templateRef）
  - 测试文件清单与断言点列表

# 依赖关系与风险评估

## 前置依赖
- T4：隔离上下文（tenantId/projectId 注入与强制校验）
- T5：模板定义 Schema 与校验（TemplateRef/hash 规则）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有 GraphQL/Fastify 依赖 | 低 | 低 |

## 高风险点
1. **隔离遗漏**：查询/写入未带 tenantId/projectId
    - 缓解措施：repo 层强制要求 ctx；集成测试覆盖跨 projectId 拒绝
2. **schema 与契约不一致**：前端无法按约定消费
    - 缓解措施：严格对齐 design-contracts.md；后续用契约测试（T17）阻断回归

## 回滚策略
- 若实现复杂度过高：先最小化字段集与 in-memory repo，后续再扩展字段与持久化

---
### Task T7：Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T7：Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有 runtime config 必须经 Zod 校验。
- 错误 message 使用英文。
- 引用合规：禁止伪造 citations；citationId 必须可映射回 Evidence。
- 必须支持 MockLanguageModel，保证测试可重复。

# References
- requirements: specs/study-copilot/requirements.md (R1, R2, R6, R7, R15)
- tasks: specs/study-copilot/tasks.md (T7)
- design: specs/study-copilot/design/design-agent.md
- contracts: specs/study-copilot/design/design-contracts.md

# Execution Plan

1) runtime config 构建
- Scope:
  - templateId/templateDefinition -> TemplateDefinition（复用 T5 的 parse/resolve 入口）
  - TemplateDefinition -> runtime config（模型/工具/策略/structured output 配置）
- Files（建议）:
  - packages/core/src/agent/runtime-config.ts
- Requirements:
  - runtime config 必须可序列化（便于记录与复现）

2) wrapLanguageModel 中间件链
- Scope:
  - 中间件顺序执行（onion 模型）
  - 支持短路（例如 guardrails 拦截）
- Files（建议）:
  - packages/core/src/agent/wrap-language-model.ts
- Requirements:
  - 顺序必须 deterministic

3) MockLanguageModel
- Scope:
  - 可控输出/错误/延迟
  - 覆盖 streaming 与非 streaming（按现有实现选择）
- Files（建议）:
  - packages/core/src/llm/mock-language-model.ts
- Requirements:
  - mock 行为必须稳定可复现（不引入随机）

4) guardrails hook（预留/接入点）
- Scope:
  - 输入/工具调用/输出阶段可插入 guardrails
  - 触发时阻断并产出可观测事件/日志
- Files（建议）:
  - packages/core/src/guardrails/guardrails.ts
  - packages/core/src/agent/hooks.ts
- Requirements:
  - 触发时返回 GUARDRAIL_BLOCKED（或等价），retryable=false

5) 引用合规校验
- Scope:
  - 输出包含 citations 时：必须可映射回 EvidenceProvider
  - 不可映射或跨 projectId：视为 CONTRACT_VIOLATION
- Files（建议）:
  - packages/core/src/citations/validate-citations.ts
  - packages/core/src/providers/evidence-provider.ts
- Requirements:
  - 禁止“编造 citationId”；错误必须包含 requestId

6) structured output 策略（为后续任务铺垫）
- Scope:
  - 当提供 outputSchema：支持 schema 校验 + self-correction（重试上限可配置）
- Files（建议）:
  - packages/core/src/agent/structured-output.ts
- Requirements:
  - 超过重试次数返回结构化错误（英文 message）

7) 测试
- Scope:
  - 属性测试：中间件顺序不变性（onion）
  - 单元：schema 不匹配触发重试；超限返回错误
  - 单元：guardrails 可稳定阻断
  - 单元：引用合规（可映射成功/不可映射失败）
- Files（建议）:
  - packages/core/src/agent/__tests__/wrap-language-model.test.ts
  - packages/core/src/agent/__tests__/structured-output.test.ts
  - packages/core/src/citations/__tests__/validate-citations.test.ts
- Requirements:
  - 至少 3 条可自动化断言 + 覆盖至少 2 个错误分支

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 属性/单元测试：中间件链顺序执行且符合 onion 预期
  - 单元测试：outputSchema 不匹配触发重试；超限返回结构化错误（英文 message）
  - 单元测试：guardrails 触发 -> 返回 GUARDRAIL_BLOCKED 且 retryable=false，并可观测到原因
  - 单元测试：citations 可映射 -> 通过；不可映射 -> CONTRACT_VIOLATION

# Checklist
- [ ] runtime config 构建完成（模板 -> runtime config）
- [ ] wrapLanguageModel 中间件链完成（顺序执行 + 允许短路）
- [ ] MockLanguageModel 完成（可控输出/错误/延迟）
- [ ] guardrails hook 预留并可阻断输出（可观测）
- [ ] 引用合规校验完成（不可映射/跨 projectId -> CONTRACT_VIOLATION）
- [ ] structured output 重试策略完成（超限 -> 结构化错误）
- [ ] 自动化测试覆盖核心路径（中间件/重试/guardrails/引用合规）

# Output
- 输出（强制包含以下内容）：
  - Agent Proxy 核心文件路径清单
  - runtime config 字段说明（与模板字段映射关系）
  - 错误码与触发条件说明（GUARDRAIL_BLOCKED/CONTRACT_VIOLATION/VALIDATION_ERROR）
  - 测试文件清单与断言点列表

# 依赖关系与风险评估

## 前置依赖
- T2：共享契约（Error/Citation/Evidence/Events）
- T5：模板 schema 与 TemplateRef

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 优先复用现有模型 SDK | 低 | 低 |

## 高风险点
1. **引用合规实现不严谨**：可能出现“有 citation 但 Evidence 查不到”
    - 缓解措施：校验做成硬门禁；配合契约测试阻断回归
2. **中间件链调试困难**
    - 缓解措施：统一 requestId/stepId 日志字段；必要时输出 StepEvent（与 T9 对齐）

## 回滚策略
- 若 structured output 重试导致不稳定：提供开关关闭重试，仅返回校验失败错误

---
### Task T8：Streaming Endpoint：Vercel AI Data Stream Protocol 输出

```markdown
# Context
 你是 Niche/Study Copilot 的 负责落地与验收的工程师。
 你正在执行 Phase 1：核心闭环。
 你的目标是完成任务 T8：Streaming Endpoint：Vercel AI Data Stream Protocol 输出。

 # 全局约束与标准
 - TypeScript Strict；禁止 any。
 - 所有请求体/查询参数必须用 Zod 校验。
 - 错误 message 使用英文。
 - 输出必须严格遵循 Vercel AI Data Stream Protocol v1（headers + framing）。
 - streaming error 必须转换为可解析的 error block（可被 AppError schema parse）。
 - 必须支持取消（客户端断开/显式 cancel -> server abort 底层请求）。
 
 # References
 - requirements: specs/study-copilot/requirements.md (R4, R10)
 - tasks: specs/study-copilot/tasks.md (T8)
 - contracts: specs/study-copilot/design/design-contracts.md (Streaming Protocol, Error Model)
 
 # Execution Plan
 
 1) 定义请求输入 schema（Zod）
 - Scope:
   - 设计 `POST /api/stream` 的请求体：taskId/sessionId/messages/templateRef/options
   - 校验 requestId/tenantId/projectId 注入已生效（与 T4 对齐）
 - Files（建议）:
   - apps/api/src/routes/stream.ts
   - packages/core/src/contracts/stream.ts
 - Requirements:
   - 所有字段必须有清晰的 optional/default 规则
 
 2) 实现 stream 输出（协议 v1）
 - Scope:
   - 设置响应 headers：`X-Vercel-AI-Data-Stream: v1` + `Content-Type: text/plain; charset=utf-8`
   - 使用统一 encoder 输出：token、data parts（包含 step events / error block 等）
 - Files（建议）:
   - apps/api/src/routes/stream.ts
   - packages/core/src/utils/stream/encoder.ts
 - Requirements:
   - 任意输出都必须可被 decoder 完整解析（测试断言）
 
 3) TTFT 与总耗时可观测
 - Scope:
   - 记录 TTFT（time to first token）与 total duration
   - 与 requestId/taskId 关联（日志字段一致）
 - Files（建议）:
   - apps/api/src/routes/stream.ts
   - packages/core/src/logger/*（若已存在）
 - Requirements:
   - 日志 message 英文；字段可中文注释（如有）
 
 4) 错误块与取消
 - Scope:
   - 捕获异常并转换为 error block（AppError：code/message/retryable/requestId/details）
   - 客户端断开或 cancel：触发 AbortController abort 底层 provider
 - Files（建议）:
   - apps/api/src/routes/stream.ts
   - packages/core/src/contracts/error.ts
 - Requirements:
   - cancel 必须可在测试中观测到（mock/spy）
 
 5) 协议 decoder（用于测试）
 - Scope:
   - 实现/补齐 decoder：将响应文本解析为 parts（token/event/error）
 - Files（建议）:
   - packages/core/src/utils/stream/decoder.ts
 - Requirements:
   - decoder 必须严格（非法输入直接报错），用于阻断回归
 
 6) 测试（集成为主）
 - Scope:
   - parseability：请求 `/api/stream` 能持续收到数据流，且可被 decoder 完整解析
   - error block：mock provider 抛错 -> 返回可识别 error block，且可 parse 为 AppError
   - cancel：模拟客户端断开/Abort -> server 侧 abort 底层 provider
   - TTFT：至少一次调用可观测 TTFT 被记录（日志或 metrics 任一）
 - Files（建议）:
   - tests/integration/stream.endpoint.test.ts
 - Requirements:
   - 至少 3 条可自动化断言，覆盖 happy path + 至少 2 个错误/取消分支
 
 # Verification
 - 自动化断言（至少覆盖以下断言）：
   - 集成测试：`POST /api/stream` 返回的 stream 可被 decoder 完整解析
   - 集成测试：mock provider 抛错 -> 返回 error block，且可 parse 为 AppError（含 code/message/retryable/requestId）
   - 集成测试：触发取消 -> 底层 provider 被 abort（mock/spy 断言）
   - 集成测试：TTFT 与总耗时至少在日志/metrics 中可观测（含 requestId/taskId）
 
 # Checklist
 - [ ] `POST /api/stream` 请求体 schema 校验完成（Zod）
 - [ ] 响应 headers 与 framing 严格符合 Data Stream Protocol v1
 - [ ] stream encoder/decoder 完成（core 可复用）
 - [ ] error block 转换完成（可被 AppError schema parse）
 - [ ] cancel/断开连接可触发 AbortController，且可被测试观测
 - [ ] TTFT 与总耗时可观测（与 requestId 关联）
 - [ ] 集成测试覆盖：parseability / error block / cancel / TTFT
 
 # Output
 - 输出（强制包含以下内容）：
   - 路由实现文件路径 + 请求/响应 schema 摘要
   - encoder/decoder 文件路径 + 解析示例
   - 测试断言点清单（parse/error/cancel/ttft）
 
 # 依赖关系与风险评估
 
 ## 前置依赖
 - T2：Streaming/Error 契约
 - T4：RequestContext 注入（requestId/tenantId/projectId）
 - T7：Agent Proxy（或至少可 mock 的 provider 调用链）
 
 ## 新增依赖
 | 依赖名 | 用途 | 成本评估 | 风险 |
 |--------|------|---------|------|
 | 无新增 | 复用现有依赖 | 低 | 低 |
 
 ## 高风险点
 1. **协议理解偏差**：前端无法解析 stream
    - 缓解措施：decoder 驱动的集成测试阻断回归
 2. **取消不生效**：底层 provider 仍在跑导致资源浪费
    - 缓解措施：强制接入 AbortController；测试用 spy 断言 abort 被调用
 
 ## 回滚策略
 - 若协议实现不稳定：先仅输出 token（最小可用），暂缓 data parts/events，保留开关
 ```

---
### Task T9：Step Events：事件模型与发射策略

```markdown
# Context
 你是 Niche/Study Copilot 的 负责落地与验收的工程师。
 你正在执行 Phase 1：核心闭环。
 你的目标是完成任务 T9：Step Events：事件模型与发射策略。

 # 全局约束与标准
 - TypeScript Strict；禁止 any。
 - StepEvent 必须使用 Zod schema 作为单一事实源。
 - 错误 message 使用英文。
 - `tool_called` 的参数摘要必须脱敏（不泄露 token/apiKey/secret 等）。
 - 事件必须可通过 stream 通道被前端区分与消费（MVP 先实现同通道策略）。

 # References
 - requirements: specs/study-copilot/requirements.md (R5)
 - tasks: specs/study-copilot/tasks.md (T9)
 - contracts: specs/study-copilot/design/design-contracts.md (Step Events Schema)
 - design: specs/study-copilot/design/design-frontend.md（Normalizer 思路）

 # Execution Plan
 
 1) 定义事件契约（或对齐已有契约）
 - Scope:
   - 事件类型：step_started/step_progress/tool_called/tool_result/step_completed/step_failed
   - 基础字段：type/stepId/taskId/requestId/timestamp/payload
 - Files（建议）:
   - packages/core/src/contracts/events.ts
 - Requirements:
   - schema 必须覆盖所有事件类型（discriminated union）
 
 2) 脱敏策略
 - Scope:
   - 实现 `sanitizeArgsSummary(input)`：仅保留白名单字段或对敏感字段打码
   - 在 tool_called 事件中仅允许输出 argsSummary（禁止原始 args）
 - Files（建议）:
   - packages/core/src/utils/sanitize.ts
 - Requirements:
   - 测试必须断言输出不包含 token/apiKey/secret 等关键词
 
 3) 发射策略与通道
 - Scope:
   - 选择 MVP：同通道（Vercel AI Data Stream 的 data part，例如 `data-step-event`）
   - 定义区分规则：token vs event（前端如何识别）
 - Files（建议）:
   - packages/core/src/utils/stream/encoder.ts
   - apps/api/src/routes/stream.ts（发射点）
 - Requirements:
   - 每条事件必须包含 requestId/taskId/stepId/timestamp
 
 4) 取消与稳定态
 - Scope:
   - cancel 后不再产生新的 StepEvent
   - 任务状态进入 cancelled（可重试）
 - Files（建议）:
   - packages/core/src/services/cancel-service.ts
 - Requirements:
   - 取消路径必须在集成测试中可验证
 
 5) 测试
 - Scope:
   - 单元：任意 StepEvent 可被 schema parse；step_failed.error 可被 AppError schema parse
   - 单元：tool_called.argsSummary 已脱敏
   - 集成：跑一次最小任务，至少出现 3 类事件且字段齐全
   - 集成：取消后停止事件输出，task 进入 cancelled
 - Files（建议）:
   - packages/core/src/contracts/__tests__/events.test.ts
   - tests/integration/step-events.test.ts
 - Requirements:
   - 至少 3 条可自动化断言 + 覆盖取消分支
 
 # Verification
 - 自动化断言（至少覆盖以下断言）：
   - 单元测试：6 种事件类型均可被 StepEvent schema parse
   - 单元测试：tool_called.argsSummary 脱敏（断言输出不包含敏感字段）
   - 集成测试：最小任务至少出现 step_started/tool_called/step_completed 三类事件，且每条均含 requestId/taskId/stepId/timestamp
   - 集成测试：取消任务后不再产生新的 StepEvent，且任务状态为 cancelled（或等价）
 
 # Checklist
 - [ ] StepEvent schema 完成（6 种事件类型 + payload）
 - [ ] 脱敏工具完成（sanitizeArgsSummary）
 - [ ] 通道策略落地（同通道 data-step-event）
 - [ ] 前端区分规则定义清晰（token vs event）
 - [ ] 集成测试：最小任务出现 3 类事件且字段齐全
 - [ ] 集成测试：cancel 后停止事件输出并进入 cancelled
 
 # Output
 - 输出（强制包含以下内容）：
   - 事件契约文件路径 + 每类事件 payload 摘要
   - 事件发射点列表
   - 3 类事件示例（脱敏，含 requestId/taskId/stepId/timestamp）
   - 通道策略说明 + 前端区分规则
   - 测试文件清单与断言点列表
 
 # 依赖关系与风险评估
 
 ## 前置依赖
 - T2：Events/Error 契约
 - T8：Streaming Endpoint（事件需要可发射的通道）
 
 ## 新增依赖
 | 依赖名 | 用途 | 成本评估 | 风险 |
 |--------|------|---------|------|
 | 无新增 | 复用现有依赖 | 低 | 低 |
 
 ## 高风险点
 1. **事件泄露敏感信息**：tool args 未脱敏
    - 缓解措施：只输出 argsSummary；测试断言敏感字段不存在
 2. **前端无法区分事件与 token**
    - 缓解措施：明确 part.type；写集成测试用 decoder 断言可区分
 
 ## 回滚策略
 - 若事件通道不稳定：先关闭事件发射（feature flag），保留契约与发射点
```
