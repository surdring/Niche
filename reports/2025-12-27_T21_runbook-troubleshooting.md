# T21 验收日志：运行手册与故障排查指引

- Task: T21 - 运行手册与故障排查指引
- Date: 2025-12-27

## 变更摘要

- 文档落盘：`docs/runbook.md`
- 文档契约测试：`tests/docs/runbook.contract.test.ts`
- 任务状态更新：
  - `specs/study-copilot/tasks.md`：T21 标记为 ✅
  - `specs/study-copilot/tasks-prompts-v2-T10-T21.md`：T21 Checklist 全部标记为 [x]

## 覆盖面自检（对齐 R11 / T21）

- 本地启动：install / env / 启动 API / 启动 Web / 常用验证命令（build/typecheck/lint/test）
- 常见故障：
  - provider 超时
  - RAGFlow 不可用
  - citations 降级 / unavailable
- 排查主线：以 `requestId` 为主线贯穿，包含 UI -> API -> logs 的完整示例

## 自动化校验

- `tests/docs/runbook.contract.test.ts`
  - 断言 `docs/runbook.md` 文件存在
  - 断言必备章节存在：本地启动 / 常见故障 / 排查指引
  - 断言关键词存在：provider / ragflow / citations

## Verification（本地执行结果）

以下命令在仓库根目录执行并通过：

```powershell
npm run build
npm run typecheck
npm run lint
npm run test
```

- `npm run build`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test`: PASS

## 备注

- runbook 中的排查命令以 Windows PowerShell 为主（例如 `Select-String`），便于新同学直接复制粘贴。
- API 侧会在响应头回写 `x-request-id`，日志字段名为 `requestId`，runbook 已按此链路编写排查步骤。
