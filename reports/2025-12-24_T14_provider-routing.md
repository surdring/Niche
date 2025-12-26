# T14 Provider Routing - Acceptance Log

Date: 2025-12-24
Task: T14 - Provider 与多模型路由（最小可用策略）
Workspace: packages/core

## Summary

This task introduces a Provider Adapter abstraction and a minimal deterministic routing strategy with fallback, plus structured logging and metrics hooks. It allows switching provider/model via config without changing business orchestration.

## Key Changes

- `packages/core/src/logger/logger.ts`
  - Added `Logger` interface + noop implementation.
- `packages/core/src/logger/index.ts`
  - Export logger module.
- `packages/core/src/providers/provider.ts`
  - Added Provider Adapter interface and serializable input/output types.
- `packages/core/src/providers/router.ts`
  - Added Zod routing config schema and deterministic route decision.
- `packages/core/src/providers/metrics.ts`
  - Added metrics sink interface and noop sink.
- `packages/core/src/providers/mock-provider.ts`
  - Added deterministic mock provider adapter for integration tests.
- `packages/core/src/providers/routed-language-model.ts`
  - Implemented routed `LanguageModel` wrapper with deterministic routing, fallback, logging, and metrics recording.
- `packages/core/src/providers/provider-routing.test.ts`
  - Added integration tests: switching, fallback, and routing decision logs.
- `packages/core/src/index.ts`
  - Exported `logger` and `providers` modules from `@niche/core`.

## Verification

All commands executed in `d:\develop\Niche`:

- `npm run test -w @niche/core`
  - Result: PASS (12 test files, 38 tests)
- `npm run typecheck -w @niche/core`
  - Result: PASS
- `npm run lint -w @niche/core`
  - Result: PASS
- `npm run build -w @niche/core`
  - Result: PASS

## Notes

- Error messages emitted from the new routing layer are in English.
- Routing behavior is deterministic given the same config + input.
