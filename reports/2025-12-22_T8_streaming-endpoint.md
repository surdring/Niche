# T8 验收日志 - Streaming Endpoint（Vercel AI Data Stream Protocol v1）

- Date: 2025-12-22
- Task: T8 - Streaming Endpoint：Vercel AI Data Stream Protocol 输出
- Scope: `apps/api`, `packages/core`

## 变更概述

- `@niche/core`：新增 Vercel AI Data Stream Protocol（v1）的 Zod schema + encoder/decoder（用于严格生成/解析 `0:`/`2:`/`3:`/`f:`/`e:`/`d:` 等协议行）。
- `@niche/api`：实现 `POST /api/stream`：
  - 请求体 Zod 校验。
  - 响应头：`X-Vercel-AI-Data-Stream: v1` + `Content-Type: text/plain; charset=utf-8`。
  - 输出按 Data Stream Protocol v1 编码的增量流。
  - streaming 过程异常转换为可识别的 error block（data-app-error + error text），且 `AppError` 可被解析（含 `code/message/retryable/requestId`）。
  - 客户端断开触发取消：使用 `AbortController` 向底层 provider 传递取消信号。
  - TTFT（Time To First Token）与总耗时记录，并与 `requestId` 关联（日志可观测）。
- `@niche/api`：新增集成测试覆盖协议可解析性、error block、取消、TTFT 可观测。

## 关键文件

- `packages/core/src/contracts/stream.ts`
- `apps/api/src/main.ts`
- `apps/api/src/stream.test.ts`

## 协议一致性说明（终止语义）

- 本任务对齐的是 **Vercel AI Data Stream Protocol v1**（响应头 `X-Vercel-AI-Data-Stream: v1`、`text/plain; charset=utf-8`、以 `0:`/`e:`/`d:` 等前缀行构成）。
- 该协议的流终止通过 **服务端关闭连接**完成；不强制要求额外写入 `data: [DONE]`。
- `data: [DONE]` 是 **UI Message Stream（SSE）**协议中的终止标记，与本任务的 Data Stream Protocol（text/plain 行协议）不同。

## 覆盖的自动化验证

### 1) 协议可解析性

- 集成测试请求 `/api/stream` 后，将返回内容按 `@niche/core` 的 decoder 逐行解析并断言完整可解析。

### 2) error block

- 通过注入 mock provider 人为制造错误，断言返回包含可解析为 `AppError` 的数据块，并且后续带有前端可识别的 error text。

### 3) cancel（客户端断开）

- 使用 `node:http` 发起请求并主动断开响应读取，断言服务端触发 `AbortController`，底层 provider 能观测到 abort。

### 4) TTFT

- 在一次流式调用中断言 TTFT 被记录（通过测试捕获的 logger 输出可观测）。

## 验证命令与结果

- `npm run test` ✅
  - `@niche/api`: 3 files / 9 tests passed（包含 `src/stream.test.ts` 4 tests）
  - `@niche/core`: 7 files / 17 tests passed
  - `@niche/web`: 1 file / 1 test passed
- `npm run typecheck` ✅
- `npm run lint` ✅
