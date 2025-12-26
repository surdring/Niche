# T11 Evidence API 验收日志

- **Task**: T11 - Evidence API：citationId -> 证据展示数据
- **Date**: 2025-12-23
- **Scope**: Phase 1（核心闭环）

## 变更概览

- **Evidence 契约（Zod）**
  - `packages/core/src/contracts/citation.ts`
    - `EvidenceSchema` 复用 `CitationSchema`（同一模型）
    - 调整 `degradedReason` 约束：
      - `status=degraded`：必须提供 `degradedReason`
      - `status=unavailable`：允许提供 `degradedReason`
      - `status=verifiable`：禁止提供 `degradedReason`

- **citationId 查询抽象（可替换为 DB）**
  - `packages/core/src/repos/citation-repo.ts`
    - `CitationRepo.getByCitationId(ctx, citationId)`
    - 提供 `createRagflowCitationRepo(store)`：通过解析 `ragflow:{tenantId}:{projectId}:{chunkId}` 做回源

- **Evidence service（不可回源降级，不伪造）**
  - `packages/core/src/services/evidence-service.ts`
    - `getEvidenceByCitationId(ctx, citationId, { repo })`
    - repo miss 返回 `status=unavailable`，且不返回 `snippet`

- **Evidence API 路由**
  - `apps/api/src/main.ts`
    - `GET /api/evidence?citationId=...`
    - query 通过 Zod 校验
    - response 通过 `EvidenceSchema.parse`
    - 跨 projectId 默认拒绝：返回 `AUTH_ERROR`（401）且 message 含 `requestId`

## Endpoint（脱敏示例）

- **文件路径**: `apps/api/src/main.ts`

### 请求/响应示例（成功）

```text
GET /api/evidence?citationId=ragflow:tenant_test:proj_test:chunk_proj_test_1
Headers:
  x-request-id: req_demo_ok
  x-tenant-id: tenant_test
  x-project-id: proj_test

Response 200:
{
  "citationId": "ragflow:tenant_test:proj_test:chunk_proj_test_1",
  "sourceType": "ragflow_chunk",
  "projectId": "proj_test",
  "locator": { "page": 1, "offsetStart": 0, "offsetEnd": 10 },
  "snippet": "mock snippet",
  "status": "verifiable"
}
```

### 请求/响应示例（status=unavailable，无伪造 snippet）

```json
{
  "citationId": "c_missing",
  "sourceType": "document",
  "projectId": "proj_test",
  "locator": {},
  "status": "unavailable",
  "degradedReason": "Citation record not found in repository"
}
```

## 测试

- **新增测试文件**
  - `apps/api/src/evidence.test.ts`

- **断言点**
  - **成功**: `apps/api/src/retrieve.test.ts`
    - `/api/retrieve` 返回的 `citationId` 可用于 `/api/evidence`，响应可被 `EvidenceSchema` parse
  - **跨项目拒绝**: `apps/api/src/evidence.test.ts`
    - 使用 `proj_a` retrieve 得到 citationId，用 `proj_b` 请求 evidence，返回 `401` 且 `AppError.code=AUTH_ERROR`，并包含 `requestId`
  - **不可回源降级**: `apps/api/src/evidence.test.ts`
    - `citationId=c_missing` 返回 `200` 且 `status=unavailable`，并断言 `snippet` 不存在

## Verification（命令与结果）

在仓库根目录执行：

- `npm run build` ✅
- `npm run typecheck` ✅
- `npm run lint` ✅
- `npm run test` ✅

## 约束符合性检查

- **TypeScript strict / 禁止 any**: ✅（通过 typecheck）
- **输入/输出 Zod 校验**: ✅
  - query: `EvidenceQuerySchema`
  - response: `EvidenceSchema.parse(...)`
- **错误 message 英文且含 requestId**: ✅（`AUTH_ERROR/VALIDATION_ERROR/...` 均追加 `(requestId=...)`）
- **禁止伪造证据**: ✅（repo miss 返回 `status=unavailable` 且不返回 `snippet`）
- **默认强制隔离（跨 projectId 默认拒绝）**: ✅（`AUTH_ERROR`）
