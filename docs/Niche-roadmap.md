# Niche Roadmap（短期 / 中期 / 长期规划）

> 更新日期：2025-12-20  
> 说明：本 Roadmap 基于 `kiro/specs/vertical-ai-framework/requirements.md` 与竞品分析整理，重点围绕 Niche 作为 **垂直 AI App Studio 内核** 与旗舰场景模板 **Research Copilot** 的演进路线。

---

## 1. 产品北极星与角色定位

- **角色定位**：
  - Niche = 基于 Vercel AI SDK Core + Fastify + GraphQL 的 **Agent Orchestrator & RAG Framework**，面向研究/知识工作与 Explain/Verify 型学习任务。
  - 通过 **Scenario Template（场景模板）**，成为可以“一键孵化垂直 AI 应用”的 **Vertical AI App Studio 内核**。

- **价值观与边界**：
  - 优先服务研究/知识工作、Explain & Verify 学习任务。  
    避免演变为“代做作业/刷题作弊”工具。
  - 在学习/作业场景中，以 **解释/提示/批改/纠错** 为主，而非直接给最终答案，确保学术诚信与合规。

- **旗舰模板**：
  - `Research Copilot`：围绕论文/书籍/网页等资料构建 **项目工作台 + 长文档处理 + 引用溯源 + 导出** 的完整闭环。

---

## 2. 短期规划（1–2 个迭代）：Research Copilot MVP 闭环

> 目标：在最小可行范围内，跑通“研究协作（Research Copilot）”的完整用户旅程，形成可演示、可复用的旗舰模板。

### 2.1 Infra 与核心能力落地

- **RAG & 数据管道（对应需求 1、5、19、24、25、30、31、32、33）**
  - 集成 RAGFlow：完成文档摄入/检索/引用溯源适配器。
  - 数据清洗与脱敏管道：多格式文档 → 结构化记录；支持 PII 处理。
  - PDF 解析：保留页码、章节结构、定位信息（chunkId/page/offset/坐标）。
  - 引用溯源 API：前端可“点击引用高亮原文”。

- **多模型路由 + Agent 工作流（需求 2、3、34、35）**
  - 实现统一 Provider 接口与基础路由逻辑（简单/复杂查询切分）。
  - 落地 Agent Proxy + Sub-agent 协作：检索、深读、写作、校对等角色。
  - 提供混合检索工具（关键词 + 向量 + rerank）与按页深读能力。

- **流式协议 & 可观测性（需求 8、9、36、38 第 7 点）**
  - 实现标准化流式响应（Vercel AI Data Stream Protocol）。
  - 打通 Telemetry/Usage 采集，记录 Token、延迟、错误与缓存命中率。
  - 为 Research Copilot 的 bootstrap 流程提供 progress events 规范实现。

### 2.2 Research Copilot MVP 体验

- **研究项目工作台（需求 24–28、26、31、35）**
  - 支持创建 Research Project：主题/研究问题/目标输出格式配置。
  - 上传 PDF/导入网页：完成解析与入库，具备页码级引用能力。
  - 生成结构化 Note / Claim / Evidence / Citation，并支持强引用模式：
    - 关键结论必须有 citation，缺失则触发自我修正/降级策略。

- **起步包与导出（需求 27、38、40）**
  - 课题 Bootstrap：自动问题拆解 + 联网搜索 + 资料导入 + To-do 队列。
  - 导出到 Markdown / Obsidian（frontmatter + 引用列表）与 Notion（若配置）。

- **基础 UI（需求 40、41、9、36）**
  - 模板选择入口：至少提供 Research Copilot 模板。
  - 流式对话与步骤可视化：thinking/tool_call/reading/generating/complete。
  - 引用点击高亮/侧边栏查看证据；导出预览与选项。

> 完成标准：
> - 一个端到端「研究项目」Demo：从上传/导入 → 检索/深读 → 生成结论（带引用）→ 导出。
> - UI 能实时展示 Agent 步骤与进度，并支持查看/验证证据。

---

## 3. 中期规划（3–6 个迭代）：模板体系、多模态与 Eval 闭环

> 目标：从“单一旗舰模板”升级为“可扩展的模板/插件体系”，并补齐评估、反馈和多模态能力，使 Niche 更像一套可复用的框架，而非单一应用。

### 3.1 场景模板系统强化（需求 16、22、23、39）

- 完善 Template 定义与校验：
  - System Prompt、tools、输出 Schema、工作流/重试策略、引用/安全策略等。
  - Template 的导入/导出（JSON/YAML）、版本化与运行时记录版本信息。
- 衍生出额外官方模板（示例）：
  - **Study Copilot**：偏学生/自学，但强调 Explain/Verify，而非代做作业。
  - **Internal Docs Copilot**：面向团队或企业内部文档的问答与知识管理。
- 将防御性 Prompt 与 `wrapLanguageModel` 中间件模式沉淀为模板规范的一部分。

### 3.2 Eval / 反馈 / 提示词管理（需求 4、10、11、20、18）

- Eval 框架落地：
  - 支持基线对比、LLM-as-a-Judge、多维评估（准确性/完整性/安全性/格式）。
  - 与 CI/CD 集成：提示词或模板变更自动触发回归评估。
- 反馈采集：
  - UI 层支持对回答/结论的点赞/点踩，关联上下文与引用。
  - 正例进入 Few-shot 候选集，负例进入“待优化案例库”。
- 提示词管理：
  - 版本化、A/B 测试、动态 Few-shot 选择与热更新。

### 3.3 多模态与本地模型增强（需求 12、37）

- 图片/音频支持：
  - 基础视觉模型（GPT-4V/Claude Vision 等）对接，满足简单图文混合需求。
  - 课堂/会议录音 → 摘要/待办/引用（向 Unstuck 学习）。
- 本地模型适配：
  - 通过 HTTP 适配 llama.cpp server，提供本地推理选项。
  - 防御性 Prompt + 输出校验，确保在工具调用/结构化输出场景下的鲁棒性。

### 3.4 CLI 与插件生态雏形（需求 15、18）

- CLI 工具：
  - 初始化项目、运行评估、调试提示词、数据导入导出、部署健康检查等。
- 插件机制：
  - 标准化插件接口/生命周期钩子，支持运行时启用/禁用与错误隔离。

> 完成标准：
> - 至少 2–3 个官方模板可稳定运行，模板定义/导出/版本化完善。  
> - Eval + 反馈 + Prompt 管理形成闭环，用于指导模板迭代。  
> - 多模态 & 本地模型在 Research/Study 场景下有一个可行 demo。

---

## 4. 长期规划（6+ 迭代）：平台化、多租户与商业化能力

> 目标：在不破坏现有架构前提下，把 Niche 升级为 **多租户、可计费、可扩展生态** 的平台，支撑更多第三方垂直应用。

### 4.1 多租户与配额管理（需求 21、29、41）

- 多租户模型：
  - 对 Documents/Chunks/Sources/Projects/Notes/Claims/Tasks/Conversations/Usage 等全面引入 `tenantId` 与 `projectId` 隔离（部分已在现有需求中预埋）。
- 配额与计费：
  - Token Budget、调用次数配额、模型级/功能级限额。
  - 用量与成本报表（按租户/时间/模型/功能维度）。

### 4.2 能力分级与商业化包装

- 把中期已完成的能力拆分为 **基础版 / Pro / Enterprise** 等级：
  - 基础：RAG + 基础 Agent 对话 + Research Copilot 精简版。
  - Pro：长文档 Deep Parsing、强引用模式、合成数据/评估套件、多模态等。
  - Enterprise：多租户隔离、审计/合规报表、自定义插件/私有模型接入等。

### 4.3 生态与第三方集成

- 插件市场雏形：允许第三方贡献模板/工具插件。
- 与 Notion/Obsidian/Slack 等平台更深度集成（双向同步、自动触发工作流）。

> 完成标准：
> - 即便不立刻对外商业化，系统架构也已具备平滑升级为 SaaS 的能力。  
> - 模板/插件/多租户/计费等模块在代码和数据层面实现了清晰边界。

---

## 5. 使用与维护建议

- **文档维护**：
  - 每次大版本（比如完成一个 Phase 或新增一个官方模板）时，更新本 Roadmap。  
  - 在 `requirements.md` 中新增需求时，尽量标记其“属于短期/中期/长期哪一块”。

- **决策优先级**：
  - 若与“研究闭环体验”和“模板生态”有冲突，应优先保证：
    1. Research Copilot 闭环体验。
    2. 模板/插件体系的清晰边界与可复用性。

> 本文档是规划性文档，不直接作为实现验收依据，验收仍以 `requirements.md` 为准；两者不一致时，应优先更新 Roadmap 或 requirements 以保持对齐。
