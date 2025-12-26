# RAGFlow Adapter

本目录实现 Study Copilot 在 **RAGFlow** 上的检索适配层（retrieval adapter）。目标是把 RAGFlow 的检索结果映射为项目统一的 `Citation` / `Evidence` / `RetrievedChunk` 契约，并提供可验证（verifiable）的引用链路。

## 职责

- 将上游检索输入（query/filters/topK/scoreThreshold）转换为 **RAGFlow 搜索请求**，并在构造阶段强制注入 `projectId` 以实现隔离
- 调用 RAGFlow HTTP API（`/search`）并做超时/取消处理
- 将 RAGFlow `chunk` 映射为：
  - `RagflowRetrievedChunk`（用于检索结果展示）
  - `Citation`（用于引用/证据验证）
- 生成稳定的 `citationId`，并可选写入 `RagflowEvidenceStore` 供后续 `EvidenceProvider` 回源验证

## 文件结构

- `types.ts`
  - 输入/输出与 RAGFlow 响应的 Zod schema
- `request.ts`
  - `buildRagflowSearchRequest`：负责 **projectId 注入/一致性校验** 与 request schema 校验
- `client.ts`
  - `createRagflowClient`：RAGFlow HTTP client（自动注入 `x-request-id/x-tenant-id/x-project-id`，支持 timeout + AbortSignal）
- `mapper.ts`
  - `mapRagflowChunkToRetrievedChunk` / `mapRagflowChunkToCitation`
  - `ragflowCitationIdFromChunkId`：稳定引用 ID（`ragflow:{tenantId}:{projectId}:{chunkId}`）
- `evidence-store.ts`
  - `createInMemoryRagflowEvidenceStore`：内存证据存储（按 tenant/project 隔离读取）
- `evidence-provider.ts`
  - `createRagflowEvidenceProvider`：将 `RagflowEvidenceStore` 暴露为通用 `EvidenceProvider`
- `retrieve.ts`
  - `retrieveWithRagflow`：编排入口（输入校验 -> request build -> client search -> 映射 -> 可选 evidence store）

## 主要接口

### `buildRagflowSearchRequest(ctx, input)`

- 强制要求 `projectId`
  - 优先使用 `input.filters.projectId`
  - 否则使用 `ctx.projectId`
- 若 `ctx.projectId` 与 `input.filters.projectId` 同时存在且不一致，则返回 `AUTH_ERROR`

### `createRagflowClient({ baseUrl, fetchImpl?, timeoutMs? })`

- `baseUrl` 会自动去掉末尾 `/`
- 请求自动注入 headers：
  - `x-request-id`
  - `x-tenant-id`
  - `x-project-id`（当 ctx.projectId 存在时）
- 支持：
  - 内部 timeout（`timeoutMs`）
  - 外部取消（`AbortSignal`）

### `mapRagflowChunkToCitation(ctx, projectId, chunk)`

- 当 RAGFlow 提供 `page_number` 或 `offset_start` 时，返回 `status=verifiable`
- 当定位字段缺失时，返回 `status=degraded` 并填充 `degradedReason`

### `retrieveWithRagflow(ctx, input, { client }, options?)`

- `input` 会用 `RagflowRetrieveInputSchema` 校验（`unknown -> typed`）
- `options.evidenceStore` 存在时，会把所有产出的 citations 写入 store，保证后续可验证

## 使用示例

```ts
import type { RequestContext } from "../../contracts/context";
import { createRagflowClient, createInMemoryRagflowEvidenceStore, retrieveWithRagflow } from "./index";

const client = createRagflowClient({ baseUrl: "https://ragflow.example.com", timeoutMs: 8000 });
const evidenceStore = createInMemoryRagflowEvidenceStore();

const ctx: RequestContext = {
  requestId: "req_1",
  tenantId: "tenant_1",
  projectId: "proj_1",
  // 可选：注入 log，用于结构化日志（只要具有 info/warn/error 即可）
  // log: request.log
} as RequestContext;

const out = await retrieveWithRagflow(ctx, { query: "What is RAG?" }, { client }, { evidenceStore });
if (!out.ok) {
  throw new Error(out.error.message);
}

console.log(out.value.citations);
```

## 重要约束（避免伪造引用）

- `citationId` 必须可回源验证：
  - `retrieveWithRagflow` 生成的 citations 可写入 `RagflowEvidenceStore`
  - `createRagflowEvidenceProvider(store)` 用于后续 evidence lookup
- 禁止“凭空生成 Citation”：任何给到下游的 citationId 都应能通过 EvidenceProvider 找到证据或明确降级
