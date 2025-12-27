# 在 RAGFlow（regflow）中使用 Qwen3-Embedding-4B 进行知识库向量化与重排序（Rerank）指南

本文面向你已经在本地/服务器上使用 `llama.cpp` 的 `llama-server` 部署了 `Qwen3-Embedding-4B`（GGUF）并希望在 **RAGFlow（常被口头写作 regflow）** 中用于知识库（Dataset）的向量转换（Embedding/Indexing）与检索阶段重排序（Rerank）的场景。

文档信息来源：
- RAGFlow 官方文档（模型提供商、检索组件、检索测试、FAQ）
  - Supported models / OpenAI-API-Compatible 示例：`https://ragflow.io/docs/supported_models`
  - Deploy local models（含 Xinference rerank baseURL 说明）：`https://ragflow.io/docs/deploy_local_llm`
  - Retrieval component（Rerank model、Vector similarity weight 等）：`https://ragflow.io/docs/retrieval_component`
  - Run retrieval test（Rerank model 的效果/耗时提示）：`https://ragflow.io/docs/run_retrieval_test`
  - FAQ（本地模型、OpenAI兼容接入、TopN/threshold 排障）：`https://ragflow.io/docs/faq`
- Qwen 官方关于 llama.cpp 的说明（llama-server 提供 OpenAI 兼容 `/v1` API）：`https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html`

> 注意：RAGFlow UI/版本迭代较快，不同版本字段名可能略有差异。本文以官方文档描述为基准，提供“可迁移”的配置思路。

---

## 0. 前置条件与总体架构

### 0.1 你需要的 2 类模型
- **Embedding 模型（用于向量化、检索召回）**：你要用的 `Qwen3-Embedding-4B`。
- **Rerank 模型（用于重排序）**：`Qwen3-Embedding-4B` 通常并不是 cross-encoder rerank 模型；RAGFlow 的“Rerank model”一般期望的是 **专用 reranker**。

因此推荐组合是：
- **Embedding**：`Qwen3-Embedding-4B`（你现有）
- **Rerank**：选择一个 rerank 模型服务（例如 bge-reranker 系列），通过 Xinference/其他服务提供 rerank API

> 如果你暂时没有 rerank 服务，也可以先不配置 rerank：RAGFlow 会使用“加权关键词相似度 + 加权向量余弦相似度”的混合检索。

### 0.2 llama-server 的接口形态（关键）
Qwen 官方文档明确：`llama-server` 的 OpenAI 兼容 API 在：
- `http://<host>:<port>/v1/`

通常你会用到：
- `POST /v1/embeddings`
- `GET /v1/models`（有的客户端会用它探测 model 列表）

---

## 1. 用 llama-server 部署 Qwen3-Embedding-4B（建议参数）

你已经能启动服务。这里给出几个与“作为 embedding 服务”更匹配的注意事项：

- **确认你不是用 chat 模式去调用 embedding 模型**：Embedding 模型用于 `/v1/embeddings`，不要拿它去 `/v1/chat/completions`，否则可能出现输出异常（例如反复输出 `systemsystem...` 这类 token 泄漏/复读）。
- **`--jinja` 对 embedding 并非必须**：`--jinja` 更偏向 chat template；如果你只提供 embeddings，可以不依赖模板能力。

---

## 2. 在 RAGFlow 中配置 Qwen3-Embedding-4B（OpenAI-API-Compatible）

RAGFlow 官方文档给出的结论是：
- 如果你的模型服务 **OpenAI API 兼容**，可以在 Model providers 中选择 **OpenAI-API-Compatible** 并配置。
- 官方示例（AI Badgr）指出：只要提供 `/v1/chat/completions`、`/v1/embeddings`、`/v1/models` 等 OpenAI 兼容端点，就不需要改 RAGFlow 代码。

### 2.1 打开 Model providers
在 RAGFlow UI 中：
- 点击右上角头像/Logo
- 进入 `Model providers`

### 2.2 添加 Embedding 提供方
选择：
- **Provider**：`OpenAI-API-Compatible`

填写：
- **Base URL**：`http://<你的llama-server地址>:8083/v1`
  - 例：`http://192.168.1.10:8083/v1`
- **API Key**：如果 UI 强制要求，填任意字符串（例如 `local`）
- **Model**：填写服务端暴露的 embedding 模型名
  - 如果 `/v1/models` 可用：优先填其返回的 model id
  - 如果 UI 不校验：填一个你自己约定的名字也可能可用（但更推荐与 `/v1/models` 一致）
- **Type**：选择 `embedding`

> 文档中在 Ollama 示例里强调：模型 `name` 与 `type` 要匹配（例如 `bge-m3` + `embedding`）。OpenAI-API-Compatible 也建议遵循这个思路。

### 2.3 更新 System Model Settings
RAGFlow 文档提到需要更新系统模型设置：
- 点击 `Model providers` 页面里的 `System Model Settings`
- 在 `Embedding model` 下拉框中选中你刚添加的 `Qwen3-Embedding-4B`

---

## 3. 用 Qwen3-Embedding-4B 对知识库做向量转换（Embedding/Indexing）

在 RAGFlow 中“向量转换/入库”通常发生在你：
- 创建 Dataset（知识库）
- 上传文件并触发解析（chunking）与 embedding

### 3.1 创建知识库（Dataset）
- 新建一个 Dataset
- 在 Dataset 设置里确认使用的 **Embedding model** 是你刚设置的 `Qwen3-Embedding-4B`

### 3.2 上传文档并触发解析与向量化
- 上传 PDF/Markdown/HTML/TXT 等
- 等待解析与 embedding 完成

### 3.3 重要约束：多知识库检索时 embedding 必须一致
RAGFlow 检索组件文档明确指出：
- 如果你在一个检索节点里选择多个 datasets，必须保证它们使用**同一个 embedding 模型**，否则会报错。

---
## 4. 在 RAGFlow 中配置重排序（Rerank）

RAGFlow 官方文档（Retrieval component / Run retrieval test）对 rerank 的关键说明：

- **不选 rerank**：使用“加权关键词相似度 + 加权向量余弦相似度”
- **选择 rerank model**：使用“加权关键词相似度 + 加权 reranking score”
- **代价**：启用 rerank 会显著增加响应时间

### 4.0 SiliconFlow Rerank API（可直接作为云端 rerank 服务）

SiliconFlow 文档给出了 OpenAI 风格的 rerank 端点（HTTP API）：
- **Endpoint**：`POST https://api.siliconflow.cn/v1/rerank`
- **鉴权**：`Authorization: Bearer <token>`
- **Content-Type**：`application/json`

请求体关键字段（摘自文档示例）：
- **`model`**：重排序模型名，例如：
  - `Qwen/Qwen3-Reranker-8B`
  - `Qwen/Qwen3-Reranker-4B`
  - `Qwen/Qwen3-Reranker-0.6B`
  - `BAAI/bge-reranker-v2-m3`
  - `Pro/BAAI/bge-reranker-v2-m3`
  - `netease-youdao/bce-reranker-base_v1`
- **`query`**：查询字符串
- **`documents`**：当前仅支持字符串数组（未来才支持对象数组）
- **`top_n`**：返回最相关的 TopN（文档示例为 4）
- **`return_documents`**：是否在响应中返回文档文本
- **`instruction`**：仅 Qwen3 reranker 系列支持，用于提示重排策略

响应体关键字段（摘自文档示例）：
- **`results[]`**：
  - `index`：对应输入 `documents` 的索引
  - `relevance_score`：相关性分数
  - `document.text`：当 `return_documents=true` 时返回
- **`tokens.input_tokens` / `tokens.output_tokens`**：token 统计

> 以上内容参考：`https://docs.siliconflow.cn/cn/api-reference/rerank/create-rerank`

### 4.1 Rerank 模型服务从哪里来？
RAGFlow 官方文档在 Xinference 部署部分提到：
- rerank 的 base URL 形式可能是：`http://<xinference-host>:9997/v1/rerank`

也就是说 RAGFlow 在“Rerank model”期望对接的是**专用 rerank endpoint**，而不是普通 embedding endpoint。

### 4.1.1 在 RAGFlow 中接入 SiliconFlow Rerank（配置要点）

在 RAGFlow 的 `Model providers` 里添加一个 rerank 提供方时，你需要做两件事：

- **Base URL**：填写 SiliconFlow 的 rerank 基础地址
  - 建议填写：`https://api.siliconflow.cn/v1`
  - 并确保该 Provider 会把请求打到 `/rerank`（最终形成 `POST https://api.siliconflow.cn/v1/rerank`）
- **API Key**：填写 SiliconFlow 的 token，并确保以 `Bearer` 方式传递

随后在 `System Model Settings` / 或检索组件（Retrieval component）的 `Rerank model` 下拉框中选择：
- 例如 `Qwen/Qwen3-Reranker-4B` 或 `BAAI/bge-reranker-v2-m3`

如果你的 RAGFlow 版本在 UI 里要求你显式选择模型类型：
- **Type**：选择 `rerank`

> 由于 RAGFlow UI/版本会变化：如果你看到的 provider 表单字段与上述不一致，以官方文档“rerank base URL”思路为准——确保最终请求命中 `POST /v1/rerank`，且请求头包含 `Authorization: Bearer <token>`。

### 4.2 推荐做法（最稳）
- **Embedding**：继续用你的 `llama-server + Qwen3-Embedding-4B`（OpenAI `/v1/embeddings`）
- **Rerank**：单独部署一个 rerank 服务（Xinference/其他 rerank server），在 RAGFlow 里添加为 rerank provider

> 仅用 embedding 模型做 rerank 往往效果差且接口也不匹配。RAGFlow 的 rerank 通常需要 query+passages 的 cross-encoder 评分。

---

## 5. 在 Workflow/Chat 中使用检索组件并启用 rerank

如果你用的是 RAGFlow 的 Workflow：

### 5.1 在 Retrieval component 中配置
RAGFlow 官方文档列出的关键字段：
- `Query variables`：默认 `sys.query`
- `Knowledge bases`：选择你的 dataset
- `Similarity threshold`：默认 0.2
- `Vector similarity weight`：默认 0.3
- `Top N`：默认 8
- `Rerank model`：可选

启用 rerank：
- 在 `Rerank model` 下拉框选你配置好的 reranker

### 5.2 用 Run retrieval test 做离线调参
官方文档建议用 retrieval test 验证：
- 如果启用 rerank，会更慢（显著增加 time-to-first-token/响应时长）
- 可通过调 `Top N`、`Similarity threshold` 进行效果与性能平衡

---

## 6. 常见问题与排障

### 6.1 “输出 systemsystem…” 或模型表现异常
通常发生在：
- 你把 **Embedding 模型当 Chat 模型** 调用了（走了 `/v1/chat/completions` 或把 chat template 当生成式模型用）

修复建议：
- 在 RAGFlow 里把该模型只配置为 `embedding` 类型
- Chat 模型另选真正的 instruct/chat LLM

### 6.2 检索结果太多导致报错（TopN/threshold）
RAGFlow FAQ 给出建议：
- 降低 `TopN`
- 提高 `Similarity threshold`

### 6.3 多知识库检索时报 embedding 不一致
确保所有被同一个检索节点选中的 datasets：
- 使用相同 embedding model

### 6.4 开启 rerank 后变慢
这是预期行为（官方文档强调）。优化方向：
- 降低 `Top N`（rerank 处理的候选越少越快）
- 提高 `Similarity threshold`（减少候选）
- 只在关键助手/关键问题上启用 rerank

---

## 7. 最小可行配置清单（Checklist）

- [ ] llama-server 可访问：`http://<ip>:8083/v1`
- [ ] llama-server embeddings 可用：`POST /v1/embeddings`
- [ ] RAGFlow -> Model providers -> 添加 `OpenAI-API-Compatible`（Type=embedding）
- [ ] RAGFlow -> System Model Settings -> Embedding model 选择 `Qwen3-Embedding-4B`
- [ ] 创建 Dataset 并上传文档，等待 embedding/index 完成
- [ ] Workflow/Chat 的 Retrieval 组件选择该 Dataset
- [ ] （可选）部署 rerank 服务并在 Retrieval 的 `Rerank model` 中选择

---

## 8. 你可能还需要的一点现实提醒

- `Qwen3-Embedding-4B` 解决的是“向量化/召回质量”；
- “重排序（rerank）”通常需要不同类型的模型与服务端接口。

如果你希望我把本文进一步补齐为“可复制粘贴的具体 UI 字段截图级步骤”，你可以发：
- 你使用的 RAGFlow 版本号
- Model providers 页面里 OpenAI-API-Compatible 的配置表单字段（截图即可，打码 API Key）
