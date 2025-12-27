# T20 - CI/CD 与发布检查清单 - 验收日志

## Scope
- CI quality gates: lint / typecheck / test / build
- Release checklist document (Markdown, checkable)
- Minimal contract tests for workflow + document

## Artifacts
- `.github/workflows/ci.yml`
- `docs/release-checklist.md`
- `tests/ci/ci-workflow.contract.test.ts`
- `tests/docs/release-checklist.contract.test.ts`

## CI Workflow (key steps)
```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
jobs:
  quality-gates:
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

## Release Checklist
Path: `docs/release-checklist.md`

Key sections:
- Environment variables
- Logging/alerting
- Rollback/degrade strategy
- Verification commands

## Automated Contract Tests
- `tests/ci/ci-workflow.contract.test.ts`
  - Asserts workflow exists and includes PR/push triggers and lint/typecheck/test/build commands
- `tests/docs/release-checklist.contract.test.ts`
  - Asserts checklist exists and includes env/logging/rollback/verification sections and key items

## Local Verification
Commands executed:
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Key log snippets:
```text
Test Files  1 passed (1)
Tests       1 passed (1)
- tests/ci/ci-workflow.contract.test.ts

Test Files  1 passed (1)
Tests       1 passed (1)
- tests/docs/release-checklist.contract.test.ts

> niche@0.0.0 build
> turbo run build
Tasks:    3 successful, 3 total
```

## CI Run Evidence (pending)
- GitHub Actions run log is required to fully satisfy: "在 CI 中至少跑通一次".
- Action item: open GitHub Actions -> CI workflow -> paste the run URL and key log lines into this report.
