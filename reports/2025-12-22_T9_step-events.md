# T9 Step Events：事件模型与发射策略 - 验收日志

- Date: 2025-12-22
- Task: T9 - Step Events：事件模型与发射策略
- Requirement: R5

## Scope
- 在 `POST /api/stream` 的同一通道中发射 Step Events（与 token stream 区分）
- tool_called 参数摘要脱敏（避免泄露 apiKey/token 等敏感字段）
- 取消后进入稳定可恢复状态：
  - GraphQL `cancelTask` -> store abort -> stream abort
  - abort 后停止继续写入 token/StepEvent

## Channel Strategy（本次选择）
- Strategy: **同通道（MVP）**
- Transport: **Vercel AI Data Stream Protocol v1**

### Frontend 区分规则（token vs events）
- **Token**：Data Stream line code `0:`（`encodeVercelAiDataStreamTextLine`）
- **Events**：Data Stream line code `2:`，其 data item 为 `StreamPart`，其中
  - `part.type === "data-step-event"` 表示 StepEvent
  - `part.data` 可用 `StepEventSchema` 解析

### UI 侧归并/排序建议
- **排序 key**：`timestamp`（ISO string）
- **归并 key**：`stepId`
- **关联任务**：`taskId`
- **链路追踪**：`requestId`

## Event Definitions（对齐 contracts）
- `step_started`
- `step_progress`
- `tool_called`
- `tool_result`
- `step_completed`
- `step_failed`

Schema: `packages/core/src/contracts/events.ts` 的 `StepEventSchema`

## Redaction Strategy（脱敏策略）
- 在 `@niche/core` 内提供 `redactSecrets` / `createToolArgsSummary`
- 默认对以下 key pattern 进行递归脱敏：
  - `/token/i`
  - `/secret/i`
  - `/password/i`
  - `/api[_-]?key/i`
  - `/authorization/i`
  - `/cookie/i`
- 输出为 JSON string（长度可截断），敏感值替换为 `"[REDACTED]"`

## Emission Points（事件发射点列表）
- `apps/api/src/main.ts`
  - `/api/stream`：
    - 发射 `step_started`（建立 stream 后）
    - 发射 `tool_called`（mock tool 调用，argsSummary 使用脱敏摘要）
    - provider 每次 token：发射 `step_progress`
    - provider 第一个 token 后：发射一次 `tool_result`
    - 正常结束：发射 `step_completed`
    - 异常且非 abort：发射 `step_failed`

## Example Events（至少 3 类，包含 requestId/taskId/stepId/timestamp）

### 1) step_started
```json
{
  "type": "step_started",
  "taskId": "t_events_1",
  "stepId": "s_...",
  "stepName": "Answer",
  "timestamp": "2025-12-22T08:51:00.000Z",
  "requestId": "req_stream_events_1",
  "payload": {}
}
```

### 2) tool_called（参数摘要已脱敏）
```json
{
  "type": "tool_called",
  "taskId": "t_events_1",
  "stepId": "s_...",
  "stepName": "Answer",
  "timestamp": "2025-12-22T08:51:00.010Z",
  "requestId": "req_stream_events_1",
  "payload": {
    "toolName": "mock_tool",
    "argsSummary": "{\"query\":\"hello\",\"apiKey\":\"[REDACTED]\",\"nested\":{\"token\":\"[REDACTED]\",\"ok\":true}}"
  }
}
```

### 3) step_completed
```json
{
  "type": "step_completed",
  "taskId": "t_events_1",
  "stepId": "s_...",
  "stepName": "Answer",
  "timestamp": "2025-12-22T08:51:01.000Z",
  "requestId": "req_stream_events_1",
  "payload": {
    "outputSummary": "Hello world"
  }
}
```

## Cancellation & Recoverability
- GraphQL `cancelTask(taskId)` 会：
  - abort 该 task 的 abort controller
  - 更新 task.status 为 `cancelled`
- `/api/stream` 当 body 带 `taskId` 时：
  - 监听 store 的 abort signal，触发本次 stream 的 abort
  - abort 后：`safeWrite` 与 `emitStepEvent` 都会提前 return，从而停止产生新的输出/事件
- 前端可重新发起运行：
  - 复用同一个 `taskId` 或创建新 task 均可；状态机在后端层面保持一致（cancelled -> 重新运行会建立新连接/新 stepId）

## Verification Results

### Commands
- `npm run test`
- `npm run typecheck`
- `npm run lint`

### Automated Assertions (covered)
- Unit: StepEventSchema parse 覆盖所有 StepEvent 类型（`packages/core/src/contracts/contracts.test.ts`）
- Unit: tool_called 脱敏摘要不包含原始敏感字段（`packages/core/src/contracts/contracts.test.ts`）
- Integration: /api/stream 至少出现 3 类 StepEvent 且字段齐全（`apps/api/src/stream.test.ts`）
- Integration: cancelTask 后 stream abort，且不出现 step_completed（`apps/api/src/stream.test.ts`）

## Files Changed
- `apps/api/src/graphql.ts`
- `apps/api/src/main.ts`
- `apps/api/src/stream.test.ts`
- `packages/core/src/contracts/contracts.test.ts`
- `reports/2025-12-22_T9_step-events.md`
