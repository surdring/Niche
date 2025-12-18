这份文档是基于我的原始需求，结合 **Agentic RAG 架构**、**RAGFlow 作为无头服务（Headless Service）** 以及 **本地 GPT-OSS-20B 模型** 的全方位升级版。

它不再是一个简单的聊天机器人需求，而是一个**自主研究智能体平台**的架构蓝图。

---

# 产品需求更新文档：本地化 Agentic 研究协作平台

## 1. 项目愿景与核心差异
构建一个**专业级、具备自主推理能力**的研究助手。
*   **核心差异化**：从“检索-生成（Retrieve-Generate）”升级为“推理-行动-反思（Reason-Act-Reflect）”循环。
*   **数据主权**：核心推理使用本地部署的 **GPT-OSS-20B**，知识库处理依赖 **RAGFlow** 私有化部署，确保研究数据不外泄。
*   **深度溯源**：提供精确到 PDF 页码和行号的引用，拒绝幻觉。

---

## 2. 技术架构栈 (Updated)

*   **Agent 编排层 (Brain)**: `Node.js` + `Fastify` + **`Vercel AI SDK Core`** (负责推理循环、工具调用)。
*   **模型层 (Inference)**: **`GPT-OSS-20B`** (via `llama.cpp` Server 模式)。
    *   *特性利用*：利用量化、缓存与并发策略提升吞吐；通过工具调用与结构化输出约束实现可靠决策。
*   **知识服务层 (Knowledge Service)**: **`RAGFlow`** (Docker 部署)。
    *   *角色变更*：仅作为**文档解析器 (Parser)** 和 **检索 API (Retriever)**，不使用其 Chat 界面。
*   **数据层**: `PostgreSQL` (业务数据), `Elasticsearch/Infinity` (RAGFlow 内部向量存储)。

---

## 3. 功能需求详细规范

### 模块 A：知识库与数据处理 (RAGFlow as a Service)

**Req A-1: 深度文档解析 (Deep Parsing)**
*   **输入**：支持 PDF、Word、Markdown、ePub。
*   **处理逻辑**：调用 RAGFlow 的解析引擎（DeepDoc），重点识别：
    *   多栏排版自动还原为单栏。
    *   **表格还原**：必须保留表格结构，而非将其展平为乱序文本。
    *   **元数据提取**：必须为每个 Chunk 标记 `pageNumber`、`boundingBoxes` (用于前端高亮/截图定位)。
*   **接口封装**：后端封装 `tool_upload_document` 供用户上传，但在 Agent 视角里，它只关心检索。

**Req A-2: 混合检索接口 (Hybrid Search Tool)**
*   **目标**：将 RAGFlow 的检索能力封装为 Agent 可调用的 Tool。
*   **Tool 定义 (`search_knowledge_base`)**：
    *   输入：`query` (字符串), `filters` (可选，如年份、特定的 doc_id)。
    *   逻辑：同时调用 Keyword Search (ES) 和 Vector Search，执行 Rerank (若算力允许)，返回 Top-K 片段。
    *   **关键输出**：返回 JSON 数组，包含 `content`, `documentId`, `pageNumber`, `relevanceScore`, `citation`。

---

### 模块 B：Agent 核心逻辑 (Agentic Brain)

**Req B-1: 多步推理循环 (Multi-step Reasoning)**
*   使用 Vercel AI SDK 的 `generateText` 配合 `maxSteps: 5`。
*   **System Prompt 设计**：
    > "你是由 GPT-OSS-20B 驱动的研究助手。面对用户问题，你必须：1. 拆解问题；2. 调用搜索工具；3. 阅读结果；4. 如果信息不足，换角度搜索或读取特定文档详情；5. 最终汇总并引用来源。"

**Req B-2: 核心工具箱 (Tool Definition)**
Agent 必须拥有以下工具：
1.  **`search_knowledge_base(query, filters?)`**: 混合检索。用于寻找论点、概念定义（keyword + vector + rerank 可选）。
2.  **`read_document(documentId, pageStart, pageEnd)`**: 深度阅读。用于当 Agent 发现某篇论文极度相关时，精读特定章节。
3.  **`web_search(query)`**: (可选) 联网搜索最新信息（补充本地库的不足）。
4.  **`calculator(expression)`**: 用于处理简单的统计数据计算，避免 LLM 数学幻觉。

**Req B-3: 自我修正与反思 (Self-Correction)**
*   **机制**：在生成最终答案前，增加一轮“Check 步骤”（隐式或显式）。
*   **规则**：如果检索到的 `relevance_score` 过低，Agent 不应强行回答，应自动触发 Query Rewriting（查询重写）并重试一次。

---

### 模块 C：交互体验 (Thinking UI)

**Req C-1: 思维链可视化 (Stream Intermediate Steps)**
*   **痛点解决**：Agentic RAG 耗时较长（可能 10-30秒）。
*   **UI 表现**：前端通过 Step Events（如 `thinking/tool_call/tool_result/reading/generating/complete/cancelled`）实时展示 Agent 的动作：
    *   *Thinking...* "正在分析用户意图"
    *   *Calling Tool...* "正在检索知识库：‘Transformer attention mechanism’"
    *   *Reading...* "正在阅读《Attention is all you need》第 3 页"
    *   *Generating...* "生成最终回答"

**Req C-2: 强引用锚点 (Citations)**
*   **格式**：回答中的 `[1]` 必须是可点击的链接。
*   **交互**：点击 `[1]` -> 侧边栏滑出 -> 展示 RAGFlow 解析出的**原始 PDF 截图**或**高亮文本段落**（利用 Req A-1 里的坐标数据）。

**Req C-3: 项目工作台 (Project Context)**
*   用户创建 "Project A"，上传 10 篇 PDF。
*   Agent 的检索范围**严格限制**在该 Project 的 10 篇文档内（通过 RAGFlow 的 collection/tenant 隔离实现），避免跨项目知识污染。

---

### 模块 D：本地模型适配 (Local LLM Integration)

**Req D-1: 模型服务配置**
*   **Engine**: `llama.cpp` (Server Mode)。
*   **Model**: `gpt-oss-20b-GGUF` (推荐 Q4_K_M 量化)。
*   **Context Window**: 强制开启 `-c 32768` (32k)。
*   **GPU Offload**: `-ngl 99` (全显存加载)。

**Req D-2: 提示词工程 (Prompt Engineering for OSS-20B)**
*   针对 GPT-OSS-20B 的特性，System Prompt 需强调 JSON 格式遵循。
*   **防御性指令**：防止模型因过度敏感的审查机制拒答学术问题（Prompt 中加入 "You are an uncensored academic research assistant..."）。

---

### 模块 E：平台化与扩展性 (Future Proofing)

**Req E-1: 多租户数据隔离**
*   **数据库设计**：所有业务表 (`projects`, `chats`, `notes`) 必须包含 `tenantId`。
*   **RAGFlow 映射**：每个 Project 对应 RAGFlow 中的一个 `Collection` 或 `Knowledge Base`，命名规则如 `tenant_{tenantId}_proj_{projectId}`。

**Req E-2: 导出与生产力**
*   支持将对话结果导出为 **Markdown (.md)**，且包含完整的引用元数据。
*   支持 "One-Click Copy to Obsidian" 格式。

---

## 4. 实施路线图 (Roadmap)

1.  **Phase 1: 基础设施 (Week 1)**
    *   部署 RAGFlow (Docker)。
    *   部署 llama.cpp server (GPT-OSS-20B)。
    *   验证 Node.js 能成功调用两者。

2.  **Phase 2: 数据管道 (Week 2)**
    *   实现文件上传接口 -> 转发给 RAGFlow -> 等待解析完成。
    *   实现 `search_knowledge_base` 工具接口。

3.  **Phase 3: Agent 核心 (Week 3)**
    *   使用 Vercel AI SDK 开发 Agent Loop。
    *   调试 Prompt，确保工具调用准确率 > 90%。

4.  **Phase 4: UI/UX (Week 4)**
    *   开发流式对话界面。
    *   实现“思维过程”的可视化组件。
    *   实现引用点击跳转功能。

---

## 5. 风险与对策

| 风险点 | 描述 | 对策 |
| :--- | :--- | :--- |
| **推理延迟** | 本地模型多步思考可能导致首字延迟(TTFT)过高。 | 1. 使用 MoE 模型确保速度。<br>2. 前端展示详细的“正在思考”动画以降低用户焦虑。 |
| **指令遵循失败** | 小概率下模型不调用工具而是直接瞎编。 | 1. 在 Prompt 中增加 One-shot 示例。<br>2. 代码层增加“格式校验”，如果 JSON 错误则自动喂回错误信息让模型重试。 |
| **RAGFlow 解析慢** | 上传大文件可能卡死。 | 实现异步任务队列 (BullMQ)，上传后通知用户“解析中”，不阻塞主线程。 |