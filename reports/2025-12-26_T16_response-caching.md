# T16 验收日志：响应缓存与缓存标记

- 日期：2025-12-26
- 任务：T16 - 缓存：响应缓存与缓存标记

## 目标
- 实现 deterministic cache key。
- 实现内存缓存：LRU + TTL。
- 命中缓存时显式标记（stream parts）。
- 命中缓存时不触发模型/Provider 调用。
- 集成测试覆盖：命中/标记/TTL。

## 实现概览

### 1) Cache Key 规则与示例

**规则（实现语义）**
- `cacheKey = cache:v1:sha256( stableJson({ tenantId, projectId, templateRef, inputHash, retrievalHash, modelInfo }) )`
- `inputHash = sha256( stableJson(messages[{role,content}]) )`
- `retrievalHash`：
  - 若已有 `citations`：`sha256(stableJson(sorted(citationIds)))`
  - 否则若有 `retrieval`：`sha256(stableJson({providerId, query}))`

**modelInfo 完整性策略（避免错误命中）**
- 缓存 key 必须包含 `modelInfo.modelId`。
- 当 `/api/stream` 启用响应缓存但缺少 `streamModelId` 时：
  - **禁用响应缓存**（不读写缓存、不输出 `data-cache-metadata`）
  - 记录 warning 日志：`response_cache_disabled_missing_model_id`

**示例（格式）**
- `cache:v1:sha256:a1b2c3d4e5f6...`（64 hex）

### 2) 内存缓存：LRU + TTL
- 实现 `createLruTtlCache`：
  - `maxEntries` 限制最大条目数
  - `ttlMs` 过期时间
  - `get()` 会更新 LRU（touch）并在过期时删除

### 3) 命中标记（stream part）
- 使用 stream part：`type: data-cache-metadata`。
- 命中示例：

```json
{
  "type": "data-cache-metadata",
  "data": {
    "cached": true,
    "cacheKey": "cache:v1:sha256:a1b2c3d4e5f6...",
    "cachedAt": "2025-12-26T08:00:00.000Z"
  }
}
```

- 未命中示例：

```json
{
  "type": "data-cache-metadata",
  "data": {
    "cached": false,
    "cacheKey": "cache:v1:sha256:a1b2c3d4e5f6..."
  }
}
```

### 4) 核心链路接入（命中不触发 Provider）
- 接入点：`apps/api/src/main.ts` 的 `POST /api/stream`。
- 逻辑要点：
  - 先基于 `templateRef + messages + retrieval(query/providerId) + modelInfo` 计算 `cacheKey`
  - 查内存缓存：
    - 命中：直接回放 `text`/`citations`，不调用 `streamProvider`
    - 未命中：调用 `streamProvider` 产生文本；结束后再调用检索拿 citations；最后写回缓存

## 变更文件

### Core
- `packages/core/src/cache/cache-key.ts`
- `packages/core/src/cache/memory-cache.ts`
- `packages/core/src/cache/instrumentation.ts`
- `packages/core/src/cache/index.ts`
- `packages/core/src/index.ts`
- `packages/core/src/cache/cache-key.test.ts`
- `packages/core/src/cache/memory-cache.test.ts`

### API
- `apps/api/src/main.ts`
- `apps/api/src/stream.test.ts`

### Web
- `apps/web/src/App.tsx`

## 测试文件清单与断言点

### 1) `tests/integration/cache.test.ts`
- **断言点：缓存命中不触发 provider**
  - 两次相同请求，`calls` 仍为 1
- **断言点：命中时返回 data-cache-metadata 且 cached=true**
  - 解析 stream data items，查找 `data-cache-metadata`
- **断言点：TTL 过期后重新触发 provider**
  - 使用可控 `now()` + 小 TTL，推进时间后第三次请求 `calls` 变为 2
- **断言点：缺少 streamModelId 时禁用缓存**
  - 两次相同请求，`calls` 为 2
  - 不输出 `data-cache-metadata`

### 2) `packages/core/src/cache/cache-key.test.ts`
- **断言点：deterministic**
- **断言点：输入变更导致 key 变化**
- **断言点：citations 顺序不影响 key**

### 3) `packages/core/src/cache/memory-cache.test.ts`
- **断言点：LRU 淘汰**
- **断言点：TTL 过期**

## 验证命令与结果
- `npm run test`：通过
- `npm run typecheck`：通过
- `npm run lint`：通过
- `npm run build`：通过

## 备注 / 已知限制
- 当前缓存后端为进程内内存缓存（适用于本地与单实例）。
- `retrievalHash` 在缓存命中前采用 `retrieval(query/providerId)` 作为摘要；在缓存写回时同时存储 citations（用于回放展示）。
  - 这意味着缓存以“检索输入”为准，而不是以“检索输出”为准；在 TTL 有效期内可能回放旧 citations。
- 当前仅支持 TTL 过期与 LRU 淘汰，**缺少主动失效机制**（模板/数据更新无法按 tag/pattern 批量清除）。
  - 建议后续任务补充 invalidation API。
- 优化建议（后续）：
  - SHA-256 可考虑使用 Node.js `crypto.createHash('sha256')` / Web Crypto API `crypto.subtle.digest`（保留 fallback）
  - 指标可补充 hit rate（hits/(hits+misses)）、缓存大小、淘汰次数等
