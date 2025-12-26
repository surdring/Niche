# T12 UI Core Loop — Acceptance Log

- Date: 2025-12-24
- Task: T12 UI：模板选择/运行/steps/citations 的最小可用实现

## Scope
- apps/web UI core loop:
  - Template selection
  - Run / cancel / retry
  - Stream output incremental rendering
  - Step timeline rendering
  - Citations list + evidence panel
- E2E-ish tests (Vitest + JSDOM) to cover the minimal closed loop.

## Verification (Automated)
All commands were executed at repo root (`d:/develop/Niche`) and completed with exit code 0.

### Build
- Command: `npm run build`
- Result: PASS

### Typecheck
- Command: `npm run typecheck`
- Result: PASS

### Lint
- Command: `npm run lint`
- Result: PASS

### Test
- Command: `npm run test`
- Result: PASS
- Notes:
  - React emitted `act(...)` warnings during `@niche/web` tests, but tests passed and CI exit code was 0.

## Key Artifacts
- `apps/web/src/App.tsx`
- `apps/web/src/app.e2e-ish.test.tsx`
- `apps/web/vite.config.ts`
- `apps/web/tsconfig.json`
- `specs/study-copilot/tasks.md`
- `specs/study-copilot/tasks-prompts.md`
- `specs/study-copilot/tasks-prompts-v2-T10-T21.md`

## Result
- Status: ACCEPTED
- Evidence:
  - `npm run build/typecheck/lint/test` all passed.
