# 2025-12-23 T10 - RAGFlow Adapter 验收日志

## 验收结论

- 结论：通过
- 覆盖范围：RAGFlow Adapter（检索 + Citation 映射 + 降级策略 + 稳定 citationId）+ 端到端在 `/api/stream` 输出 citations（可 mock upstream）+ `/api/evidence` 可回源验证

## 关键变更

### 1) RAGFlow Adapter（core）

- 位置：`packages/core/src/adapters/ragflow/*`
- 能力：
  - 输入：`query`（以及可扩展 filters），强制从 `RequestContext.projectId` 注入 projectId filter
  - 输出：`chunks` + `citations`
  - 稳定 `citationId`：`ragflow:{tenantId}:{projectId}:{chunkId}`
  - 降级策略：定位信息不足时返回 `status=degraded` 且 `degradedReason` 非空
  - Evidence：通过 in-memory evidence store 回源（禁止伪造引用/证据）

### 2) Stream 协议扩展（core）

- 文件：`packages/core/src/contracts/stream.ts`
- 新增 stream part：`data-citations`
  - 结构：`{ type: "data-citations", data: Citation[] }`
  - 通过 Vercel AI Data Stream 的 `2:` 数据行承载，保持向后兼容

### 3) API 端到端接入

- `/api/stream`（`apps/api/src/main.ts`）
  - 在 step 完成前调用 `retrieveWithRagflow`，并通过 `data-citations` part 写入流
- `/api/evidence`（`apps/api/src/main.ts`）
  - 优先从 `ragflowEvidenceStore` 回源；找不到时回退到既有 mock response
- `/api/retrieve`（`apps/api/src/main.ts`）
  - 提供非流式检索出口，便于调试与集成测试；同时写入 `ragflowEvidenceStore`

## 字段映射（RAGFlow -> Citation）

- `chunk_id` -> `citationId`（编码为 `ragflow:{tenantId}:{projectId}:{chunk_id}`）
- `document_id` -> `documentId`
- `page_number` -> `locator.page`
- `offset_start` -> `locator.offsetStart`
- `offset_end` -> `locator.offsetEnd`
- `content` -> `snippet`
- 缺失定位字段 -> `status=degraded` + `degradedReason`

## 测试清单

### Core 单元测试

- `packages/core/src/adapters/ragflow/request.test.ts`
- `packages/core/src/adapters/ragflow/mapper.test.ts`
- `packages/core/src/adapters/ragflow/retrieve.test.ts`

### API 集成测试

- `apps/api/src/retrieve.test.ts`
  - 断言 `/api/retrieve` 返回 citations 且可 parse
  - 断言 `/api/evidence?citationId=...` 可回源返回 evidence
- `apps/api/src/stream.test.ts`
  - 断言 `/api/stream` data line 中包含 `data-citations`
  - 断言 citations 可被 `CitationSchema` parse

## 自动化验收命令

- `npm run test`：通过
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过
