# T13 Code Review Report: Export Markdown

- Task: T13
- Date: 2025-12-24
- Scope:
  - Core markdown exporter: `packages/core/src/export/markdown.ts`
  - Core tests: `packages/core/src/export/markdown.test.ts`
  - Web export flow: `apps/web/src/lib/export.ts`, `apps/web/src/components/ExportPanel.tsx`, `apps/web/src/app.e2e-ish.test.tsx`
  - Acceptance log: `reports/2025-12-24_T13_export-markdown.md`

## Review Findings Summary

### 🟡 General Issues

#### 1) E2E test file missing (`tests/e2e/export.test.ts` not found)
- Finding:
  - The review expected a `tests/e2e/export.test.ts` file but it does not exist.
- Root cause:
  - This repo currently has no dedicated E2E runner setup (no Playwright/Cypress integration) and no root `tests/e2e` directory.
- Resolution:
  - We clarified and documented that the export flow is covered by a **Vitest e2e-ish** test in:
    - `apps/web/src/app.e2e-ish.test.tsx` (`export: preview and copy include output and citation metadata`)
  - We updated the acceptance log to explicitly explain this choice and the migration path if Playwright/Cypress is introduced later:
    - `reports/2025-12-24_T13_export-markdown.md` (section “关于 E2E 测试文件”) 

#### 2) Export format spec lacks explicit verification (only snapshot)
- Finding:
  - The core test had a snapshot, but explicit assertions for key format invariants were limited.
- Risk:
  - Some regressions might be less obvious if the snapshot is updated casually.
- Resolution:
  - Strengthened `packages/core/src/export/markdown.test.ts` with explicit assertions covering:
    - Title and body presence
    - `## 引用` section and list line format
    - Separator `---`
    - Metadata comment presence
    - YAML fenced block presence
    - `meta.exportVersion` presence

### 🟢 Optimization Suggestions (Deferred)

#### 1) Markdown rendering preview (split view)
- Status: Deferred
- Rationale:
  - Current requirement is export content preview + copy/download. A renderer introduces additional dependencies/UI complexity.

#### 2) More granular error handling in ExportPanel
- Status: Deferred
- Rationale:
  - Current UI provides basic feedback; detailed error typing (permissions / unsupported browser) can be added in a later UX task.

#### 3) Extend YAML metadata (timestamp/user)
- Status: Deferred
- Rationale:
  - Current contract focuses on traceability fields (`citationId`, `locator`, `projectId`, `taskId/sessionId/requestId/templateRef`). Additional fields can be added in a backwards-compatible manner later.

## Verification After Fixes

- `npm run test -w @niche/core` ✅
- `npm run lint -w @niche/core` ✅
- `npm run test` ✅

## Notes

- Snapshot strings are kept deterministic and lint-clean; avoid introducing unnecessary escaping that triggers `no-useless-escape`.
