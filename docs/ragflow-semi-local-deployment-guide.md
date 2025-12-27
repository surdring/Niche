# RAGFlow 半本地化部署指南（Docker 部署 RAGFlow + 外部模型服务）

本文给出一套“半本地化”部署方式：
- **RAGFlow 本体与其依赖（ES/Redis/MySQL/MinIO 等）**：使用 **Docker Compose** 一键部署（最省事、最贴近官方文档）。
- **模型服务（LLM/Embedding/Rerank）**：使用你已有的外部服务（例如 `llama.cpp/llama-server` 部署的 `Qwen3-Embedding-4B`、SiliconFlow 的 `/v1/rerank`，或本机/局域网的 Ollama/Xinference）。

适用场景：
- 你希望 RAGFlow 的数据与检索引擎在本机/内网，但模型推理服务可以独立部署（便于复用 GPU/多机器、降低 RAGFlow 容器复杂度）。

参考资料：
- RAGFlow 官方文档（Model providers、Deploy local models、FAQ、Retrieval component 等）
- Qwen llama.cpp 文档（llama-server 提供 OpenAI 兼容 `/v1`）
- SiliconFlow Rerank API 文档（`POST https://api.siliconflow.cn/v1/rerank`）

---

## 0. 半本地化总体架构

- **RAGFlow（Docker）**
  - UI + Backend
  - MinIO（对象存储：你上传的文件、解析产物）
  - Elasticsearch（默认文档引擎：全文+向量；也可切换 Infinity）
  - Redis（缓存/队列等）
  - MySQL（元数据）
- **外部模型服务（非 RAGFlow 容器内）**
  - Embedding：`llama-server + Qwen3-Embedding-4B`（OpenAI 兼容 `/v1/embeddings`）
  - Rerank：SiliconFlow `POST /v1/rerank` 或自建 Xinference rerank
  - Chat LLM：你可选任意支持的 Provider（本地或云）

关键点：
- RAGFlow 容器访问外部模型服务时，必须保证网络可达。
- 如果外部模型服务运行在 **宿主机**：容器内访问宿主机通常用 `host.docker.internal`（Linux 环境可能需要额外配置）或直接用宿主机在局域网中的 IP。

---

## 1. 前置条件

- Docker Engine + Docker Compose（v2）
- 一台可以跑 RAGFlow 容器的机器（CPU 也可跑，但解析/索引会更慢）
- 外部模型服务至少满足其一：
  - Embedding：OpenAI 兼容 `/v1/embeddings`
  - Rerank：具备可访问的 rerank HTTP endpoint（例如 SiliconFlow `/v1/rerank`）

---

## 2. 部署 RAGFlow（Docker Compose）

### 2.1 获取 RAGFlow
建议使用官方仓库：`https://github.com/infiniflow/ragflow`

### 2.2 启动
官方“从源码启动”文档提到 base services 可以用 compose 启动；半本地化部署通常也是走 compose：
- 启动完整服务（不同版本文件名可能不同）：
  - `docker/docker-compose.yml`
  - 或 `docker-compose.yml`

你可以按你当前使用的 RAGFlow 版本 README 执行对应命令。

### 2.3 首次访问
- 默认会提供 Web UI（通常是 80/443 或文档中的默认端口）
- 进入 UI 后完成注册/登录

---

## 3. 部署外部 Embedding：llama-server + Qwen3-Embedding-4B

### 3.1 推荐启动方式（示例）
你已有类似命令。核心是确保：
- 监听在 `0.0.0.0`（便于 RAGFlow 容器访问）
- 对外开放端口（例如 8083）
- 使用 OpenAI 兼容 `/v1/embeddings`

检查可达性：
- 在宿主机上：访问 `http://<host>:8083/v1/`
- 从容器内：要能访问 `http://<宿主机IP>:8083/v1/`（或 `host.docker.internal`）

> 注意：Embedding 模型不要当 Chat 模型用，避免出现输出异常（例如复读 `systemsystem...`）。

---

## 4. 在 RAGFlow 中配置模型提供商（Model providers）

RAGFlow 官方文档给出结论：
- 如果你的模型服务 **OpenAI API 兼容**，可以在 `Model providers` 中选择 `OpenAI-API-Compatible` 来配置。

进入方式：
- UI 右上角头像/Logo
- `Model providers`

### 4.1 添加 Embedding（OpenAI-API-Compatible）
填写建议：
- **Provider**：`OpenAI-API-Compatible`
- **Base URL**：`http://<embedding服务地址>:8083/v1`
- **API Key**：若必填，填任意字符串（本地 llama-server 多数不校验）
- **Model**：填 embedding 模型 ID（尽量与 `/v1/models` 返回一致；不一致时以你 UI 能通过为准）
- **Type**：`embedding`

随后：
- `System Model Settings` -> `Embedding model` 选择你刚添加的模型

### 4.2 添加 Rerank（SiliconFlow 示例）
SiliconFlow Rerank API：
- `POST https://api.siliconflow.cn/v1/rerank`
- Header：`Authorization: Bearer <token>`

在 RAGFlow 中的落地思路：
- 在 `Model providers` 新增一个 **rerank** 类型的提供商（具体 UI 字段随版本变化）
- **Base URL**：建议填 `https://api.siliconflow.cn/v1`，确保最终命中 `/rerank`
- **API Key**：填 SiliconFlow token，并确保按 `Bearer` 形式发送
- **Model**：例如 `Qwen/Qwen3-Reranker-4B` 或 `BAAI/bge-reranker-v2-m3`

随后在检索组件或检索测试中选择该 rerank 模型。

> 如果你用 Xinference：官方文档提到 rerank 的 base URL 形如 `http://<xinference-host>:9997/v1/rerank`。

---

## 5. 创建知识库并向量化入库（Embedding/Indexing）

1. 新建 Dataset（知识库）
2. 确认该 Dataset 使用的 **Embedding model** 是 `Qwen3-Embedding-4B`
3. 上传文件（PDF/MD/TXT/HTML 等）
4. 等待解析与 embedding 完成

注意：
- 检索组件如果选择多个 datasets，必须保证它们使用 **相同的 embedding 模型**（官方文档明确说明）。

---

## 6. 检索与重排序配置（Workflow/Chat）

在 `Retrieval component`（检索组件）中：
- `Similarity threshold`：默认 0.2
- `Vector similarity weight`：默认 0.3（混合检索权重）
- `Top N`：默认 8（进入 LLM 的 chunk 数）
- `Rerank model`：可选
  - 不选：关键词相似度 + 向量余弦相似度
  - 选了：关键词相似度 + reranking score（更准但更慢）

建议调参路径：
- 先不开 rerank，把召回做稳定
- 再开启 rerank，并降低 `Top N`（rerank 处理候选越少越快）

---

## 7. 验证与排障

### 7.1 外部模型服务不可达
常见原因：
- 模型服务只监听 `127.0.0.1`
- 防火墙/安全组未放行端口
- RAGFlow 容器无法访问宿主机（Linux 下 `host.docker.internal` 可能不可用）

建议排查：
- 在 RAGFlow 容器内 curl 目标 URL（如果你能进入容器）
- 或改用宿主机局域网 IP（例如 `192.168.x.x`）而不是 `localhost`

### 7.2 检索报错：匹配 chunk 太多 / 输入长度超限
RAGFlow FAQ 建议：
- 降低 `TopN`
- 提高 `Similarity threshold`

### 7.3 开启 rerank 后变慢
这是预期行为（官方文档强调）。优化：
- 降低 `Top N`
- 提高 `Similarity threshold`
- 只在关键助手/关键问题开启 rerank

### 7.4 Docker 镜像拉取失败（`connection reset by peer`）

现象示例：
- `failed to copy: read tcp ...: read: connection reset by peer`

含义：
- 这是**拉取镜像分层内容时网络连接被对端重置**，常见于跨境链路不稳定、公司网关/代理中断长连接、或访问特定 registry（如 Docker Hub / quay.io）不稳定。

推荐处理顺序：
- **优先先执行 `docker compose pull`**（把问题收敛为“拉镜像”而不是“边拉边起”）：

```bash
docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d
```

- **切换 RAGFlow 主镜像到国内镜像源**：
  - 你贴的 `.env` 已提供开关：`RAGFLOW_IMAGE=...`
  - 默认：`infiniflow/ragflow:v0.22.1`（通常走 Docker Hub）
  - 可切到：
    - 华为云：`swr.cn-north-4.myhuaweicloud.com/infiniflow/ragflow:v0.22.1`
    - 阿里云：`registry.cn-hangzhou.aliyuncs.com/infiniflow/ragflow:v0.22.1`

为什么这样通常就“可以了”：
- `infiniflow/ragflow` 镜像体积很大（数 GB），最容易在跨境链路上中途断开。
- 华为云/阿里云镜像仓库通常在国内链路与 CDN 更稳定，显著降低被 reset 的概率。

重要提醒：
- `RAGFLOW_IMAGE` 只影响 **ragflow 主服务镜像**。
- 你的 compose 里仍可能包含其他 registry 的镜像（例如 `quay.io/minio/minio`），它们如果拉取不稳定，仍然会失败。

如果卡在 `quay.io/minio/minio`：
- 先反复重试 `docker pull quay.io/minio/minio:<tag>`（很多时候多试几次就能完整拉下来）
- 或在网络条件更好的环境先拉取，再用 `docker save` / `docker load` 离线搬运到目标机器
- 或结合你环境配置 Docker 的 proxy/镜像加速（取决于你的网络策略）

---

## 8. 最小可行 Checklist

- [ ] RAGFlow（Docker）可访问 UI
- [ ] Embedding 服务可从 RAGFlow 机器访问：`http://<host>:8083/v1/embeddings`
- [ ] RAGFlow `Model providers` 已添加 embedding（OpenAI-API-Compatible）
- [ ] `System Model Settings` 已选择 embedding model
- [ ] Dataset 已创建并完成入库
- [ ] 检索组件能检索到相关 chunks
- [ ] （可选）Rerank provider 已添加，并在 `Rerank model` 中可选

