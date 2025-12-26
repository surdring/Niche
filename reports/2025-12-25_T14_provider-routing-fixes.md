# T14 Provider Routing - Fixes Acceptance Log

Date: 2025-12-25
Task: T14 - Provider 与多模型路由（问题清单修复）
Workspace: packages/core

## What Was Fixed

### 1) Real Provider Implementation (OpenAI-compatible)

- Added a real Provider Adapter that calls an OpenAI-compatible `/v1/chat/completions` endpoint.
- It can be used with OpenAI or with a self-hosted llama.cpp `llama-server` (OpenAI-compatible mode) by configuring `baseUrl`.

Files:
- `packages/core/src/providers/openai-provider.ts`
- `packages/core/src/providers/openai-provider.test.ts`
- `packages/core/src/providers/index.ts` (export added)

### 2) Deterministic Routing Test Coverage

- Added tests for deterministic decisions across:
  - heuristic routing with different prompt lengths
  - hint-based routing

File:
- `packages/core/src/providers/provider-routing.test.ts`

### 3) Streaming Fallback Coverage

- Implemented behavior: if `streamText` fails **before emitting the first token**, it falls back to `generateTextWithFallbackDetails` (including provider/model fallback).
- Added tests covering:
  - primary stream fails before first token -> fallback to generateText -> provider fallback
  - streamText not supported -> downgrade to generateText fallback

Files:
- `packages/core/src/providers/routed-language-model.ts`
- `packages/core/src/providers/mock-provider.ts`
- `packages/core/src/providers/provider-routing.test.ts`

### 4) Token Usage Metrics Verification

- Added tests asserting `metrics.record` includes `usage` for:
  - `generate_text`
  - `stream_text` downgraded path

File:
- `packages/core/src/providers/provider-routing.test.ts`

### 5) Router Validation Messages + Observability

- Improved Zod validation messages for routing config fields.
- `RouteDecision` now includes `metadata` (e.g. prompt length stats, hint info).
- `Provider route decided` log now includes `metadata`.

Files:
- `packages/core/src/providers/router.ts`
- `packages/core/src/providers/routed-language-model.ts`

### 6) More Flexible Fallback Policy (minimal)

- Added `fallbackPolicy`:
  - `skipProviderIds`
  - `maxAttempts`

File:
- `packages/core/src/providers/router.ts`

### 7) Config Examples Documentation

- Added provider/routing configuration examples.

File:
- `packages/core/src/providers/README.md`

### 8) llama.cpp (local server) optional integration test

- Added an **env-gated** test that can call a llama.cpp OpenAI-compatible server.
- Defaults:
  - `baseUrl`: `http://172.16.100.211:8080/v1`
  - `apiKey`: `sk-local-gpt20b`
  - `modelId`: `gpt-oss-20b`

Enable by setting:
- `RUN_LLAMA_INTEGRATION_TESTS=1`

File:
- `packages/core/src/providers/openai-provider.test.ts`

## Verification

Executed in `d:\develop\Niche`:

- `npm run test -w @niche/core`
  - PASS (13 test files, 46 passed, 1 skipped)
- `npm run typecheck -w @niche/core`
  - PASS
- `npm run lint -w @niche/core`
  - PASS
- `npm run build -w @niche/core`
  - PASS

## Notes

- The llama.cpp integration test is skipped by default to keep CI stable.
- API keys should not be hardcoded outside of tests.
