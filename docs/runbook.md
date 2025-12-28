# Study Copilot 运行手册

## 目录

- 1. 本地启动
  - 1.1 安装依赖
  - 1.2 配置环境变量
  - 1.3 启动 API 服务
  - 1.4 启动 Web 服务
  - 1.5 常用命令（build/typecheck/lint/test）
- 2. 常见故障
  - 2.1 Provider 超时（provider timeout）
  - 2.2 RAGFlow 不可用（ragflow unavailable）
  - 2.3 Citations 降级/unavailable
- 3. 排查指引
  - 3.1 按 requestId 排查
  - 3.2 日志查询命令
  - 3.3 前后端关联（UI -> API -> logs）

## 1. 本地启动

本章节的命令默认以 Windows PowerShell 为主；当不同平台写法不同时，会同时给出 Linux/macOS（bash/zsh）版本，避免未来需要维护多份 runbook。

### 1.1 安装依赖

在仓库根目录执行（可复制粘贴）：

```powershell
npm install
```

### 1.2 配置环境变量

本项目会在启动时自动尝试从仓库根目录加载 `.env`（见 `@niche/core` 的 dotenv loader）。

1) 复制模板：

- Windows (PowerShell)：

```powershell
Copy-Item .env.example .env
```

- Linux/macOS (bash/zsh)：

```bash
cp .env.example .env
```

2) 按需补齐 `.env` 中的配置。

- 本地最小可用（当前代码默认 mock provider + mock ragflow client，以下 3 个 key 主要用于发布检查/运维对齐）：

```dotenv
NODE_ENV=development
API_PORT=3001
WEB_PORT=5173

# Used by release checklist / ops wiring (may be unused in local mock runtime)
RAGFLOW_API_URL=http://localhost:8010
RAGFLOW_API_KEY=change_me
PROVIDER_API_KEY=change_me
```

### 1.3 启动 API 服务

启动开发模式（可复制粘贴）：

```powershell
npm run dev -w @niche/api
```

指定端口启动（可复制粘贴）：

- Windows (PowerShell)：

```powershell
$env:API_PORT = 4001
npm run dev -w @niche/api
```

- Linux/macOS (bash/zsh)：

```bash
API_PORT=4001 npm run dev -w @niche/api
```

如果你需要将日志落盘以便按 `requestId` 检索（推荐）：

- Windows (PowerShell)：

```powershell
New-Item -ItemType Directory -Force logs | Out-Null
npm run dev -w @niche/api 2>&1 | Tee-Object -FilePath logs/api.log
```

- Linux/macOS (bash/zsh)：

```bash
mkdir -p logs
npm run dev -w @niche/api 2>&1 | tee logs/api.log
```

API 默认端口：`API_PORT`（默认 `3001`）。

### 1.4 启动 Web 服务

启动开发模式（可复制粘贴）：

```powershell
npm run dev -w @niche/web
```

Web 默认端口：`5173`（由 `apps/web/vite.config.ts` 的 `server.port` 配置）。

指定端口启动（可复制粘贴）：

- Windows (PowerShell)：

```powershell
npm run dev -w @niche/web -- --port 5180
```

- Linux/macOS (bash/zsh)：

```bash
npm run dev -w @niche/web -- --port 5180
```

注意：`apps/web/vite.config.ts` 默认会将 `/api` 代理到 `http://localhost:3001`。如果你同时修改了 API 端口，需要同步调整该 proxy target。

### 1.5 常用命令（build/typecheck/lint/test）

在仓库根目录执行：

```powershell
npm run build
npm run typecheck
npm run lint
npm run test
```

## 2. 常见故障

### 2.1 Provider 超时（provider timeout）

- **症状**
  - Web 侧出现 `UPSTREAM_TIMEOUT` / `UPSTREAM_UNAVAILABLE` 的错误（ErrorBlock 会显示 `requestId=...`）。
  - `/api/stream` 请求耗时很长后失败，或在中途断开。

- **可能原因**
  - 上游 provider 网络波动/限流。
  - provider 的超时设置过短（例如 OpenAI adapter 的 `timeoutMs`）。
  - 客户端中断（浏览器刷新/取消）导致服务端 Abort。

- **排查步骤（以 requestId 为主线）**
  - 1) 前端获取 `requestId`
    - UI：错误区块（ErrorBlock）会显示 `requestId=...`。
    - 或 DevTools -> Network -> 选中 `/api/stream` -> Response Headers -> `x-request-id`。
  - 2) 后端定位日志
    - 若你按推荐方式将 API 日志写入 `logs/api.log`：按 `requestId` 搜索（见 3.2）。
    - 重点关注事件：`request_received`、`stream_ttft`、`stream_completed`。
  - 3) 判断是超时还是主动取消
    - 超时：通常会出现 `UPSTREAM_TIMEOUT`，或日志中出现类似 `ragflow_request_timeout`/上游请求超时。
    - 取消：错误码可能为 `CANCELLED`，或日志中 `Request cancelled`。

- **回滚或降级**
  - 临时降级为“无引用模式”：允许 stream 正常返回文本，但忽略 citations（当前 API 在 RAGFlow retrieve 失败时会告警并继续）。
  - 临时提高 provider 超时时间（如果你已接入真实 provider）。

### 2.2 RAGFlow 不可用（ragflow unavailable）

- **症状**
  - UI 中 citations 长时间为空或一直显示 `(no citations yet)`。
  - API 日志出现：`ragflow_retrieve_failed`、`RAGFlow request timed out`、`RAGFlow request failed`。

- **可能原因**
  - RAGFlow 服务不可达/502/503。
  - RAGFlow 响应非 JSON，或响应结构不符合契约（会导致 `CONTRACT_VIOLATION`）。
  - 网络超时（默认 ragflow client `timeoutMs` 约 8000ms）。

- **排查步骤（以 requestId 为主线）**
  - 1) 从 UI 侧找到触发请求的 `requestId`（同 2.1）。
  - 2) 在 API 日志中搜索 `requestId`，关注事件：
    - `ragflow_request_start`
    - `ragflow_request_timeout`
    - `ragflow_request_failed`
    - `ragflow_response_invalid`
    - `ragflow_retrieve_completed`
  - 3) 如果你使用真实 RAGFlow：
    - 检查 `RAGFLOW_API_URL` 指向的地址是否可达，并确认 `POST {baseUrl}/search` 可正常返回 JSON。

- **回滚或降级**
  - 降级为“无检索/无证据”模式：继续回答但不返回 citations（当前实现已具备：retrieve 失败只告警，不阻塞 stream）。
  - 业务侧提示用户“引用暂不可用，请稍后重试”（以减少误报）。

### 2.3 Citations 降级/unavailable

- **症状**
  - citations 列表中某些条目 `status=degraded`，并显示 `degradedReason`。
  - 点击 citation 后 Evidence 面板显示 `status=unavailable` 或无法显示 snippet。

- **原因（按代码契约）**
  - **degraded**：RAGFlow chunk 缺少定位字段（例如同时缺少 `page_number` 和 `offset_start`），会被标记为 `degraded`。
  - **unavailable**：`/api/evidence` 通过 `citationId` 查询不到 repository 记录时，返回 `status=unavailable`，并带 `degradedReason="Citation record not found in repository"`。

- **排查步骤（以 requestId 为主线）**
  - 1) 前端拿到 `requestId`
    - Evidence 面板相关请求为 `GET /api/evidence?citationId=...`，从 Response Headers 取 `x-request-id`。
  - 2) 后端日志中搜 `requestId`
    - 关注事件：`ragflow_evidence_store_put_start` / `ragflow_evidence_store_put_done` / `evidence_failed`。
  - 3) 检查隔离头是否一致
    - `/api/evidence` 要求 `x-tenant-id`、`x-project-id`。
    - `citationId` 若为 `ragflow:{tenantId}:{projectId}:{chunkId}`，tenantId/projectId 必须与请求头一致，否则会返回 `AUTH_ERROR`。

- **回滚或降级**
  - 对 `degraded/unavailable` 的 citations：UI 继续展示 snippet（如果有）与原因，并允许用户在没有 evidence 的情况下继续阅读输出。
  - 如果频繁出现 `unavailable`：优先排查 evidence store 是否写入成功（`ragflow_evidence_store_put_*` 日志）。

## 3. 排查指引

### 3.1 按 requestId 排查

`requestId` 是所有排查的主线：

- Web 会在每次 run 时生成 `req_web_*`（见 `apps/web/src/App.tsx` 的 `createRequestId()`），并通过请求头 `x-request-id` 传给 API。
- API 会：
  - 优先使用传入的 `x-request-id`；缺省时自动生成 `req_<uuid>`。
  - 在所有响应中回写 `x-request-id`（便于从 DevTools 反查）。
  - 在日志中使用字段名 `requestId` 输出（便于 grep/检索）。

### 3.2 日志查询命令

如果你用 1.3 的方式将日志写入 `logs/api.log`，可复制粘贴以下命令：

- Windows (PowerShell)：

```powershell
# 替换为实际的 requestId
$rid = "req_web_abc123"
Select-String -Path logs/api.log -Pattern $rid
```

- Linux/macOS (bash/zsh)：

```bash
# 替换为实际的 requestId
rid="req_web_abc123"
grep -n "$rid" logs/api.log
```

如果你只在控制台运行 API，没有落盘日志：

- 直接在 IDE 的终端输出里搜索 `requestId` 字符串。

### 3.3 前后端关联（UI -> API -> logs）

下面给出 1 条完整示例（UI -> API -> logs），按 `requestId` 串联：

场景：用户报告“点击引用后 Evidence 面板报错（401）”。

1) 前端：DevTools -> Network -> 找到 `GET /api/evidence?citationId=...`

- Status：`401`
- Response Headers：
  - `x-request-id: req_web_abc123`

2) 后端：在 API 日志中按 requestId 检索

```powershell
$rid = "req_web_abc123"
Select-String -Path logs/api.log -Pattern $rid
```

你通常会看到类似日志事件（示例）：

- `event=request_received`（请求入口）
- `event=evidence_failed`（证据查询失败），错误可能为：`AUTH_ERROR: projectId mismatch (requestId=req_web_abc123)`

3) 根因定位（示例）

- `citationId` 为 `ragflow:{tenantId}:{projectId}:{chunkId}`，而用户在运行后修改了 UI 上的 `projectId`，导致 `/api/evidence` 请求头中的 `x-project-id` 与 `citationId` 内的 projectId 不一致。

4) 处理/回滚/降级

- 立即恢复：将 UI 的 `projectId` 改回与本次 run 一致的值，或重新运行生成新的 citations。
- 长期修复：在 UI 中锁定 run 期间的 `tenantId/projectId`，避免 run 后变更导致 evidence 查询跨项目。
