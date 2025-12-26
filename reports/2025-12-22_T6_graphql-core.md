# 验收日志：T6 - GraphQL 主干（Template/Project/Task/Session + createTask/cancelTask）

- Date: 2025-12-22
- Task: T6
- Scope: `apps/api`, `packages/core`, `specs/study-copilot/*`

## 1. 目标与完成情况

本次完成 T6：实现 GraphQL 最小主干，包括 `Template/Project/Task/Session` 的最小查询能力，以及 `createTask/cancelTask` 两个 mutation，并通过自动化测试验收。

已满足验收点：
- `createTask` 返回 `taskId`。
- `Task/Session` 可查询且包含 `templateRef`（`templateVersion`/`templateDefinitionHash`）且非空（用于可复现）。
- `cancelTask` 状态变更可观测。

## 2. 关键实现变更

### 2.1 Contracts（@niche/core）
- `Session` contract 增加 `templateRef` 字段，用于会话可复现记录。
- `Task` contract 已包含 `sessionId` 字段（用于 Task/Session 关联）。

### 2.2 GraphQL API（@niche/api）
- 新增 GraphQL 入口：`POST /api/graphql`（Mercurius），并启用 `graphiql: true`。
- 最小 schema：
  - Query:
    - `templates`
    - `projects`
    - `tasks(projectId: ID!)`
    - `task(id: ID!)`
    - `session(id: ID!)`
  - Mutation:
    - `createTask(input: CreateTaskInput!)`
    - `cancelTask(taskId: ID!)`
- `createTask`：
  - 校验 `tenantId`/`projectId`（GraphQL 侧要求 projectId header 且与 input 一致，阻止跨 project 访问）。
  - `templateId` 与 `templateDefinition` 二选一（Zod 校验）。
  - 创建 `task/session`（in-memory store），并持久化 `templateRef`。
- `cancelTask`：
  - 校验 task 存在且 projectId 一致。
  - 更新 task `status` 为 `cancelled`。

### 2.3 Monorepo 导出一致性修复（@niche/core）
- 增加 `package.json#exports`，使 `import` 场景（vitest/tsx）可直接使用 `src/index.ts`，避免运行时导出不同步导致的 `undefined.parse` 类问题。

### 2.4 Specs 状态同步
- `specs/study-copilot/tasks.md`：T6 标题加 `✅`。
- `specs/study-copilot/tasks-prompts.md`：补充并勾选 T6 的 `# Checklist`。

## 3. 变更文件清单（摘要）

- `apps/api/src/graphql.ts`
- `apps/api/src/graphql.test.ts`
- `apps/api/src/main.ts`
- `apps/api/package.json`
- `packages/core/src/contracts/session.ts`
- `packages/core/package.json`
- `specs/study-copilot/tasks.md`
- `specs/study-copilot/tasks-prompts.md`

## 4. 自动化验证记录

### 4.1 依赖安装
- Command: `npm install`
- Result: success
- Note: 提示 `5 moderate severity vulnerabilities`，未执行 `npm audit fix --force`（避免引入破坏性升级）。

### 4.2 @niche/api
- Command: `npm run test -w @niche/api`
- Result: pass

- Command: `npm run typecheck -w @niche/api`
- Result: pass

- Command: `npm run lint -w @niche/api`
- Result: pass

### 4.3 @niche/core
- Command: `npm run test -w @niche/core`
- Result: pass

- Command: `npm run typecheck -w @niche/core`
- Result: pass

- Command: `npm run lint -w @niche/core`
- Result: pass

## 5. 备注与后续

- 当前 task/session/project 存储为 in-memory（符合 T6 最小实现），后续可替换为持久化存储。
- GraphQL schema 为最小集合，后续可按设计文档扩展字段与订阅/streaming 相关能力。
