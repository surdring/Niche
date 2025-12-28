# T20 - CI/CD 与发布检查清单 - 验收日志

## 背景与目标
本任务用于满足 `specs/study-copilot/requirements.md` 的 R11（可观测性与监控）在“发布与运维”阶段的最小门禁要求，并对齐 `specs/study-copilot/tasks-prompts-v2-T10-T21.md` 的 Task T20。

目标拆解：
- CI：在 PR 与 main 分支 push 时自动执行 `lint/typecheck/test/build`，失败即阻断。
- 文档：落盘可勾选的发布检查清单，覆盖环境变量、日志/告警、回滚/降级与验证命令。
- 自动化断言：用最小契约测试静态校验 workflow 与清单关键条目，确保后续改动不“悄悄漂移”。
- 验收：本地与 CI 都至少成功跑通一次，并在本日志中保留证据。

## 关键决策记录
- **CI Provider**：GitHub Actions（仓库原生支持，最低运维成本）。
- **Node 版本**：`20`（在 workflow 中锁定 `node-version: 20`）。
- **安装方式**：`npm ci`（与仓库根目录存在 `package-lock.json` 一致）。
- **缓存策略**：使用 `actions/setup-node@v4` 的 `cache: npm`，并将 cache key 绑定 `package-lock.json`。
- **测试框架**：复用现有 Vitest（仓库已有 `vitest` 与 `turbo run test`）。
- **契约测试范围**：只做“静态存在性与关键字段包含”的最小断言，避免对 CI provider 行为做不稳定的端到端依赖。

## 实施过程（按产物分解）
### 1) 新增 CI Workflow
- 目标文件：`.github/workflows/ci.yml`
- 触发：`pull_request` + `push`（仅 main）
- Job：`quality-gates`
- Steps：Checkout -> Setup Node（含 npm cache）-> Install（npm ci）-> Lint -> Type Check -> Test -> Build

### 2) 新增发布检查清单
- 目标文件：`docs/release-checklist.md`
- 清单内容：
  - 环境变量（含 `RAGFLOW_API_URL` / `RAGFLOW_API_KEY` / `PROVIDER_API_KEY`）
  - 日志/告警（强调 requestId 可追踪）
  - 回滚/降级策略
  - 验证命令（`npm ci` / `npm run lint` / `npm run typecheck` / `npm run test` / `npm run build`）

### 3) 新增最小契约测试（防漂移）
- `tests/ci/ci-workflow.contract.test.ts`
  - 断言 `.github/workflows/ci.yml` 存在
  - 断言包含 `pull_request` / `push` 与 `npm run lint/typecheck/test/build`
- `tests/docs/release-checklist.contract.test.ts`
  - 断言 `docs/release-checklist.md` 存在
  - 断言包含关键章节与关键条目（环境变量/日志告警/回滚/验证命令 + 关键 env keys）

### 4) 将契约测试接入默认测试命令
- 目标文件：根 `package.json`
- 调整：将 `tests/ci` 与 `tests/docs` 加入 `npm run test` 的链路中，确保本地与 CI 都会执行。

## 验收方式（自动化）
- 本地：顺序执行
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`
- CI：GitHub Actions 成功执行 workflow，并在日志中能定位到每个步骤。

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

## CI Run Evidence
- Run URL: https://github.com/surdring/Niche/actions/runs/20536599902
- Job URL: https://github.com/surdring/Niche/actions/runs/20536599902/job/58995611307

Key logs:
```text
Run npm run lint
> niche@0.0.0 lint
> turbo run lint

Run npm run typecheck
> niche@0.0.0 typecheck
> turbo run typecheck

Run npm run test
> niche@0.0.0 test
> turbo run test && vitest run tests/ci && vitest run tests/docs && vitest run tests/integration && vitest run tests/e2e && vitest run tests/security

Run npm run build
> niche@0.0.0 build
> turbo run build
Tasks:    3 successful, 3 total
```