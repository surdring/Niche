# Study Copilot - Tasks

## Overview

### 总目标
将 Study Copilot 的核心闭环落地为可交付工程：
- 模板选择/校验 -> 任务创建 -> Agent 工作流编排 -> RAG 检索增强 -> 流式输出 + 中间步骤事件 -> 引用溯源/证据展示 -> 导出。

### 范围与里程碑

- MVP（优先交付）覆盖：R1-R7、R9-R15、R20-R21、R26、R41。
- Backlog（不阻塞 MVP，但在任务清单中给出规划）：R8、R16-R19、R22-R25、R27、R28-R40。

建议里程碑：
- M0（基建就绪）：开发环境、契约基线、requestId/tenantId/projectId 上下文贯穿。
- M1（最小闭环）：模板启动 -> createTask -> stream/events -> citations -> evidence -> UI 展示。
- M2（可用性提升）：可靠性/降级/缓存、可观测性完善、测试体系。
- M3（Backlog 扩展）：研究增强、评估/反馈、深度解析等。

## Traceability (R# -> T#)

### MVP
- R1: T5, T6, T7
- R2: T7
- R3: T12, T13
- R4: T8, T12, T17
- R5: T9, T12, T17
- R6: T5, T7, T17
- R7: T7, T15, T19
- R9: T6
- R10: T1, T6, T8, T11
- R11: T3, T20, T21
- R12: T15
- R13: T16
- R14: T14
- R15: T7
- R20: T10, T17
- R21: T10, T11, T12, T17
- R26: T4, T6, T11
- R41: T4, T6, T10, T11

### Backlog
- R8: T22
- R16: T25
- R17: T26
- R18: T27
- R19: T23, T24
- R22: T28
- R23: T29
- R24: T30
- R25: T31
- R27: T32
- R28: T33
- R29: T34
- R30: T35
- R31: T36
- R32: T37
- R33: T38
- R34: T39
- R35: T40
- R36: T41
- R37: T42
- R38: T43
- R39: T44
- R40: T45

## Tasks

### 阶段 0：准备/基建

#### T1 ✅ - 工程初始化与开发工作流
- 关联需求：R10
- 依赖：无
- 产出/变更点：
  - 初始化项目结构与依赖管理（Node/TS、包管理器、目录约定）。
  - 初始化基础脚本：dev、build、test、lint。
  - 建立本地环境变量模板与最小配置加载方式。
- Done criteria：
  - 开发者可一条命令启动本地开发（至少能跑起占位服务/页面）。
  - CI（或本地）可执行 lint/test/build（哪怕是空用例）。

#### T2 ✅ - 共享类型与契约基线（GraphQL/REST/Events）
- 关联需求：R4, R5, R6, R10, R21
- 依赖：T1
- 产出/变更点：
  - 将 `design/design-contracts.md` 中的核心模型落到代码侧的共享类型（DTO/Schema）。
  - 为 streaming error block、StepEvent、Citation 等建立可复用的序列化/反序列化层。
- Done criteria：
  - 前后端可复用同一套类型/Schema（至少在一个包/目录中统一维护）。
  - 具备最小契约测试样例（见 T17）可运行。

#### T3 ✅ - 可观测性基线：requestId 贯穿 + 结构化日志
- 关联需求：R11
- 依赖：T1
- 产出/变更点：
  - 生成/透传 `requestId`（后端入站 -> 模型调用 -> 工具调用 -> events/stream 输出）。
  - 结构化日志字段规范（至少包含 requestId、taskId/sessionId、tenantId/projectId）。
- Done criteria：
  - 任意一次任务执行能通过 requestId 在日志中串起来。

#### T4 ✅ - 隔离上下文：tenantId/projectId 注入与强制校验
- 关联需求：R26, R41
- 依赖：T1
- 产出/变更点：
  - 定义请求级上下文对象：`requestId`, `tenantId`, `projectId?`。
  - 在 GraphQL Resolver、REST endpoint、RAGFlow adapter、Evidence API 等统一强制校验/过滤。
- Done criteria：
  - 不带 tenantId 的请求被拒绝（或走明确的 dev-mode 策略）。
  - 跨 projectId 的检索/证据请求默认拒绝或要求显式开关（满足 R41 的策略约束）。

### 阶段 1：核心闭环（M1）

#### T5 ✅ - 模板定义 Schema 与校验（含结构化输出 Schema）
- 关联需求：R1, R6
- 依赖：T2
- 产出/变更点：
  - 定义 TemplateDefinition 的结构（prompt/tools/output schema/workflow policy/citation policy 等）。
  - 实现 Zod 校验与错误返回（结构化错误）。
  - 默认模板策略（未指定 template 时的 fallback）。
- Done criteria：
  - `templateDefinition` 校验失败时返回可定位字段的结构化错误。
  - 默认模板可用且可配置。

#### T6 ✅ - GraphQL 主干：Template/Project/Task/Session 最小模型
- 关联需求：R9, R10, R26, R41
- 依赖：T4, T5
- 产出/变更点：
  - GraphQL schema（最小可用）：templates、projects、tasks、createTask、cancelTask。
  - createTask 负责：校验模板、创建 task/session、记录审计信息（按设计的最小集合）。
  - 数据层可先内存/文件实现（若允许），但需为后续持久化留接口。
- Done criteria：
  - 前端能通过 createTask 获得 taskId 并进入执行流程。
  - tenantId/projectId 默认生效。

#### T7 ✅ - Agent Proxy 最小实现：运行时配置构建 + wrapLanguageModel 链
- 关联需求：R1, R2, R6, R7, R15
- 依赖：T5, T6
- 产出/变更点：
  - 模板解析 -> runtime config 构建（prompt/tools/schema/retry/fallback）。
  - wrapLanguageModel 中间件链：支持注入系统提示、MockModel、短路、错误处理。
  - guardrails hook：支持在输入/工具调用/输出阶段注入可配置的 guardrails 扫描与阻断。
  - 结构化输出通路：`streamObject/generateObject` 与 self-correction 策略。
- Done criteria：
  - 可以跑通一个“无需检索”的最小模板任务，并稳定输出。
  - guardrails 在至少 1 个可控用例下可阻断输出，并产生可观测事件。
  - 当 schema 校验失败时可触发自我修正并最终返回结构化错误（若失败）。

#### T8 ✅ - Streaming Endpoint：Vercel AI Data Stream Protocol 输出
- 关联需求：R4, R10
- 依赖：T7, T3
- 产出/变更点：
  - `POST /api/stream`（或等价）建立流式连接。
  - 将模型输出按 Data Stream Protocol 输出，并包含阶段标记（用于 UI 分段）。
  - 记录 TTFT（Time To First Token）与总耗时，并通过日志/指标与 requestId 关联。
  - 支持取消：客户端断开/用户 cancel -> 取消底层模型请求。
- Done criteria：
  - 前端可稳定消费 stream，并在 UI 看到增量输出。
  - 流式错误可被前端识别并展示。
  - 在一次真实/模拟的流式调用中可观测到 TTFT 指标（日志或 metrics 任一即可）。

#### T9 ✅ - Step Events：事件模型与发射策略
- 关联需求：R5
- 依赖：T7, T2
- 产出/变更点：
  - 定义 StepEvent 并在 Agent 执行过程中发射（step_started/tool_called/tool_result/step_completed/step_failed）。
  - 脱敏规则：tool_called 参数摘要必须脱敏。
  - 明确 events 通道策略：与 stream 同通道或双通道（先实现一种）。
- Done criteria：
  - UI 能看到至少 3 类事件（开始/工具调用/完成）。
  - 事件包含 requestId、taskId、stepId。
  - 用户取消任务后，事件流与任务状态能进入“可恢复/可重试”的稳定状态（前端可重新发起运行）。

#### T10 ✅ - RAGFlow Adapter：检索 + 引用字段映射
- 关联需求：R20, R21, R41
- 依赖：T4, T7
- 产出/变更点：
  - 实现 RAGFlow 检索适配器：输入 query/filters -> 输出 chunks + citations。
  - 字段映射落到统一 Citation 模型。
  - 默认携带 projectId 过滤，跨 Project 需显式开关与标注。
- Done criteria：
  - 端到端任务能返回 citations（即使为模拟数据也要符合契约）。
  - 当 RAGFlow 字段缺失时有可解释降级策略（至少日志+降级标记）。

#### T11 ✅ - Evidence API：citationId -> 证据展示数据
- 关联需求：R21, R41, R10
- 依赖：T10, T4
- 产出/变更点：
  - `GET /api/evidence?citationId=...` 返回证据展示所需字段（来源、定位信息、snippet 可选）。
  - projectId 隔离校验。
- Done criteria：
  - UI 点击引用可拉取证据并展示。
  - 无权限/跨 Project 明确返回结构化错误。

#### T12 ✅ - UI：模板选择/运行/steps/citations 的最小可用实现
- 关联需求：R3, R4, R5, R21
- 依赖：T6, T8, T9, T10, T11
- 产出/变更点：
  - Template Picker、Task Runner、输出区（stream 渲染）、Step Timeline、Citation Panel。
  - 错误提示与重试入口（至少针对网络/流式错误）。
- Done criteria：
  - 跑通 Flow 1-3（见 design-overview）。
  - 引用点击可打开证据侧栏/弹层。
  - 键盘可完成核心流程（模板选择 -> 启动 -> 聚焦输出/步骤 -> 打开引用证据）。
  - 响应式布局在常见断点下可用（移动端/桌面端不遮挡核心交互）。
  - 首屏加载与任务运行状态反馈明确（loading/empty/error/cancelled 状态齐全）。

#### T13 ✅ - 导出：Markdown/Obsidian 友好格式
- 关联需求：R3
- 依赖：T12
- 产出/变更点：
  - 导出格式定义：正文 + 引用元数据保留策略。
  - 导出预览与导出结果反馈。
- Done criteria：
  - 用户可导出一份包含引用信息的 Markdown 文件（或等价内容）。

### 阶段 2：可靠性/性能/成本（M2）

#### T14 ✅ - Provider 与多模型路由（最小可用策略）
- 关联需求：R14
- 依赖：T7
- 产出/变更点：
  - 抽象 Provider adapter。
  - 路由策略：按任务复杂度/配置选择模型。
  - 记录基本成本/延迟指标。
- Done criteria：
  - 可在配置中切换 provider 或模型而不改业务逻辑。

#### ✅ T15 - 降级/重试/错误模型统一 + Guardrails 接入
- 关联需求：R7, R12
- 依赖：T3, T7, T8
- 产出/变更点：
  - AppError 统一模型（GraphQL/REST/stream/error block）。
  - provider 超时/不可用的降级策略与自动切换。
  - guardrails：输入/输出扫描、阻断与安全事件记录。
- Done criteria：
  - 主 provider 故障时可回退并产生清晰日志与用户可读提示。
  - guardrails 触发时能阻断并返回可解释原因。

#### T16 ✅ - 缓存：响应缓存与缓存标记
- 关联需求：R13
- 依赖：T7, T10
- 产出/变更点：
  - 定义缓存 key/TTL/LRU 策略。
  - 命中时在响应中标记缓存来源。
- Done criteria：
  - 可观测到缓存命中率指标或日志。
  - 至少一条场景能稳定命中缓存并减少模型调用。

### 阶段 3：测试与质量

#### T17 ✅ - 契约测试：stream/events/citation/ragflow 映射
- 关联需求：R4, R5, R21, R20
- 依赖：T2, T8, T9, T10
- 产出/变更点：
  - stream protocol：成功块/错误块/取消。
  - events schema：字段完整性与脱敏断言。
  - citation/evidence：字段映射与 projectId 隔离断言。
- Done criteria：
  - CI/本地可一键跑契约测试。
  - RAGFlow 字段变更能通过测试及时发现回归。

#### T18 - 端到端测试：模板启动 -> 运行 -> 引用 -> 导出
- 关联需求：R1, R3, R4, R5, R21
- 依赖：T12, T13
- 产出/变更点：
  - E2E 用例覆盖 Flow 1-4。
  - 基础可重复的测试数据/Mock。
- Done criteria：
  - E2E 在本地/CI 可稳定通过。

#### T19 - 安全与合规测试：注入/越狱/伪造引用
- 关联需求：R7
- 依赖：T15
- 产出/变更点：
  - 注入/越狱用例库。
  - “禁止伪造引用”的回归用例。
- Done criteria：
  - guardrails 关键策略有自动化回归保障。

### 阶段 4：发布与运维

#### T20 - CI/CD 与发布检查清单
- 关联需求：R11
- 依赖：T17, T18
- 产出/变更点：
  - CI 流水线：lint/test/build。
  - 发布检查清单：环境变量、RAGFlow 配置、日志/告警开关。
- Done criteria：
  - 主分支合入具备最小质量门禁。

#### T21 - 运行手册与故障排查指引
- 关联需求：R11
- 依赖：T20
- 产出/变更点：
  - 常见故障：provider 超时、RAGFlow 不可用、citation 降级。
  - 通过 requestId 追踪的排查路径。
- Done criteria：
  - 新同学可按文档完成本地启动与问题定位。

### Backlog（规划，不阻塞 MVP）

#### T22 - 多模态输入（拍题/OCR/语音）
- 关联需求：R8
- 依赖：T12
- 产出/变更点：
  - 图片/音频输入通路与模型选择策略。
- Done criteria：
  - 至少支持一种多模态输入（优先图片）并完成端到端演示。
  - 输入失败/不支持格式时返回可解释错误，并可重试。

#### T23 - 数据处理管道（清洗/脱敏/增强）
- 关联需求：R19
- 依赖：T10
- 产出/变更点：
  - 文档清洗、PII 替换、结构化输出。
- Done criteria：
  - 对至少一种文档格式完成可重复的数据处理（同输入重复处理结果一致或等价）。
  - 至少包含 1 个自动化测试用例覆盖：清洗/脱敏的关键规则。

#### T24 - OCR 支持（图片与扫描 PDF）
- 关联需求：R19
- 依赖：T23
- 产出/变更点：
  - 支持对图片与扫描 PDF 进行文字识别（OCR），将识别结果作为可摄入文本进入后续管道。
  - OCR 失败/低置信度时提供可解释降级（例如提示用户重新拍摄/上传更清晰版本）。
- Done criteria：
  - 给定至少 1 个图片样例与 1 个扫描 PDF 样例，可稳定产出文本并进入摄入/检索链路（可使用 mock）。
  - 具备最小自动化测试：OCR 输出非空、编码正确、错误分支可解释。

#### T25 - 插件化架构落地
- 关联需求：R16
- 依赖：T7
- 产出/变更点：
  - 插件接口与生命周期。
- Done criteria：
  - 以示例插件验证“无需改核心代码即可扩展”（至少完成 1 项：注册 1 个 Tool 或注入 1 个 Prompt/Policy）。
  - 插件可在运行时启用/禁用，并有最小自动化测试覆盖加载与生效。

#### T26 - 配置管理系统
- 关联需求：R17
- 依赖：T1
- 产出/变更点：
  - 环境隔离、热更新、审计。
- Done criteria：
  - 配置缺失能阻断启动并给出明确提示。
  - 配置变更有审计记录且可回溯（至少保留时间、操作者、变更摘要）。

#### T27 - CLI 工具
- 关联需求：R18
- 依赖：T26
- 产出/变更点：
  - 初始化、评估、调试、数据导入导出等命令。
- Done criteria：
  - 至少 2 个核心命令可用并有帮助信息。
  - CLI 命令返回码与错误输出符合约定（失败非 0，错误信息可定位）。

#### T28 - 反馈收集机制
- 关联需求：R22
- 依赖：T12
- 产出/变更点：
  - 评分/标注入口与存储。
- Done criteria：
  - 可从一次任务结果收集反馈并可检索。
  - 反馈记录可关联 taskId/templateId（至少其一）以支持后续分析。

#### T29 - 提示词管理系统
- 关联需求：R23
- 依赖：T5
- 产出/变更点：
  - 版本化、A/B、热更新。
- Done criteria：
  - 同一模板可维护多个版本并可切换。
  - 任一版本回滚不影响已完成任务的可复现性（运行记录可定位到版本号）。

#### T30 - 评估框架
- 关联需求：R24
- 依赖：T29
- 产出/变更点：
  - 数据集、报告、回归检测、LLM-as-a-Judge。
- Done criteria：
  - 能对至少 1 个场景输出评估报告。
  - 评估结果可导出为结构化格式（JSON/CSV 任一即可）。

#### T31 - 合成数据生成
- 关联需求：R25
- 依赖：T30
- 产出/变更点：
  - QA Pairs 生成与质量控制。
- Done criteria：
  - 生成数据可直接被评估框架消费。
  - 生成数据包含最小质量检查（字段完整性/去重/格式校验）。

#### T32 - 多租户与配额管理
- 关联需求：R27
- 依赖：T4
- 产出/变更点：
  - 配额、计费、Key 管理。
- Done criteria：
  - 可对租户配置限额并在超限时限流/阻断。
  - 至少 1 个自动化测试覆盖：超限必阻断且返回结构化错误。

### Research Copilot 扩展（规划，不阻塞 MVP）

#### T33 - PDF 结构化解析与页码级引用溯源
- 关联需求：R28
- 依赖：T10, T11
- 产出/变更点：
  - 对 PDF 的解析/摄入流程补充页码级元数据，引用可携带 page 信息。
- Done criteria：
  - 引用证据展示至少包含页码定位信息；页码缺失时有可解释降级。

#### T34 - 联网实时搜索并入库
- 关联需求：R29
- 依赖：T10
- 产出/变更点：
  - 支持联网搜索并将结果沉淀到资料库（可配置开关与合规降级）。
- Done criteria：
  - 至少 1 条搜索结果可被入库并可被后续检索命中。

#### T35 - 研究项目工作台
- 关联需求：R30
- 依赖：T12
- 产出/变更点：
  - 研究项目视图：课题/资料/结论/待办的组织与浏览。
- Done criteria：
  - 可创建/打开一个研究项目，并在 UI 中查看其资料与结论列表。

#### T36 - 导出到 Markdown/Obsidian 和 Notion
- 关联需求：R31
- 依赖：T13
- 产出/变更点：
  - 在既有 Markdown 导出的基础上，补充 Notion 导出通路与失败重试。
- Done criteria：
  - 导出到 Notion 成功或返回结构化错误（含可重试建议）。

#### T37 - 强引用模式
- 关联需求：R32
- 依赖：T7, T10, T11
- 产出/变更点：
  - 支持 answerPolicy=force：缺证据时明确标注“不确定/无证据”。
- Done criteria：
  - 强引用模式下，关键结论均有 citation 或被明确标注为无证据。

#### T38 - 约束 RAGFlow 字段能力与契约
- 关联需求：R33
- 依赖：T17
- 产出/变更点：
  - 对 RAGFlow 关键字段能力进行契约验证与告警（向后兼容为主）。
- Done criteria：
  - RAGFlow 字段变更可被契约测试捕获并阻断回归。

#### T39 - 长文档处理策略与成本控制
- 关联需求：R34
- 依赖：T14, T16
- 产出/变更点：
  - 长文档分层策略、成本预算与中间结果复用策略。
- Done criteria：
  - 长文档场景下可配置预算/上限，并能在日志中观测到命中策略与原因。

#### T40 - 深度解析（Deep Parsing）
- 关联需求：R35
- 依赖：T33
- 产出/变更点：
  - 针对 PDF/长文档提供深度解析能力与可解释降级。
- Done criteria：
  - 深度解析可产生结构化中间结果，并可用于引用定位或后续检索。

#### T41 - 引用定位到页面坐标区域
- 关联需求：R36
- 依赖：T33
- 产出/变更点：
  - 引用携带页面坐标元数据（缺失时回退页码/offset）。
- Done criteria：
  - 前端可基于坐标定位展示证据；坐标缺失时能回退并标注原因。

#### T42 - 混合检索工具
- 关联需求：R37
- 依赖：T10
- 产出/变更点：
  - Agent 可调用混合检索工具（多策略/多源）并返回结构化结果。
- Done criteria：
  - 至少 1 条混合检索调用的结果可进入 citations 并可被证据链消费。

#### T43 - 按页范围深度阅读特定文档
- 关联需求：R38
- 依赖：T33
- 产出/变更点：
  - 支持按页范围读取并返回内容（含引用定位信息）。
- Done criteria：
  - 页范围越界返回结构化错误并给出可重试建议。

#### T44 - 本地模型与异步解析能力
- 关联需求：R39
- 依赖：T14
- 产出/变更点：
  - 支持本地模型接入与异步解析队列/任务。
- Done criteria：
  - 至少支持 1 种本地推理模式的可配置接入，并可观测关键参数。

#### T45 - 研究项目 bootstrap
- 关联需求：R40
- 依赖：T35
- 产出/变更点：
  - 选定课题后自动完成前期准备（资料搜集/任务拆解/模板初始化）。
- Done criteria：
  - 至少 1 条课题可触发 bootstrap，并产出可执行的研究项目结构与待办。

## Risks / Rollback（可选但推荐）
- 高风险点：
  - stream/events 双通道/同通道选择可能影响前端渲染模型与调试体验（建议尽早定稿，至少在 T9 前定一个 MVP 方案）。
  - T7 承载模板解析/中间件链/结构化输出/guardrails 等多职责，若实现复杂度上升建议拆分为独立模块或拆成后续任务。
  - T2 共享契约变更会影响 GraphQL/REST/stream/events/UI 多处消费者，建议优先向后兼容（只增不改）并以 T17 契约测试兜底。
  - citation/evidence 的“返回 snippet”涉及版权与合规边界（建议在 T11 中先实现“定位元数据为主 + 可配置 snippet”）。
  - RAGFlow 字段映射与能力差异可能导致引用降级，需要契约测试兜底（T17）。
- 回滚策略：
  - Provider 故障/升级：通过 T14 的 adapter 层切换备用 provider。
  - RAGFlow 不可用：降级为无检索回答，并在 UI 显示“证据不可用/降级原因”。
  - 新增字段：优先向后兼容（只增不改），确保旧客户端仍可消费。
