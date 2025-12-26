# tasks-prompts-v2-T10-T21.md

> 本文件从 v2 任务提示词中拆分出来，用于继续补充 T10-T21。
> 
> 约束：每个 Task 必须是一个独立的 ` ```markdown ` 代码块；Task 之间用 `---` 分隔。

---

## Phase 1：核心闭环（T10-T13）

### Task T10 - RAGFlow Adapter：检索 + 引用字段映射

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T10：RAGFlow Adapter：检索 + 引用字段映射。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有输入/输出必须用 Zod 校验（包含 adapter 入参、RAGFlow 响应、最终 Citation 输出）。
- 错误 message 使用英文。
- 默认强制隔离：必须携带 `tenantId/projectId`，并在检索请求中注入 `projectId` filter。
- 禁止伪造 citations：`citationId` 必须可回源到检索记录，且可被 Evidence API 验证。

# References
- requirements: specs/study-copilot/requirements.md (R20, R21, R41)
- tasks: specs/study-copilot/tasks.md (T10)
- contracts: specs/study-copilot/design/design-contracts.md (Citation / Evidence Model)
- design: specs/study-copilot/design/design-backend.md

# Execution Plan

1) 定义 adapter 输入/输出契约（Zod）
- Scope:
  - 输入：`query`、`filters`（必须包含 `projectId`）、可选 `topK`/`scoreThreshold` 等
  - 输出：`chunks`（用于回答增强）+ `citations`（统一为 contracts 的 Citation 模型）
- Files（建议）:
  - packages/core/src/adapters/ragflow/types.ts
  - packages/core/src/contracts/citation.ts
- Requirements:
  - adapter 输出必须能被 `Citation` schema parse

2) 实现 RAGFlow client 与请求参数构建
- Scope:
  - 统一 HTTP client（复用仓库现有 fetch/undici/axios 之一）
  - 请求必须携带：tenantId/projectId/requestId（header 或 body，按你后端约定）
- Files（建议）:
  - packages/core/src/adapters/ragflow/client.ts
  - packages/core/src/adapters/ragflow/request.ts
- Requirements:
  - 缺少 projectId：必须拒绝（AUTH_ERROR）或走明确的降级策略（必须一致且可测试）

3) 字段映射：RAGFlow -> Citation
- Scope:
  - 映射 `documentId/sourceType/locator/snippet/status` 等字段
  - 生成 `citationId`：必须稳定可复现或可查表回源
- Files（建议）:
  - packages/core/src/adapters/ragflow/mapper.ts
- Requirements:
  - 定位字段缺失/不可用：必须降级为 `status=degraded` 且 `degradedReason` 非空

4) 错误与降级策略
- Scope:
  - RAGFlow 超时：UPSTREAM_TIMEOUT（retryable=true）
  - RAGFlow 不可用：UPSTREAM_UNAVAILABLE（retryable=true）
  - 返回结构不符合预期：CONTRACT_VIOLATION（retryable=false）
- Files（建议）:
  - packages/core/src/contracts/error.ts
  - packages/core/src/adapters/ragflow/errors.ts
- Requirements:
  - error message 必须英文且包含 requestId

5) 集成：接入核心链路并保证端到端产出 citations
- Scope:
  - 将 RAGFlow adapter 接入一次端到端执行链路（例如检索工具调用/检索阶段），确保最终响应可返回 citations（即使为 mock 数据也必须符合契约）
- Files（建议）:
  - packages/core/src/adapters/ragflow/*
  - packages/core/src/services/*（以实际任务运行入口为准）
- Requirements:
  - 端到端产出的 citations 必须可被 `Citation` schema parse

6) 测试
- Scope:
  - 单元：mock RAGFlow 响应 -> citations 映射完整且可 parse
  - 单元：缺失 locator 字段 -> status=degraded 且 degradedReason 非空
  - 单元：缺失 projectId -> 拒绝/降级策略符合预期
  - 集成：一次端到端执行 -> 最终响应包含 citations（可用 mock RAGFlow）
- Files（建议）:
  - packages/core/src/adapters/ragflow/__tests__/mapper.test.ts
  - packages/core/src/adapters/ragflow/__tests__/isolation.test.ts
  - tests/integration/ragflow.citations.e2e-ish.test.ts
- Requirements:
  - 至少 3 条可自动化断言，覆盖 happy path + 至少 2 条错误/降级分支

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元测试：mock RAGFlow 返回 -> 产出的 citations 可被 `Citation` schema parse
  - 单元测试：默认携带 projectId filter（断言最终请求参数包含 projectId 或等价 filter）
  - 单元测试：定位字段缺失 -> citation.status=degraded 且 degradedReason 非空
  - 单元测试：缺失 projectId -> 返回 AUTH_ERROR（或等价），且 message 英文
  - 集成测试：一次端到端执行可返回 citations，且每条 citation 可被 `Citation` schema parse（可用 mock RAGFlow）
  - 属性测试（可选）：使用 fast-check 生成随机 RAGFlow 响应，验证映射后的 citations 始终可被 Citation schema parse

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
- 输出（强制包含以下内容）：
  - adapter 文件路径清单（client/request/mapper/types）
  - 映射表：RAGFlow 字段 -> Citation 字段（示例格式）：
    ```
    RAGFlow.chunk_id -> Citation.citationId
    RAGFlow.document_id -> Citation.documentId
    RAGFlow.page_number -> Citation.locator.page
    RAGFlow.offset_start -> Citation.locator.offsetStart
    RAGFlow.offset_end -> Citation.locator.offsetEnd
    RAGFlow.content -> Citation.snippet
    ```
  - 1 个降级示例（status=degraded + degradedReason）：
    ```json
    {
      "citationId": "c_xyz",
      "sourceType": "document",
      "projectId": "proj_123",
      "locator": {},
      "status": "degraded",
      "degradedReason": "RAGFlow response missing page_number field"
    }
    ```
  - 测试文件清单与断言点

# 依赖关系与风险评估

## 前置依赖
- T2：Citation/Evidence/Error 契约
- T4：tenantId/projectId 隔离

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有 HTTP client | 低 | 低 |

## 高风险点
1. **外部字段变更**：RAGFlow 返回字段变化导致映射失效
   - 缓解措施：契约测试（T17）+ 映射单元测试阻断回归
2. **隔离策略遗漏**：projectId 未被强制注入
   - 缓解措施：集中在 request builder 注入；测试断言 filter 存在

## 回滚策略
- 若 RAGFlow 不稳定：允许降级为“无 citations 的回答增强”（明确标注 citations unavailable），但禁止伪造 citations。
```

---

### Task T11 - Evidence API：citationId -> 证据展示数据

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T11：Evidence API：citationId -> 证据展示数据。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有输入/输出必须用 Zod 校验（包含 querystring 与响应体）。
- 错误 message 使用英文。
- 禁止伪造证据：不可回源时必须返回 `status=unavailable` 或等价降级信息。
- 默认强制隔离：跨 projectId 默认拒绝（AUTH_ERROR）。

# References
- requirements: specs/study-copilot/requirements.md (R21, R41, R10)
- tasks: specs/study-copilot/tasks.md (T11)
- contracts: specs/study-copilot/design/design-contracts.md (Evidence Endpoint)
- design: specs/study-copilot/design/design-backend.md

# Execution Plan

1) 定义 Evidence API 契约（Zod）
- Scope:
  - 请求：`GET /api/evidence?citationId=...`
  - 响应：Evidence（source/locator/snippet?/status/degradedReason?）
- Files（建议）:
  - packages/core/src/contracts/evidence.ts
  - apps/api/src/routes/evidence.ts
- Requirements:
  - 响应必须可被 Evidence schema parse

2) citationId 回源与查询抽象
- Scope:
  - citationId -> 查找检索记录（来自 T10）或其他来源记录
  - 先允许 in-memory repo，但接口必须可替换为 DB
- Files（建议）:
  - packages/core/src/repos/citation-repo.ts
  - packages/core/src/services/evidence-service.ts
- Requirements:
  - 回源失败：必须返回 status=unavailable（禁止伪造 snippet）

3) 隔离校验
- Scope:
  - 校验 RequestContext.projectId 与 citation.projectId 一致
  - 跨 projectId：返回 AUTH_ERROR（含 requestId）
- Files（建议）:
  - apps/api/src/routes/evidence.ts
  - packages/core/src/context/assertions.ts
- Requirements:
  - 默认拒绝跨 projectId

4) 错误与降级策略
- Scope:
  - citationId 不存在：NOT_FOUND（或等价）
  - 回源失败：status=unavailable（非 500）
  - 上游不可用：UPSTREAM_UNAVAILABLE/UPSTREAM_TIMEOUT（按你的回源链路）
- Files（建议）:
  - packages/core/src/contracts/error.ts
- Requirements:
  - 所有错误 message 英文且含 requestId

5) 测试
- Scope:
  - 集成：合法 citationId -> 200 且响应可 parse
  - 错误：跨 projectId -> AUTH_ERROR（含 requestId）
  - 降级：citation 不可验证 -> status=unavailable 且 snippet 为空/缺失
- Files（建议）:
  - tests/integration/evidence.endpoint.test.ts
- Requirements:
  - 至少 3 条可自动化断言，覆盖成功 + 错误 + 降级

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 集成测试：合法 citationId 返回 200，且响应可被 Evidence schema parse
  - 集成测试：跨 projectId 返回 AUTH_ERROR（含 requestId）
  - 集成测试：不可回源 citationId 返回 status=unavailable，且 snippet 不存在或为空

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] Evidence schema 定义完成（Zod）
- [x] Evidence API 路由完成（GET /api/evidence）
- [x] citationId 回源 repo/service 抽象完成
- [x] projectId 隔离校验完成（跨 projectId -> AUTH_ERROR）
- [x] 不可回源场景降级完成（status=unavailable）
- [x] 集成测试覆盖：成功/跨项目/不可回源

# Output
- 输出（强制包含以下内容）：
  - endpoint 文件路径 + 请求/响应示例（脱敏）：
    ```
    GET /api/evidence?citationId=c_xyz
    Headers: x-tenant-id: tenant_123, x-project-id: proj_456
    
    Response 200:
    {
      "citationId": "c_xyz",
      "sourceType": "document",
      "projectId": "proj_456",
      "locator": { "page": 5, "offsetStart": 100, "offsetEnd": 200 },
      "snippet": "This is the evidence text...",
      "status": "verifiable"
    }
    ```
  - status=unavailable 的示例响应（无伪造 snippet）：
    ```json
    {
      "citationId": "c_missing",
      "sourceType": "document",
      "projectId": "proj_456",
      "locator": {},
      "status": "unavailable",
      "degradedReason": "Citation record not found in repository"
    }
    ```
  - 测试文件清单与断言点

# 依赖关系与风险评估

## 前置依赖
- T4：projectId 隔离
- T10：RAGFlow Adapter（提供 citationId 与回源记录）
- T2：Evidence/Error 契约

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有依赖 | 低 | 低 |

## 高风险点
1. **证据伪造风险**：回源失败仍返回 snippet
   - 缓解措施：硬约束禁止；测试断言不可回源时 snippet 为空

## 回滚策略
- 若回源链路未就绪：先返回 status=unavailable，并在 UI 明确提示“证据不可用”。
```

---

### Task T12 - UI：模板选择/运行/steps/citations 的最小可用实现

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T12：UI：模板选择/运行/steps/citations 的最小可用实现。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 前端必须使用 contracts 的 Zod schema 解析后端响应（禁止“相信后端”）。
- 错误 message 使用英文。
- 可用性要求：键盘可完成最小闭环；状态反馈齐全（loading/empty/error/cancelled）。

# References
- requirements: specs/study-copilot/requirements.md (R3, R4, R5, R21)
- tasks: specs/study-copilot/tasks.md (T12)
- design: specs/study-copilot/design/design-ui.md
- design: specs/study-copilot/design/design-frontend.md

# Execution Plan

1) 对齐接口与契约解析
- Scope:
  - createTask/cancelTask（GraphQL）
  - stream 消费（T8）
  - step events 渲染（T9）
  - evidence 拉取（T11）
- Files（建议）:
  - apps/web/src/lib/api/*
  - apps/web/src/lib/contracts/*（若前端侧需要 re-export）
- Requirements:
  - 所有响应必须能被 contracts schema parse；parse 失败视为 CONTRACT_VIOLATION

2) Template Picker + Task Runner
- Scope:
  - 模板列表加载/选择
  - 点击运行：createTask -> 进入 running 状态
- Files（建议）:
  - apps/web/src/pages/RunPage.tsx
  - apps/web/src/components/TemplatePicker.tsx
- Requirements:
  - 失败必须可重试（英文错误提示）

3) Stream Output + Step Timeline
- Scope:
  - 输出区增量渲染（至少 2 次追加）
  - StepEvent 归并/排序（按 timestamp/stepId）
- Files（建议）:
  - apps/web/src/components/StreamOutput.tsx
  - apps/web/src/components/StepTimeline.tsx
- Requirements:
  - token 与 event 必须可区分（按 part.type 或 framing 规则）

4) Citations List + Evidence Panel
- Scope:
  - 引用列表渲染
  - 点击 citationId -> 调用 Evidence API -> 展示来源/定位/状态
- Files（建议）:
  - apps/web/src/components/CitationsList.tsx
  - apps/web/src/components/EvidencePanel.tsx
- Requirements:
  - status=unavailable/degraded 必须明确展示（禁止“空白”）

5) 取消、错误、重试与可用性验收
- Scope:
  - 取消：运行中 cancel -> stream 终止 + 状态进入 cancelled
  - error block：可视化展示 + retryable 语义
  - 键盘可用性与响应式断点
- Files（建议）:
  - apps/web/src/pages/RunPage.tsx
  - apps/web/src/components/StreamOutput.tsx
  - apps/web/src/components/StepTimeline.tsx
  - apps/web/src/lib/api/*
- Requirements:
  - 取消后不再更新输出/事件

6) 测试（E2E 优先）
- Scope:
  - 启动闭环：选择模板 -> 运行 -> running
  - 流式增量：输出至少追加 2 次
  - StepTimeline：至少出现 3 类事件
  - 引用点击：触发 Evidence 请求并展示
  - 取消：进入 cancelled 并提供重试
- Files（建议）:
  - tests/e2e/flow.m1.test.ts
- Requirements:
  - 若仓库已有 e2e runner 用现有；若没有，先建立最小骨架再补用例

# Verification
- 自动化断言（至少覆盖以下断言）：
  - E2E：选择模板 -> createTask -> running
  - E2E：输出区增量更新至少 2 次
  - E2E：StepTimeline 至少出现 3 类事件（step_started/tool_called/step_completed）
  - E2E：点击引用触发 Evidence 请求并展示 status
  - E2E：取消后进入 cancelled 且提供重试入口
  - 响应式测试：在常见断点（mobile: 375px, tablet: 768px, desktop: 1024px）下核心交互可用

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] 前端 API 层完成（createTask/cancelTask/stream/evidence）
- [x] TemplatePicker 完成（加载/选择）
- [x] TaskRunner 完成（运行/取消/重试）
- [x] StreamOutput 完成（增量渲染 + error block 展示）
- [x] StepTimeline 完成（事件归并/排序）
- [x] CitationsList + EvidencePanel 完成（证据展示）
- [x] 响应式布局完成（mobile/tablet/desktop 断点）
- [x] E2E 覆盖最小闭环

# Output
- 输出（强制包含以下内容）：
  - UI 关键组件清单 + 交互说明：
    ```
    - TemplatePicker: 加载模板列表，支持键盘选择（↑↓ + Enter）
    - TaskRunner: 运行按钮 -> createTask -> 显示 loading -> running 状态
    - StreamOutput: 增量渲染文本，支持 error block 展示
    - StepTimeline: 按 timestamp 排序，支持折叠/展开
    - CitationsList: 点击 citationId -> 触发 Evidence API
    - EvidencePanel: 展示 status/locator/snippet，支持关闭
    ```
  - E2E 用例列表与断言点
  - 失败排查指引：如何用 requestId 定位后端日志
    ```
    1. 前端：在浏览器 DevTools Network 中找到失败请求的 x-request-id header
    2. 后端：grep "requestId":"<request-id>" logs/*.log
    3. 关联：stream/events/evidence 请求都包含同一个 requestId
    ```

# 依赖关系与风险评估

## 前置依赖
- T6：GraphQL
- T8：Streaming
- T9：Step Events
- T10：RAGFlow Adapter
- T11：Evidence API

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有前端依赖 | 低 | 低 |

## 高风险点
1. **协议消费不一致**：前端解析 stream 与后端输出不匹配
   - 缓解措施：共用 decoder/contracts；E2E 覆盖解析

## 回滚策略
- 若 timeline/citations 不稳定：先仅保留输出区（最小可用），逐步打开功能。
```

---

### Task T13 - 导出：Markdown/Obsidian 友好格式

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 1：核心闭环。
你的目标是完成任务 T13：导出：Markdown/Obsidian 友好格式。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 导出必须 deterministic（同输入同输出）。
- 错误 message 使用英文。
- 导出必须保留引用元数据（至少包含 citationId + locator/projectId 等关键字段）。

# References
- requirements: specs/study-copilot/requirements.md (R3)
- tasks: specs/study-copilot/tasks.md (T13)
- contracts: specs/study-copilot/design/design-contracts.md (Citation/Evidence)

# Execution Plan

1) 定义导出格式
- Scope:
  - 正文 + 引用元数据块（Obsidian 友好）
  - 明确引用落盘结构（例如 footnotes 或 YAML/JSON block）
- Files（建议）:
  - packages/core/src/export/markdown.ts
- Requirements:
  - 引用必须可追溯（citationId 可用于 Evidence API）

2) 实现 formatter（core）
- Scope:
  - `exportToMarkdown(input) -> string`
  - 保留 citations（按契约字段）
- Files（建议）:
  - packages/core/src/export/markdown.ts
- Requirements:
  - 输出必须稳定，适合快照测试

3) UI：导出预览 + 下载
- Scope:
  - 预览导出内容
  - 下载为 .md
- Files（建议）:
  - apps/web/src/components/ExportDialog.tsx
- Requirements:
  - 失败必须展示英文错误并可重试

4) 测试
- Scope:
  - 单元：同输入输出 deterministic（快照测试）
  - 单元：导出包含 citationId 与 locator/projectId
  - E2E：导出流程成功且 UI 有明确反馈
- Files（建议）:
  - packages/core/src/export/__tests__/markdown.test.ts
  - tests/e2e/export.test.ts
- Requirements:
  - 至少 3 条可自动化断言

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 单元测试：exportToMarkdown 对同一输入输出一致（快照）
  - 单元测试：导出内容包含 citationId 与 locator/projectId
  - E2E：点击导出 -> 下载/复制内容包含正文 + 引用块

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] 导出格式规范明确（正文 + 引用元数据）
- [x] markdown formatter 实现完成（deterministic）
- [x] UI 导出预览/下载完成
- [x] 单元测试覆盖：deterministic + 引用元数据保留
- [x] E2E 覆盖导出流程

# Output
- 输出（强制包含以下内容）：
  - 导出格式示例（Markdown）：
    ````markdown
    # 任务结果
    
    这是回答的正文内容...
    
    ## 引用
    
    1. [c_xyz] 来源：document, 项目：proj_123, 位置：page 5, offset 100-200
    2. [c_abc] 来源：ragflow_chunk, 项目：proj_123, 位置：section 2.3
    
    ---
    
    <!-- Metadata (Obsidian 友好) -->
    ```yaml
    citations:
      - citationId: c_xyz
        sourceType: document
        projectId: proj_123
        locator:
          page: 5
          offsetStart: 100
          offsetEnd: 200
      - citationId: c_abc
        sourceType: ragflow_chunk
        projectId: proj_123
        locator:
          section: "2.3"
    ```
    ````
  - formatter 输入/输出契约说明
  - 测试文件清单与断言点

# 依赖关系与风险评估

## 前置依赖
- T12：UI 运行与 citations 展示
- T2：Citation/Evidence 契约

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有依赖 | 低 | 低 |

## 高风险点
1. **引用元数据丢失**：导出后不可追溯
   - 缓解措施：单元测试硬断言 citationId/locator/projectId 必须存在

## 回滚策略
- 若 UI 导出不稳定：先仅提供复制到剪贴板的 markdown 文本，后续再加下载。
```

---

## Phase 2：可靠性/性能/成本（T14-T16）

### Task T14 ✅ - Provider 与多模型路由（最小可用策略）

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 2：可靠性/性能/成本。
你的目标是完成任务 T14：Provider 与多模型路由（最小可用策略）。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有 runtime config 必须经 Zod 校验。
- 错误 message 使用英文。
- Provider adapter 必须可替换（新增 provider 不修改业务编排）。

# References
- requirements: specs/study-copilot/requirements.md (R14)
- tasks: specs/study-copilot/tasks.md (T14)
- design: specs/study-copilot/design/design-agent.md

# Execution Plan

1) 抽象 Provider Adapter 接口
- Scope:
  - 统一模型调用入口（streamText/generateText 或等价）
  - 支持 streaming 与非 streaming
- Files（建议）:
  - packages/core/src/providers/provider.ts
  - packages/core/src/providers/index.ts
- Requirements:
  - 适配器的输入输出必须可序列化（便于记录与复现）

2) 实现最小路由策略
- Scope:
  - 按配置选择 provider/model
  - 允许按“任务复杂度/成本预算”选择模型（最小启发式即可）
- Files（建议）:
  - packages/core/src/providers/router.ts
- Requirements:
  - 路由决策必须 deterministic（同配置同输入同输出）

3) 基础指标采集
- Scope:
  - 记录延迟、错误、token 用量（若可得）
  - 与 requestId/taskId 关联
- Files（建议）:
  - packages/core/src/logger/*
  - packages/core/src/providers/metrics.ts
- Requirements:
  - 日志 message 英文

4) 测试
- Scope:
  - 集成：切换 provider/model 配置不改业务代码即可生效
  - 集成：主 provider 不可用时可走 fallback（mock/spy 断言）
- Files（建议）:
  - packages/core/src/providers/provider-routing.test.ts
- Requirements:
  - 至少 3 条可自动化断言（含错误分支）

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 集成测试：切换 provider/model 配置后，路由选择发生变化且业务代码无需修改
  - 集成测试：主 provider 抛错 -> fallback provider 被调用（mock/spy 断言）
  - 集成测试：路由决策日志包含 requestId/taskId/provider/model

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] 测试通过（npm run test）
- [x] Provider adapter 接口完成（可替换）
- [x] 至少 1 个 provider 实现可用（可先 mock）
- [x] 路由策略实现完成（按配置/最小启发式）
- [x] 指标/日志采集完成（与 requestId/taskId 关联）
- [x] 集成测试覆盖：切换生效 + fallback

# Output
- 输出（强制包含以下内容）：
  - Provider 接口与实现文件路径
  - 路由策略说明 + 配置示例
  - 测试文件清单与断言点

# 依赖关系与风险评估

## 前置依赖
- T7：Agent Proxy（模型调用链路）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有模型 SDK | 低 | 中（SDK 差异） |

## 高风险点
1. **多 provider 行为差异**：token 计数/错误形态不一致
   - 缓解措施：统一在 adapter 层归一化为 AppError

## 回滚策略
- 若路由策略不稳定：先固定单一 provider/model，仅保留 adapter 抽象。
```

---

### Task T15 - 降级/重试/错误模型统一 + Guardrails 接入

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 2：可靠性/性能/成本。
你的目标是完成任务 T15：降级/重试/错误模型统一 + Guardrails 接入。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 所有错误必须统一为 AppError（或等价错误模型），并可被 Zod schema parse。
- 错误 message 使用英文。
- Guardrails 触发必须返回 `GUARDRAIL_BLOCKED`（或等价），且 retryable=false。

# References
- requirements: specs/study-copilot/requirements.md (R7, R12)
- tasks: specs/study-copilot/tasks.md (T15)
- contracts: specs/study-copilot/design/design-contracts.md (Error Model)

# Execution Plan

1) 统一错误模型输出
- Scope:
  - GraphQL/REST/stream/error block 的错误结构统一
  - requestId 必须出现在所有错误中
- Files（建议）:
  - packages/core/src/contracts/error.ts
  - apps/api/src/graphql/error-mapper.ts
  - apps/api/src/routes/stream.ts
- Requirements:
  - 任何错误都能被 AppError schema parse

2) Provider 降级/重试策略
- Scope:
  - 超时/不可用：重试（有上限）或切换 fallback provider（对齐 T14）
  - 明确 retryable 语义
- Files（建议）:
  - packages/core/src/providers/retry.ts
  - packages/core/src/providers/router.ts
- Requirements:
  - 重试必须可配置且可被测试观测

3) Guardrails 接入
- Scope:
  - 输入/输出扫描
  - 阻断与安全事件记录（可复用 StepEvent）
- Files（建议）:
  - packages/core/src/guardrails/guardrails.ts
  - packages/core/src/agent/hooks.ts
- Requirements:
  - guardrails 阻断返回 GUARDRAIL_BLOCKED 且 retryable=false

4) 契约违规处理
- Scope:
  - 不可映射 citationId / 跨 projectId / schema parse 失败 -> CONTRACT_VIOLATION
- Files（建议）:
  - packages/core/src/citations/validate-citations.ts
- Requirements:
  - 违规必须硬失败（禁止 silent ignore）

5) 测试
- Scope:
  - 集成：provider 超时/不可用触发 fallback
  - 集成：guardrails 阻断 -> 返回 GUARDRAIL_BLOCKED
  - 集成：伪造 citation -> CONTRACT_VIOLATION
- Files（建议）:
  - tests/integration/retry-and-fallback.test.ts
  - tests/integration/guardrails.test.ts
- Requirements:
  - 至少 3 条可自动化断言，覆盖 2 个错误分支

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 集成测试：provider 超时/不可用 -> 触发 fallback，且输出统一 AppError（含 code/message/retryable/requestId）
  - 集成测试：guardrails 阻断 -> 返回 GUARDRAIL_BLOCKED 且 retryable=false
  - 集成测试：不可映射 citation -> 返回 CONTRACT_VIOLATION（含 requestId）

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] AppError 统一模型落地（GraphQL/REST/stream）
- [x] provider 重试/降级策略实现完成（可配置）
- [x] guardrails 接入完成（输入/输出扫描 + 阻断）
- [x] 契约违规统一为 CONTRACT_VIOLATION
- [x] 集成测试覆盖：fallback / guardrails / contract violation

# Output
- 输出（强制包含以下内容）：
  - 错误码表 + 触发条件
  - 重试/降级策略说明（含配置示例）
  - 最小回归用例清单（测试文件路径 + 断言点）

# 依赖关系与风险评估

## 前置依赖
- T14：Provider/路由
- T7：Agent Proxy

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有依赖 | 低 | 低 |

## 高风险点
1. **重试导致成本飙升**
   - 缓解措施：上限 + 仅对 retryable 错误重试 + 可配置开关

## 回滚策略
- 若重试/降级引发不稳定：关闭重试与 fallback，仅保留统一错误模型。
```

---

### Task T16 - 缓存：响应缓存与缓存标记

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 2：可靠性/性能/成本。
你的目标是完成任务 T16：缓存：响应缓存与缓存标记。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 缓存 key 必须 deterministic（同输入同 key）。
- 错误 message 使用英文。
- 命中缓存必须在响应/事件中显式标记（便于观测）。

# References
- requirements: specs/study-copilot/requirements.md (R13)
- tasks: specs/study-copilot/tasks.md (T16)
- design: specs/study-copilot/design/design-backend.md

# Execution Plan

1) 设计 cache key
- Scope:
  - key 包含：templateRef + 输入消息摘要 + 检索摘要（若启用）+ 路由模型信息
- Files（建议）:
  - packages/core/src/cache/cache-key.ts
- Requirements:
  - key 必须可测试（快照或固定样例）

2) 实现缓存存储（最小可用）
- Scope:
  - 内存缓存（LRU）+ TTL
- Files（建议）:
  - packages/core/src/cache/memory-cache.ts
- Requirements:
  - TTL 过期必须可验证

3) 命中标记与可观测性
- Scope:
  - 响应附带 `cached=true` 或等价字段
  - 日志/事件记录 cacheHit
- Files（建议）:
  - packages/core/src/cache/instrumentation.ts
- Requirements:
  - 与 requestId/taskId 关联

4) 与核心链路集成
- Scope:
  - 在 Agent/Provider 调用前后接入缓存
- Files（建议）:
  - packages/core/src/services/task-runner.ts
- Requirements:
  - 命中缓存时不触发模型调用

5) 测试
- Scope:
  - 集成：同输入重复请求命中缓存（spy 断言不触发模型调用）
  - 集成：命中时响应显式标记缓存来源
  - 集成：TTL 过期后必须重新走模型调用
- Files（建议）:
  - tests/integration/cache.test.ts
- Requirements:
  - 至少 3 条可自动化断言

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 集成测试：同输入第二次请求命中缓存，且不触发模型调用（mock/spy）
  - 集成测试：命中时响应含 cached 标记（字段名按你契约实现）
  - 集成测试：TTL 过期后不再命中缓存

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] cache key 规则实现完成（deterministic）
- [x] LRU + TTL 内存缓存实现完成
- [x] cache hit 标记与日志/事件完成
- [x] 核心链路接入缓存（命中不触发模型调用）
- [x] 集成测试覆盖：命中/标记/TTL

# Output
- 输出（强制包含以下内容）：
  - cache key 规则说明 + 示例 key：
    ```
    规则：sha256(templateRef + inputHash + retrievalHash + modelInfo)
    示例：cache:v1:sha256:a1b2c3d4e5f6...
    
    组成部分：
    - templateRef: templateId:version 或 templateDefinitionHash
    - inputHash: sha256(messages 的 JSON 序列化)
    - retrievalHash: sha256(检索结果的 citationIds 排序后序列化)
    - modelInfo: provider:model:version
    ```
  - 命中示例（含 cached 标记）：
    ```json
    {
      "text": "This is the cached response...",
      "citations": [...],
      "metadata": {
        "cached": true,
        "cacheKey": "cache:v1:sha256:a1b2c3d4e5f6...",
        "cachedAt": "2025-12-22T10:30:00Z"
      }
    }
    ```
  - 测试文件清单与断言点

# 依赖关系与风险评估

## 前置依赖
- T7：Agent Proxy
- T10：RAGFlow Adapter（如缓存包含检索摘要）

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 先用内存缓存 | 低 | 中（内存占用） |

## 高风险点
1. **缓存污染**：key 设计不完整导致错误命中
   - 缓解措施：把 templateRef/检索摘要/模型路由都纳入 key；集成测试覆盖

## 回滚策略
- 若缓存引发错误：提供 feature flag 关闭缓存，仅保留 key 计算与观测。
```

---

## Phase 3：测试与质量（T17-T19）

### Task T17 - 契约测试：stream/events/citation/ragflow 映射

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 3：测试与质量。
你的目标是完成任务 T17：契约测试：stream/events/citation/ragflow 映射。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 契约以 Zod schema 为单一事实源。
- 错误 message 使用英文。
- 契约测试必须可在 CI/本地重复运行并通过。

# References
- requirements: specs/study-copilot/requirements.md (R4, R5, R20, R21)
- tasks: specs/study-copilot/tasks.md (T17)
- contracts: specs/study-copilot/design/design-contracts.md

# Execution Plan

1) stream protocol 契约测试
- Scope:
  - 成功块可解析
  - 错误块可解析为 AppError
  - 取消路径可识别
- Files（建议）:
  - tests/contract/stream.contract.test.ts
- Requirements:
  - 使用 decoder 解析并对 Zod schema 做断言

2) events schema 契约测试
- Scope:
  - StepEvent 6 类事件 parse
  - tool_called.argsSummary 脱敏断言
- Files（建议）:
  - tests/contract/events.contract.test.ts
- Requirements:
  - 至少断言敏感字段不存在（token/apiKey/secret）

3) citation/evidence 契约测试
- Scope:
  - Citation/Evidence 可 parse
  - projectId 隔离字段存在
- Files（建议）:
  - tests/contract/citation-evidence.contract.test.ts
- Requirements:
  - 跨 projectId 必须失败（AUTH_ERROR 或等价）

4) RAGFlow 映射回归测试
- Scope:
  - mock RAGFlow 响应 -> 映射结果可 parse
  - 字段变更导致 parse 失败时测试必须失败
- Files（建议）:
  - tests/contract/ragflow-mapping.contract.test.ts
- Requirements:
  - 明确固定的 mock 输入样例，避免随机

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 契约测试：stream 成功块可解析，错误块可解析为 AppError
    ```typescript
    // 示例断言（伪代码：使用仓库内“现有”的 stream decoder 将响应解析为 parts）
    const parts = /* decode stream response text to parts using repo decoder */ [] as Array<{ kind: string; payload?: unknown }>;
    expect(parts.some(p => p.kind === 'text')).toBe(true);
    const errorPart = parts.find(p => p.kind === 'error');
    if (errorPart) {
      expect(AppErrorSchema.safeParse(errorPart.payload).success).toBe(true);
    }
    ```
  - 契约测试：StepEvent 6 类事件可 parse，且 argsSummary 脱敏
    ```typescript
    // 示例断言
    const event = StepEventSchema.parse(rawEvent);
    if (event.type === 'tool_called') {
      expect(event.payload.argsSummary).not.toContain('token');
      expect(event.payload.argsSummary).not.toContain('apiKey');
      expect(event.payload.argsSummary).not.toContain('secret');
    }
    ```
  - 契约测试：Citation/Evidence 可 parse 且包含 projectId
  - 契约测试：RAGFlow 映射对字段缺失/变更会失败（阻断回归）

# Checklist
- [x] 代码编译通过（npm run build）
- [x] 类型检查通过（npm run typecheck）
- [x] Lint 检查通过（npm run lint）
- [x] stream contract tests 完成（success/error/cancel）
- [x] events contract tests 完成（parse + 脱敏）
- [x] citation/evidence contract tests 完成（parse + 隔离）
- [x] ragflow mapping contract tests 完成（回归阻断）
- [x] CI/本地可一键运行并稳定通过

# Output
- 输出（强制包含以下内容）：
  - 契约测试文件清单
  - 每个测试覆盖的契约点列表
  - 1 个“字段变更导致失败”的示例说明

# 依赖关系与风险评估

## 前置依赖
- T2：contracts schema
- T8：streaming
- T9：events
- T10：ragflow mapping

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有 test runner | 低 | 低 |

## 高风险点
1. **测试脆弱**：过度依赖具体文案导致频繁改动
   - 缓解措施：断言结构与关键字段，不断言无关文本

## 回滚策略
- 若契约测试阻塞迭代：先最小化断言集合（保留 parseability + 隔离 + 脱敏）再逐步加严。
```

---

### Task T18 - 端到端测试：模板启动 -> 运行 -> 引用 -> 导出

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 3：测试与质量。
你的目标是完成任务 T18：端到端测试：模板启动 -> 运行 -> 引用 -> 导出。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- E2E 必须可重复（尽量使用 mock provider/RAGFlow/Evidence）。
- 错误 message 使用英文。
- 所有失败必须输出 requestId（或等价追踪字段）便于定位。

# References
- requirements: specs/study-copilot/requirements.md (R1, R3, R4, R5, R21)
- tasks: specs/study-copilot/tasks.md (T18)
- design: specs/study-copilot/design-overview.md

# Execution Plan

1) 建立稳定的测试数据与 mock 策略
- Scope:
  - mock provider：固定输出、固定延迟
  - mock RAGFlow/Evidence：固定 citations/evidence
- Files（建议）:
  - tests/e2e/fixtures/*
  - tests/e2e/mocks/*
- Requirements:
  - mock 必须 deterministic

2) Happy path 用例
- Scope:
  - 模板选择 -> createTask -> stream 增量 -> step events -> citations -> evidence -> 导出
- Files（建议）:
  - tests/e2e/flow.happy-path.test.ts
- Requirements:
  - 断言至少包含 5 个关键节点

3) Cancel 用例
- Scope:
  - 运行中取消 -> stream 停止 + 状态进入 cancelled -> 可重新运行
- Files（建议）:
  - tests/e2e/flow.cancel.test.ts
- Requirements:
  - 断言取消后不再更新输出/事件

4) Error/Retry 用例
- Scope:
  - 模拟 provider 失败 -> UI 展示 error block -> 重试后成功（或明确不可重试）
- Files（建议）:
  - tests/e2e/flow.error-retry.test.ts
- Requirements:
  - 断言 retryable 语义与 UI 提示一致

5) Isolation 用例
- Scope:
  - 跨 projectId 的 evidence 请求必须失败（AUTH_ERROR 或等价）
- Files（建议）:
  - tests/e2e/flow.isolation.test.ts
- Requirements:
  - 断言错误包含 requestId

# Verification
- 自动化断言（至少覆盖以下断言）：
  - E2E：Happy path 跑通并出现 citations + evidence
  - E2E：Cancel 后 stream 停止且 UI 状态为 cancelled
  - E2E：Error block 可展示且重试路径符合 retryable 语义
  - E2E：跨 projectId 证据请求返回 AUTH_ERROR

# Checklist
- [ ] 代码编译通过（npm run build）
- [ ] 类型检查通过（npm run typecheck）
- [ ] Lint 检查通过（npm run lint）
- [ ] mock 策略完成（provider/ragflow/evidence）
- [ ] Happy path 用例完成
- [ ] Cancel 用例完成
- [ ] Error/Retry 用例完成
- [ ] Isolation 用例完成
- [ ] 本地/CI 可重复运行

# Output
- 输出（强制包含以下内容）：
  - E2E 用例清单与断言点：
    ```
    1. Happy Path: 模板选择 -> 运行 -> stream 增量 -> citations -> evidence -> 导出
    2. Cancel: 运行中取消 -> stream 停止 -> 状态 cancelled -> 可重新运行
    3. Error/Retry: provider 失败 -> error block -> 重试成功
    4. Isolation: 跨 projectId 证据请求 -> AUTH_ERROR
    ```
  - 测试数据/Mock 的组织方式：
    ```
    tests/e2e/fixtures/
      - templates.json: 模板列表
      - mock-provider-responses.json: 固定的模型输出
      - mock-ragflow-responses.json: 固定的检索结果
      - mock-evidence-responses.json: 固定的证据数据
    ```
  - 失败排查指引：如何用 requestId 定位后端日志与前端步骤
    ```
    1. 前端：DevTools Network -> 找到失败请求的 x-request-id
    2. 后端：grep "requestId":"<id>" logs/*.log
    3. 关联：stream/events/evidence 都包含同一个 requestId
    4. 前端步骤：查看 StepTimeline 中的事件序列
    ```

# 依赖关系与风险评估

## 前置依赖
- T12：UI
- T13：导出

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 使用现有 e2e runner | 低 | 中（CI 稳定性） |

## 高风险点
1. **E2E 不稳定**：依赖外部服务或随机性
   - 缓解措施：强制 mock + 固定 fixture；减少时间敏感断言

## 回滚策略
- 若 E2E 阻塞：先保留 1 条 Happy path + 1 条 Cancel 用例作为门禁，其余降级为 nightly。
```

---

### Task T19 - 安全与合规测试：注入/越狱/伪造引用

```markdown
# Context
你是 Niche/Study Copilot 的 QA + Security Specialist。
你正在执行 Phase 3：测试与质量。
你的目标是完成任务 T19：安全与合规测试：注入/越狱/伪造引用。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- 错误 message 使用英文。
- guardrails 触发必须硬阻断并返回 `GUARDRAIL_BLOCKED`（retryable=false）。
- “禁止伪造引用”必须有自动化回归用例保障。

# References
- requirements: specs/study-copilot/requirements.md (R7)
- tasks: specs/study-copilot/tasks.md (T19)
- contracts: specs/study-copilot/design/design-contracts.md (Error/Citation)

# Execution Plan

1) 注入/越狱用例库
- Scope:
  - prompt injection、system override、tool misuse
- Files（建议）:
  - tests/security/injection-cases.ts
- Requirements:
  - 用例必须可复用与可扩展

2) 伪造引用用例库
- Scope:
  - 生成不可映射 citationId
  - 生成跨 projectId citationId
- Files（建议）:
  - tests/security/citation-forgery-cases.ts
- Requirements:
  - 期望行为必须明确：CONTRACT_VIOLATION

3) 自动化回归测试
- Scope:
  - guardrails：触发 -> GUARDRAIL_BLOCKED + retryable=false + requestId
  - 伪造引用：触发 -> CONTRACT_VIOLATION + requestId
- Files（建议）:
  - tests/security/guardrails.security.test.ts
  - tests/security/citations.security.test.ts
- Requirements:
  - 至少 3 条可自动化断言

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 安全测试：注入/越狱用例触发 guardrails -> 返回 GUARDRAIL_BLOCKED，retryable=false，含 requestId
  - 安全测试：伪造 citationId -> 返回 CONTRACT_VIOLATION，含 requestId
  - 回归保障：上述用例集在 CI/本地可重复运行，失败必须阻断

# Checklist
- [ ] 注入/越狱用例库完成
- [ ] 伪造引用用例库完成
- [ ] guardrails 回归测试完成
- [ ] citations 合规回归测试完成
- [ ] CI/本地可重复运行

# Output
- 输出（强制包含以下内容）：
  - 安全用例清单（按类别分组）：
    ```
    ## 注入/越狱用例
    1. Prompt Injection: "Ignore previous instructions and..."
    2. System Override: "You are now a different assistant..."
    3. Tool Misuse: "Call the delete_all_data tool..."
    
    ## 伪造引用用例
    1. 不可映射 citationId: citationId 不存在于检索记录
    2. 跨 projectId citationId: citationId 属于其他 project
    3. 无效 locator: locator 字段格式错误或缺失
    ```
  - 每条用例对应期望错误码（GUARDRAIL_BLOCKED/CONTRACT_VIOLATION）：
    ```
    - 注入/越狱 -> GUARDRAIL_BLOCKED (retryable=false)
    - 伪造引用 -> CONTRACT_VIOLATION (retryable=false)
    ```
  - 自动化测试文件清单与断言点

# 依赖关系与风险评估

## 前置依赖
- T15：Guardrails + 错误模型统一

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 复用现有 test runner | 低 | 低 |

## 高风险点
1. **误拦截**：guardrails 过严导致正常请求失败
   - 缓解措施：用例库分级（block/warn），并在策略中配置

## 回滚策略
- 若安全策略影响可用性：先降级为仅记录安全事件（不阻断），保留测试用例用于回归监控。
```

---

## Phase 4：发布与运维（T20-T21）

### Task T20 - CI/CD 与发布检查清单

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 4：发布与运维。
你的目标是完成任务 T20：CI/CD 与发布检查清单。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- CI 必须以自动化质量门禁为目标（lint/typecheck/test/build）。
- 错误 message 使用英文。
- 发布检查清单必须以 Markdown 落盘。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T20)

# Execution Plan

1) 定义 CI pipeline
- Scope:
  - lint
  - typecheck
  - test
  - build
- Files（建议）:
  - .github/workflows/ci.yml（或等价 CI 配置）
- Requirements:
  - PR 与 main 分支都执行；失败阻断合入

2) 引入缓存与加速（可选）
- Scope:
  - node_modules / pnpm store 缓存
- Files（建议）:
  - .github/workflows/ci.yml（或等价 CI 配置）
  - package-lock.json
- Requirements:
  - 缓存 key 需要包含 lockfile hash

3) 发布检查清单落盘
- Scope:
  - 环境变量检查（含 RAGFlow 配置、provider key）
  - 日志/告警开关
  - 回滚/降级策略
- Files（建议）:
  - docs/release-checklist.md
- Requirements:
  - 清单必须可逐项勾选，且包含“验证命令”

4) 添加最小自动化校验（文档与 workflow）
- Scope:
  - 断言 CI workflow 配置存在，且包含 lint/typecheck/test/build 的执行步骤
  - 断言发布检查清单文档存在，且包含环境变量/日志告警/回滚/验证命令等关键条目
- Files（建议）:
  - tests/ci/ci-workflow.contract.test.ts
  - tests/docs/release-checklist.contract.test.ts
- Requirements:
  - 校验必须可在本地/CI 重复运行（无需截图）

5) 测试/验收
- Scope:
  - 在 CI 中实际跑通一次
- Files（建议）:
  - .github/workflows/ci.yml（或等价 CI 配置）
- Requirements:
  - 失败时能从日志中定位到失败步骤

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 校验测试：CI workflow 配置存在，且包含 lint/typecheck/test/build 的执行步骤（静态检查即可）
  - 校验测试：`docs/release-checklist.md` 存在，且包含环境变量/日志告警/回滚/验证命令等关键条目
  - CI：workflow 在 PR 上触发并执行 lint/typecheck/test/build，失败则阻断

# Checklist
- [ ] 代码编译通过（npm run build）
- [ ] 类型检查通过（npm run typecheck）
- [ ] Lint 检查通过（npm run lint）
- [ ] CI 配置文件落盘（workflow）
- [ ] CI 覆盖 lint/typecheck/test/build
- [ ] CI 失败阻断合入
- [ ] 缓存策略配置（可选）
- [ ] 发布检查清单落盘（docs/release-checklist.md）
- [ ] 在 CI 中至少跑通一次

# Output
- 输出（强制包含以下内容）：
  - CI 配置文件路径 + 关键步骤说明：
    ```yaml
    # .github/workflows/ci.yml
    name: CI
    on: [push, pull_request]
    jobs:
      test:
        steps:
          - name: Lint
            run: npm run lint
          - name: Type Check
            run: npm run typecheck
          - name: Test
            run: npm run test
          - name: Build
            run: npm run build
    ```
  - 发布检查清单文件路径：`docs/release-checklist.md`
    ```markdown
    # 发布检查清单
    
    ## 环境变量
    - [ ] API_PORT 已配置
    - [ ] RAGFLOW_API_URL 已配置
    - [ ] RAGFLOW_API_KEY 已配置
    - [ ] PROVIDER_API_KEY 已配置
    
    ## 日志/告警
    - [ ] 日志级别已设置（INFO/DEBUG）
    - [ ] 告警规则已配置（错误率/延迟）
    
    ## 回滚策略
    - [ ] 备份数据库（如适用）
    - [ ] 记录当前版本号
    - [ ] 准备回滚命令
    ```
  - 一次 CI 运行的关键日志片段（或截图）

# 依赖关系与风险评估

## 前置依赖
- T17：契约测试
- T18：E2E

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| CI Provider | 执行流水线 | 低 | 中（环境差异） |

## 高风险点
1. **CI 环境与本地不一致**
   - 缓解措施：锁定 Node 版本；在 README/CI 中统一

## 回滚策略
- 若 CI 阻塞迭代：先保留 lint+typecheck+unit tests 作为必选门禁，E2E 调整为 nightly。
```

---

### Task T21 - 运行手册与故障排查指引

```markdown
# Context
你是 Niche/Study Copilot 的 负责落地与验收的工程师。
你正在执行 Phase 4：发布与运维。
你的目标是完成任务 T21：运行手册与故障排查指引。

# 全局约束与标准
- TypeScript Strict；禁止 any。
- runbook 必须以 Markdown 落盘。
- 错误 message 使用英文。
- 排查必须以 requestId 为主线贯穿。

# References
- requirements: specs/study-copilot/requirements.md (R11)
- tasks: specs/study-copilot/tasks.md (T21)

# Execution Plan

1) 本地启动步骤
- Scope:
  - 安装依赖
  - 启动 API/Web
  - 环境变量配置
- Files（建议）:
  - docs/runbook.md
- Requirements:
  - 命令必须可复制粘贴

2) 常见故障与处理
- Scope:
  - provider 超时
  - RAGFlow 不可用
  - citations 降级/unavailable
- Files（建议）:
  - docs/runbook.md
- Requirements:
  - 每条故障包含：症状/原因/排查步骤/回滚或降级

3) requestId 排查路径
- Scope:
  - 前端拿到 requestId 的位置
  - 后端日志中如何 grep requestId
  - stream/events/evidence 的关联
- Files（建议）:
  - docs/runbook.md
- Requirements:
  - 至少给出 1 条从 UI -> API -> logs 的完整示例

4) 添加最小自动化校验（runbook 结构）
- Scope:
  - 断言 runbook 文件存在
  - 断言 runbook 必备章节/关键词存在（本地启动/常见故障/requestId；provider/ragflow/citations）
- Files（建议）:
  - tests/docs/runbook.contract.test.ts
- Requirements:
  - 校验必须可在本地/CI 重复运行

5) 验收
- Scope:
  - 文档自检：覆盖面与可执行性
- Files（建议）:
  - docs/runbook.md
- Requirements:
  - 新同学可按文档完成本地启动与问题定位

# Verification
- 自动化断言（至少覆盖以下断言）：
  - 校验测试：`docs/runbook.md` 文件存在
  - 校验测试：runbook 包含必备章节（本地启动/常见故障/按 requestId 排查）
  - 校验测试：runbook 覆盖至少 3 类常见故障（provider 超时、RAGFlow 不可用、citations 降级/unavailable）

# Checklist
- [ ] 代码编译通过（npm run build）
- [ ] 类型检查通过（npm run typecheck）
- [ ] Lint 检查通过（npm run lint）
- [ ] runbook 文档落盘（docs/runbook.md）
- [ ] 本地启动步骤清晰（install/dev/build/test）
- [ ] 常见故障覆盖（provider/ragflow/citations）
- [ ] requestId 排查路径覆盖（UI -> API -> logs）
- [ ] 文档可被新同学复用（可验收）

# Output
- 输出（强制包含以下内容）：
  - runbook 文件路径：`docs/runbook.md`
  - runbook 目录（章节列表）：
    ```markdown
    # Study Copilot 运行手册
    
    ## 1. 本地启动
    - 1.1 安装依赖
    - 1.2 配置环境变量
    - 1.3 启动 API 服务
    - 1.4 启动 Web 服务
    
    ## 2. 常见故障
    - 2.1 Provider 超时
    - 2.2 RAGFlow 不可用
    - 2.3 Citations 降级/unavailable
    
    ## 3. 排查指引
    - 3.1 按 requestId 排查
    - 3.2 日志查询命令
    - 3.3 前后端关联
    ```
  - 1 条示例排查路径（带 requestId）：
    ```
    场景：用户报告"引用点击后无响应"
    
    1. 前端：DevTools Network -> 找到 /api/evidence 请求
       - 状态码：500
       - x-request-id: req_abc123
    
    2. 后端：grep "req_abc123" logs/api.log
       - 找到：ERROR citationId not found in repository
    
    3. 根因：citationId 未正确存储到 repository
    
    4. 解决：检查 T10 RAGFlow Adapter 的 citationId 生成逻辑
    ```

# 依赖关系与风险评估

## 前置依赖
- T20：CI/CD 与发布检查清单

## 新增依赖
| 依赖名 | 用途 | 成本评估 | 风险 |
|--------|------|---------|------|
| 无新增 | 文档落盘 | 低 | 低 |

## 高风险点
1. **文档漂移**：代码变更后 runbook 未更新
   - 缓解措施：在 CI 中加入文档检查项（可选），或发布检查清单强制 review

## 回滚策略
- 若 runbook 不完善：先补齐“启动 + requestId 排查”两章作为最小可用，再逐步扩展。
```
