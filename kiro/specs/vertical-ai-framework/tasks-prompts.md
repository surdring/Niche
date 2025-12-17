# tasks.md 提示词集合

> 本文件由脚本根据 `tasks.md` + `design.md` + `提示词模板.md` 自动生成，用于逐任务驱动实现。

## Phase 1: 项目骨架搭建

### Task 1: 初始化项目结构和基础配置（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 1: 初始化项目结构和基础配置**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property 5** (Provider 接口统一性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 5**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 1.1, 1.2, 1.3, 1.4, 1.5
```

### Task 1.1: 创建 monorepo 结构（packages/core, packages/cli, apps/api, apps/web）（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 1.1: 创建 monorepo 结构（packages/core, packages/cli, apps/api, apps/web）**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-1-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 1.2: 配置 Fastify 服务器骨架（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 1.2: 配置 Fastify 服务器骨架**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-1-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 1.3: 配置 Vercel AI SDK Core 集成（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 1.3: 配置 Vercel AI SDK Core 集成**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property 5** (Provider 接口统一性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-1-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 5**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 1.4: 配置 OpenTelemetry 追踪基础设施（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 1.4: 配置 OpenTelemetry 追踪基础设施**.

# References
1. **Design Specs**: Refer to `design.md` section **7. 可观测性系统 (Observability)**.
2. **Interfaces**: Implement strictly according to interface **IObservability**.
3. **Correctness Property**: You MUST verify **Property 13** (Token 用量追踪完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/observability/tracer.ts and packages/core/src/observability/metrics.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-1-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 13**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 1.5: 编写项目初始化属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 1.5: 编写项目初始化属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 5** (Provider 接口统一性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-1-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 5**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 2: 实现中间件层（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 2: 实现中间件层**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 19** (中间件执行顺序) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 19**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 2.1, 2.2, 2.3, 2.4
```

### Task 2.1: 实现 wrapLanguageModel 中间件模式（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 2.1: 实现 wrapLanguageModel 中间件模式**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 19** (中间件执行顺序) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-2-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 19**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 2.2: 编写中间件属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 2.2: 编写中间件属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 19** (中间件执行顺序) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-2-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 19**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 2.3: 实现 MockLanguageModel 测试支持（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 2.3: 实现 MockLanguageModel 测试支持**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 20** (Mock 模型注入) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-2-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 20**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 2.4: 编写 Mock 模型属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 2.4: 编写 Mock 模型属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 20** (Mock 模型注入) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-2-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 20**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 3: 实现流式处理器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 3: 实现流式处理器**.

# References
1. **Design Specs**: Refer to `design.md` section **9. 流式处理器 (Stream Handler) / Fastify 流式响应 Header 规范**.
2. **Interfaces**: Implement strictly according to interface **IStreamHandler**.
3. **Correctness Property**: You MUST verify **Property 14** (流式协议合规性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/stream-handler.ts or apps/api/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 14**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 3.1, 3.2, 3.3, 3.4, 3.5
```

### Task 3.1: 实现 StreamHandler 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 3.1: 实现 StreamHandler 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **9. 流式处理器 (Stream Handler) / Fastify 流式响应 Header 规范**.
2. **Interfaces**: Implement strictly according to interface **IStreamHandler**.
3. **Correctness Property**: You MUST verify **Property 14** (流式协议合规性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/stream-handler.ts or apps/api/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-3-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 14**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 3.2: 编写流式协议属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 3.2: 编写流式协议属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **9. 流式处理器 (Stream Handler) / Fastify 流式响应 Header 规范**.
2. **Interfaces**: Implement strictly according to interface **IStreamHandler**.
3. **Correctness Property**: You MUST verify **Property 14** (流式协议合规性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/stream-handler.ts or apps/api/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-3-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 14**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 3.3: 编写错误块属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 3.3: 编写错误块属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 15** (流式错误块格式) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-3-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 15**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 3.4: 实现 Token 用量估算回退（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 3.4: 实现 Token 用量估算回退**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 13** (Token 用量追踪完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-3-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 13**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 3.5: 编写 Token 追踪属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 1: 项目骨架搭建**.
Your immediate goal is to complete **Task 3.5: 编写 Token 追踪属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构 / ## 目录结构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 13** (Token 用量追踪完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-3-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 13**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 4: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 2: 核心引擎实现

### Task 5: 实现向量数据库适配器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 5: 实现向量数据库适配器**.

# References
1. **Design Specs**: Refer to `design.md` section **2. 向量数据库适配器 (Vector Store Adapter)**.
2. **Interfaces**: Implement strictly according to interface **IVectorStore**.
3. **Correctness Property**: You MUST verify **Property 1** (向量库适配器接口一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/vector-stores/interface.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 1**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 5.1, 5.2, 5.3, 5.4
```

### Task 5.1: 定义 IVectorStore 接口和统一过滤 DSL（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 5.1: 定义 IVectorStore 接口和统一过滤 DSL**.

# References
1. **Design Specs**: Refer to `design.md` section **2. 向量数据库适配器 (Vector Store Adapter)**.
2. **Interfaces**: Implement strictly according to interface **IVectorStore**.
3. **Correctness Property**: You MUST verify **Property 1** (向量库适配器接口一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/vector-stores/interface.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-5-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 1**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 5.2: 实现 Chroma 适配器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 5.2: 实现 Chroma 适配器**.

# References
1. **Design Specs**: Refer to `design.md` section **2. 向量数据库适配器 (Vector Store Adapter)**.
2. **Interfaces**: Implement strictly according to interface **IVectorStore**.
3. **Correctness Property**: You MUST verify **Property 1** (向量库适配器接口一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/vector-stores/chroma.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-5-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 1**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 5.3: 实现 Pinecone 适配器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 5.3: 实现 Pinecone 适配器**.

# References
1. **Design Specs**: Refer to `design.md` section **2. 向量数据库适配器 (Vector Store Adapter)**.
2. **Interfaces**: Implement strictly according to interface **IVectorStore**.
3. **Correctness Property**: You MUST verify **Property 1** (向量库适配器接口一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/vector-stores/pinecone.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-5-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 1**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 5.4: 编写向量库适配器属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 5.4: 编写向量库适配器属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **2. 向量数据库适配器 (Vector Store Adapter)**.
2. **Interfaces**: Implement strictly according to interface **IVectorStore**.
3. **Correctness Property**: You MUST verify **Property 1** (向量库适配器接口一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/vector-stores/interface.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-5-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 1**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 6: 实现文档处理管道（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6: 实现文档处理管道**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 2** (文档分块完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 2**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
```

### Task 6.1: 实现文档加载器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6.1: 实现文档加载器**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 6.2: 实现分块器（Chunker）（复杂任务）

```markdown
# Task: Implement Document Chunker
# Focus: Property 2 (Document Chunking Integrity)

Implement `packages/core/src/services/chunker.ts`.
You must implement `SemanticChunker` and `SlidingWindowChunker`.

**CRITICAL REQUIREMENT**:
You must track `startOffset` and `endOffset` for every chunk relative to the original text.
- `originalText.slice(chunk.startOffset, chunk.endOffset)` MUST equal `chunk.content` exactly.
- There must be NO gaps between chunks if `overlap` is 0.
- Verify this logic using `fast-check` by generating random strings, chunking them, and verifying the slice reconstruction matches the content.
```

### Task 6.3: 编写分块完整性属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6.3: 编写分块完整性属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 2** (文档分块完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 2**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 6.4: 实现数据清洗管道（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6.4: 实现数据清洗管道**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 8** (数据清洗幂等性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 8**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 6.5: 编写数据清洗属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6.5: 编写数据清洗属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 8** (数据清洗幂等性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 8**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 6.6: 实现 PII 脱敏处理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6.6: 实现 PII 脱敏处理**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 9** (PII 脱敏完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6-6.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 9**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 6.7: 编写 PII 脱敏属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 6.7: 编写 PII 脱敏属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 9** (PII 脱敏完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-6-7.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 9**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 7: 实现 RAG 管道（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 7: 实现 RAG 管道**.

# References
1. **Design Specs**: Refer to `design.md` section **3. RAG 管道 (RAG Pipeline)**.
2. **Interfaces**: Implement strictly according to interface **IRAGPipeline**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/rag-pipeline.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-7.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 7.1, 7.2, 7.3, 7.4, 7.5
```

### Task 7.1: 实现 RAGPipeline 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 7.1: 实现 RAGPipeline 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **3. RAG 管道 (RAG Pipeline)**.
2. **Interfaces**: Implement strictly according to interface **IRAGPipeline**.
3. **Correctness Property**: You MUST verify **Property 2** (文档分块完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/rag-pipeline.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-7-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 2**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 7.2: 实现引用坐标追踪（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 7.2: 实现引用坐标追踪**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-7-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 7.3: 编写检索溯源属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 7.3: 编写检索溯源属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-7-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 7.4: 实现 Reranker 组件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 7.4: 实现 Reranker 组件**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 21** (流式文本渲染一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-7-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 21**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 7.5: 实现流式生成（streamGenerate）（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 7.5: 实现流式生成（streamGenerate）**.

# References
1. **Design Specs**: Refer to `design.md` section **9. 流式处理器 (Stream Handler) / Fastify 流式响应 Header 规范**.
2. **Interfaces**: Implement strictly according to interface **IStreamHandler**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/stream-handler.ts or apps/api/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-7-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 8: 实现模型路由器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 8: 实现模型路由器**.

# References
1. **Design Specs**: Refer to `design.md` section **1. 模型路由器 (Model Router)**.
2. **Interfaces**: Implement strictly according to interface **IModelRouter**.
3. **Correctness Property**: You MUST verify **Property 4** (模型路由规则确定性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/model-router.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-8.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 4**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 8.1, 8.2, 8.3, 8.4
```

### Task 8.1: 实现 ModelRouter 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 8.1: 实现 ModelRouter 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **1. 模型路由器 (Model Router)**.
2. **Interfaces**: Implement strictly according to interface **IModelRouter**.
3. **Correctness Property**: You MUST verify **Property 4** (模型路由规则确定性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/model-router.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-8-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 4**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 8.2: 实现复杂度评估逻辑（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 8.2: 实现复杂度评估逻辑**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 4** (模型路由规则确定性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-8-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 4**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 8.3: 编写路由规则属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 8.3: 编写路由规则属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property 4** (模型路由规则确定性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-8-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 4**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 8.4: 实现故障转移逻辑（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 2: 核心引擎实现**.
Your immediate goal is to complete **Task 8.4: 实现故障转移逻辑**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-8-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 9: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 3: Agent 和结构化输出

### Task 10: 实现 Agent 引擎（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10: 实现 Agent 引擎**.

# References
1. **Design Specs**: Refer to `design.md` section **4. Agent 引擎 (Agent Engine)**.
2. **Interfaces**: Implement strictly according to interface **IAgentEngine**.
3. **Correctness Property**: You MUST verify **Property 6** (工具参数 Zod 验证) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/agent-engine.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 6**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6
```

### Task 10.1: 实现 AgentEngine 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10.1: 实现 AgentEngine 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **4. Agent 引擎 (Agent Engine)**.
2. **Interfaces**: Implement strictly according to interface **IAgentEngine**.
3. **Correctness Property**: You MUST verify **Property 6** (工具参数 Zod 验证) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/agent-engine.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 6**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 10.2: 实现 Zod 工具参数验证（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10.2: 实现 Zod 工具参数验证**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 6** (工具参数 Zod 验证) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 6**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 10.3: 编写工具参数验证属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10.3: 编写工具参数验证属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 6** (工具参数 Zod 验证) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 6**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 10.4: 实现 maxSteps 限制（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10.4: 实现 maxSteps 限制**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 7** (Agent 步数限制) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 7**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 10.5: 编写步数限制属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10.5: 编写步数限制属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 7** (Agent 步数限制) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 7**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 10.6: 实现多 Agent 协作（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 3: Agent 和结构化输出**.
Your immediate goal is to complete **Task 10.6: 实现多 Agent 协作**.

# References
1. **Design Specs**: Refer to `design.md` section **4. Agent 引擎 (Agent Engine)**.
2. **Interfaces**: Implement strictly according to interface **IAgentEngine**.
3. **Correctness Property**: You MUST verify **Property 7** (Agent 步数限制) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/agent-engine.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-10-6.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 7**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 11: 实现结构化输出（复杂任务）

```markdown
# Task: Implement Structured Output with Auto-Correction
# Focus: Property 17 (Auto-fix)

Implement the wrapper for `generateObject` in `packages/core`.

**Logic**:
1. Try to generate object.
2. If `ZodError` occurs:
   - Catch the error.
   - Construct a new "User Message" containing the validation error details.
   - Append to history and request the model to "fix the JSON format matching the schema".
   - Retry (up to `maxRetries`).
3. If all retries fail, throw a typed `StructureValidationError`.

**Testing**:
Mock the LanguageModel to intentionally return bad JSON on the first 2 calls, then good JSON on the 3rd. Verify the wrapper handles this transparency.
```

### Task 11.1: 实现 generateObject 封装（复杂任务）

```markdown
# Task: Implement Structured Output with Auto-Correction
# Focus: Property 17 (Auto-fix)

Implement the wrapper for `generateObject` in `packages/core`.

**Logic**:
1. Try to generate object.
2. If `ZodError` occurs:
   - Catch the error.
   - Construct a new "User Message" containing the validation error details.
   - Append to history and request the model to "fix the JSON format matching the schema".
   - Retry (up to `maxRetries`).
3. If all retries fail, throw a typed `StructureValidationError`.

**Testing**:
Mock the LanguageModel to intentionally return bad JSON on the first 2 calls, then good JSON on the 3rd. Verify the wrapper handles this transparency.
```

### Task 11.2: 实现 streamObject 封装（复杂任务）

```markdown
# Task: Implement Structured Output with Auto-Correction
# Focus: Property 17 (Auto-fix)

Implement the wrapper for `generateObject` in `packages/core`.

**Logic**:
1. Try to generate object.
2. If `ZodError` occurs:
   - Catch the error.
   - Construct a new "User Message" containing the validation error details.
   - Append to history and request the model to "fix the JSON format matching the schema".
   - Retry (up to `maxRetries`).
3. If all retries fail, throw a typed `StructureValidationError`.

**Testing**:
Mock the LanguageModel to intentionally return bad JSON on the first 2 calls, then good JSON on the 3rd. Verify the wrapper handles this transparency.
```

### Task 11.3: 编写结构化输出属性测试（复杂任务）

```markdown
# Task: Implement Structured Output with Auto-Correction
# Focus: Property 17 (Auto-fix)

Implement the wrapper for `generateObject` in `packages/core`.

**Logic**:
1. Try to generate object.
2. If `ZodError` occurs:
   - Catch the error.
   - Construct a new "User Message" containing the validation error details.
   - Append to history and request the model to "fix the JSON format matching the schema".
   - Retry (up to `maxRetries`).
3. If all retries fail, throw a typed `StructureValidationError`.

**Testing**:
Mock the LanguageModel to intentionally return bad JSON on the first 2 calls, then good JSON on the 3rd. Verify the wrapper handles this transparency.
```

### Task 11.4: 实现自动修复重试（复杂任务）

```markdown
# Task: Implement Structured Output with Auto-Correction
# Focus: Property 17 (Auto-fix)

Implement the wrapper for `generateObject` in `packages/core`.

**Logic**:
1. Try to generate object.
2. If `ZodError` occurs:
   - Catch the error.
   - Construct a new "User Message" containing the validation error details.
   - Append to history and request the model to "fix the JSON format matching the schema".
   - Retry (up to `maxRetries`).
3. If all retries fail, throw a typed `StructureValidationError`.

**Testing**:
Mock the LanguageModel to intentionally return bad JSON on the first 2 calls, then good JSON on the 3rd. Verify the wrapper handles this transparency.
```

### Task 11.5: 编写自动修复属性测试（复杂任务）

```markdown
# Task: Implement Structured Output with Auto-Correction
# Focus: Property 17 (Auto-fix)

Implement the wrapper for `generateObject` in `packages/core`.

**Logic**:
1. Try to generate object.
2. If `ZodError` occurs:
   - Catch the error.
   - Construct a new "User Message" containing the validation error details.
   - Append to history and request the model to "fix the JSON format matching the schema".
   - Retry (up to `maxRetries`).
3. If all retries fail, throw a typed `StructureValidationError`.

**Testing**:
Mock the LanguageModel to intentionally return bad JSON on the first 2 calls, then good JSON on the 3rd. Verify the wrapper handles this transparency.
```

### Task 12: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 4: 安全与缓存

### Task 13: 实现安全护栏（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 13: 实现安全护栏**.

# References
1. **Design Specs**: Refer to `design.md` section **5. 安全护栏 (Guardrails)**.
2. **Interfaces**: Implement strictly according to interface **IGuardrails**.
3. **Correctness Property**: You MUST verify **Property 10** (护栏注入检测) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/middleware/guardrails.ts or packages/core/src/core/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-13.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 10**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 13.1, 13.2, 13.3, 13.4, 13.5
```

### Task 13.1: 实现 Guardrails 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 13.1: 实现 Guardrails 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **5. 安全护栏 (Guardrails)**.
2. **Interfaces**: Implement strictly according to interface **IGuardrails**.
3. **Correctness Property**: You MUST verify **Property 10** (护栏注入检测) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/middleware/guardrails.ts or packages/core/src/core/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-13-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 10**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 13.2: 实现提示注入检测（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 13.2: 实现提示注入检测**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 10** (护栏注入检测) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-13-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 10**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 13.3: 编写注入检测属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 13.3: 编写注入检测属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 10** (护栏注入检测) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-13-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 10**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 13.4: 实现内容过滤规则（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 13.4: 实现内容过滤规则**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-13-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 13.5: 实现降级响应（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 13.5: 实现降级响应**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-13-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 14: 实现缓存系统（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 14: 实现缓存系统**.

# References
1. **Design Specs**: Refer to `design.md` section **6. 缓存系统 (Cache System)**.
2. **Interfaces**: Implement strictly according to interface **ICacheSystem**.
3. **Correctness Property**: You MUST verify **Property 11** (缓存命中一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/cache/interface.ts and packages/core/src/adapters/cache/redis.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-14.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 11**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 14.1, 14.2, 14.3, 14.4, 14.5
```

### Task 14.1: 实现 CacheSystem 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 14.1: 实现 CacheSystem 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **6. 缓存系统 (Cache System)**.
2. **Interfaces**: Implement strictly according to interface **ICacheSystem**.
3. **Correctness Property**: You MUST verify **Property 11** (缓存命中一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/cache/interface.ts and packages/core/src/adapters/cache/redis.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-14-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 11**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 14.2: 实现 Redis 缓存适配器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 14.2: 实现 Redis 缓存适配器**.

# References
1. **Design Specs**: Refer to `design.md` section **6. 缓存系统 (Cache System)**.
2. **Interfaces**: Implement strictly according to interface **ICacheSystem**.
3. **Correctness Property**: You MUST verify **Property 11** (缓存命中一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/cache/interface.ts and packages/core/src/adapters/cache/redis.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-14-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 11**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 14.3: 编写缓存命中属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 14.3: 编写缓存命中属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **6. 缓存系统 (Cache System)**.
2. **Interfaces**: Implement strictly according to interface **ICacheSystem**.
3. **Correctness Property**: You MUST verify **Property 11** (缓存命中一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/cache/interface.ts and packages/core/src/adapters/cache/redis.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-14-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 11**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 14.4: 实现语义相似缓存（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 14.4: 实现语义相似缓存**.

# References
1. **Design Specs**: Refer to `design.md` section **6. 缓存系统 (Cache System)**.
2. **Interfaces**: Implement strictly according to interface **ICacheSystem**.
3. **Correctness Property**: You MUST verify **Property 12** (语义缓存相似性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/cache/interface.ts and packages/core/src/adapters/cache/redis.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-14-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 12**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 14.5: 编写语义缓存属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 4: 安全与缓存**.
Your immediate goal is to complete **Task 14.5: 编写语义缓存属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **6. 缓存系统 (Cache System)**.
2. **Interfaces**: Implement strictly according to interface **ICacheSystem**.
3. **Correctness Property**: You MUST verify **Property 12** (语义缓存相似性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/adapters/cache/interface.ts and packages/core/src/adapters/cache/redis.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-14-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 12**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 15: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 5: 租户与可观测性

### Task 16: 实现租户管理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 16: 实现租户管理**.

# References
1. **Design Specs**: Refer to `design.md` section **8. 租户管理 (Tenant Manager)**.
2. **Interfaces**: Implement strictly according to interface **ITenantManager**.
3. **Correctness Property**: You MUST verify **Property 18** (租户配额执行) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/tenant/manager.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-16.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 18**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 16.1, 16.2, 16.3, 16.4, 16.5
```

### Task 16.1: 配置 Prisma 数据库 Schema（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 16.1: 配置 Prisma 数据库 Schema**.

# References
1. **Design Specs**: Refer to `design.md` section **## 数据模型**.
2. **Interfaces**: Implement strictly according to interface **Prisma Schema**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `prisma/schema.prisma`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-16-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 16.2: 实现 TenantManager 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 16.2: 实现 TenantManager 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **8. 租户管理 (Tenant Manager)**.
2. **Interfaces**: Implement strictly according to interface **ITenantManager**.
3. **Correctness Property**: You MUST verify **Property 18** (租户配额执行) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/tenant/manager.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-16-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 18**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 16.3: 实现配额检查和执行（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 16.3: 实现配额检查和执行**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 18** (租户配额执行) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-16-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 18**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 16.4: 编写配额执行属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 16.4: 编写配额执行属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 18** (租户配额执行) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-16-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 18**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 16.5: 实现 API Key 管理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 16.5: 实现 API Key 管理**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-16-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 17: 实现可观测性系统（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 17: 实现可观测性系统**.

# References
1. **Design Specs**: Refer to `design.md` section **7. 可观测性系统 (Observability)**.
2. **Interfaces**: Implement strictly according to interface **IObservability**.
3. **Correctness Property**: You MUST verify **Property 13** (Token 用量追踪完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/observability/tracer.ts and packages/core/src/observability/metrics.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-17.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 13**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 17.1, 17.2, 17.3, 17.4
```

### Task 17.1: 实现 Observability 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 17.1: 实现 Observability 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **7. 可观测性系统 (Observability)**.
2. **Interfaces**: Implement strictly according to interface **IObservability**.
3. **Correctness Property**: You MUST verify **Property 13** (Token 用量追踪完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/observability/tracer.ts and packages/core/src/observability/metrics.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-17-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 13**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 17.2: 集成 onFinish 回调（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 17.2: 集成 onFinish 回调**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 13** (Token 用量追踪完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-17-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 13**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 17.3: 实现成本分析报表（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 17.3: 实现成本分析报表**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-17-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 17.4: 实现告警触发（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 5: 租户与可观测性**.
Your immediate goal is to complete **Task 17.4: 实现告警触发**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-17-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 18: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 6: API 层实现

### Task 19: 实现 API 路由（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 19: 实现 API 路由**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property 2** (文档分块完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-19.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 2**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 19.1, 19.2, 19.3, 19.4, 19.5
```

### Task 19.1: 实现 /api/chat 端点（复杂任务）

```markdown
# Task: Implement Chat API Endpoint
# Focus: Property 14 & 15 (Stream Protocol Compliance)

Implement `apps/api/src/routes/chat.ts` and the `StreamHandler`.

**PROTOCOL SPECS**:
You must strictly follow **Vercel AI Data Stream Protocol (v1)**.
- Text: `0:"hello"`
- Data/Citations: `2:[{"citation":...}]` (Note: verify the exact digit for data parts in latest SDK)
- Error: `e:{"error":"..."}`

**Constraints**:
- Set Header: `X-Vercel-AI-Data-Stream: v1`.
- Do NOT buffer the entire response. Use strict streaming.
- If an error occurs *after* the stream starts, you MUST send an Error Chunk (`e:...`), do not just close the connection or throw a JSON error (which would break the stream syntax).
```

### Task 19.2: 实现 /api/rag 端点（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 19.2: 实现 /api/rag 端点**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property 2** (文档分块完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/rag.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-19-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 2**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 19.3: 实现 /api/documents 端点（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 19.3: 实现 /api/documents 端点**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/documents.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-19-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 19.4: 实现 /api/agents 端点（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 19.4: 实现 /api/agents 端点**.

# References
1. **Design Specs**: Refer to `design.md` section **4. Agent 引擎 (Agent Engine)**.
2. **Interfaces**: Implement strictly according to interface **IAgentEngine**.
3. **Correctness Property**: You MUST verify **Property 7** (Agent 步数限制) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/agent-engine.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-19-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 7**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 19.5: 实现 /api/admin 端点（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 19.5: 实现 /api/admin 端点**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-19-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 20: 实现认证和限流（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 20: 实现认证和限流**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-20.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 20.1, 20.2, 20.3
```

### Task 20.1: 实现 API Key 认证中间件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 20.1: 实现 API Key 认证中间件**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-20-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 20.2: 实现限流中间件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 20.2: 实现限流中间件**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-20-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 20.3: 实现 JWT 认证支持（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 20.3: 实现 JWT 认证支持**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-20-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 21: 实现 WebSocket 支持（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 21: 实现 WebSocket 支持**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-21.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 21.1, 21.2
```

### Task 21.1: 配置 Fastify WebSocket 插件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 21.1: 配置 Fastify WebSocket 插件**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-21-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 21.2: 实现 WebSocket 消息处理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 6: API 层实现**.
Your immediate goal is to complete **Task 21.2: 实现 WebSocket 消息处理**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-21-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 22: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 7: 前端实现

### Task 23: 初始化前端项目（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 23: 初始化前端项目**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 21** (流式文本渲染一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-23.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 21**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 23.1, 23.2, 23.3
```

### Task 23.1: 创建 React + Vite 项目（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 23.1: 创建 React + Vite 项目**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 21** (流式文本渲染一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-23-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 21**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 23.2: 安装和配置 Shadcn/ui（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 23.2: 安装和配置 Shadcn/ui**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-23-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 23.3: 配置 Zustand 状态管理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 23.3: 配置 Zustand 状态管理**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-23-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 24: 实现聊天界面（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 24: 实现聊天界面**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 21** (流式文本渲染一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-24.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 21**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 24.1, 24.2, 24.3, 24.4, 24.5
```

### Task 24.1: 实现 ChatInterface 组件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 24.1: 实现 ChatInterface 组件**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 21** (流式文本渲染一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-24-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 21**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 24.2: 实现 useChat Hook 扩展（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 24.2: 实现 useChat Hook 扩展**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-24-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 24.3: 实现流式文本渲染（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 24.3: 实现流式文本渲染**.

# References
1. **Design Specs**: Refer to `design.md` section **9. 流式处理器 (Stream Handler) / Fastify 流式响应 Header 规范**.
2. **Interfaces**: Implement strictly according to interface **IStreamHandler**.
3. **Correctness Property**: You MUST verify **Property 14** (流式协议合规性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/stream-handler.ts or apps/api/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-24-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 14**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 24.4: 编写流式渲染属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 24.4: 编写流式渲染属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **9. 流式处理器 (Stream Handler) / Fastify 流式响应 Header 规范**.
2. **Interfaces**: Implement strictly according to interface **IStreamHandler**.
3. **Correctness Property**: You MUST verify **Property 21** (流式文本渲染一致性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/core/stream-handler.ts or apps/api/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-24-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 21**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 24.5: 实现工具调用状态指示（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 24.5: 实现工具调用状态指示**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-24-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 25: 实现文档查看器（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 25: 实现文档查看器**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 22** (引用高亮准确性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-25.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 22**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 25.1, 25.2, 25.3, 25.4, 25.5
```

### Task 25.1: 实现 DocumentViewer 组件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 25.1: 实现 DocumentViewer 组件**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 22** (引用高亮准确性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-25-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 22**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 25.2: 实现引用高亮功能（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 25.2: 实现引用高亮功能**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-25-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 25.3: 编写引用高亮属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 25.3: 编写引用高亮属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 22** (引用高亮准确性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-25-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 22**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 25.4: 实现划词操作（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 25.4: 实现划词操作**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 23** (划词操作响应性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-25-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 23**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 25.5: 编写划词操作属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 25.5: 编写划词操作属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 23** (划词操作响应性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-25-5.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 23**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 26: 实现引用面板（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 26: 实现引用面板**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-26.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 26.1, 26.2
```

### Task 26.1: 实现 CitationPanel 组件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 26.1: 实现 CitationPanel 组件**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 3** (检索结果溯源完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-26-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 3**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 26.2: 实现引用与文档联动（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 26.2: 实现引用与文档联动**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 22** (引用高亮准确性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-26-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 22**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 27: 实现反馈系统（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 27: 实现反馈系统**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 24** (反馈数据完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-27.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 24**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 27.1, 27.2, 27.3
```

### Task 27.1: 实现 FeedbackButton 组件（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 27.1: 实现 FeedbackButton 组件**.

# References
1. **Design Specs**: Refer to `design.md` section **### 前端正确性属性补充 / ## 现代 UI 设计系统规范**.
2. **Interfaces**: Implement strictly according to interface **React Component / Hooks**.
3. **Correctness Property**: You MUST verify **Property 24** (反馈数据完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/web/src/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-27-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 24**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 27.2: 实现反馈后续问卷（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 27.2: 实现反馈后续问卷**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-27-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 27.3: 编写反馈完整性属性测试（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 7: 前端实现**.
Your immediate goal is to complete **Task 27.3: 编写反馈完整性属性测试**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property 24** (反馈数据完整性) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-27-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property 24**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 28: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 8: 评估与工具

### Task 29: 实现评估框架（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 29: 实现评估框架**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-29.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 29.1, 29.2, 29.3, 29.4
```

### Task 29.1: 实现 EvalFramework 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 29.1: 实现 EvalFramework 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-29-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 29.2: 实现多维度评估（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 29.2: 实现多维度评估**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-29-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 29.3: 实现 LLM-as-a-Judge 模式（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 29.3: 实现 LLM-as-a-Judge 模式**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-29-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 29.4: 实现评估报告生成（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 29.4: 实现评估报告生成**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-29-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 30: 实现合成数据生成（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 30: 实现合成数据生成**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-30.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 30.1, 30.2, 30.3
```

### Task 30.1: 实现 SyntheticDataGenerator 类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 30.1: 实现 SyntheticDataGenerator 类**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-30-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 30.2: 实现数据增强（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 30.2: 实现数据增强**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-30-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 30.3: 实现数据导出（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 30.3: 实现数据导出**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-30-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 31: 实现提示词管理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 31: 实现提示词管理**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-31.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 31.1, 31.2, 31.3, 31.4
```

### Task 31.1: 实现 PromptManager 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 31.1: 实现 PromptManager 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-31-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 31.2: 实现版本管理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 31.2: 实现版本管理**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-31-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 31.3: 实现 A/B 测试支持（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 31.3: 实现 A/B 测试支持**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-31-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 31.4: 实现动态 Few-shot 选择（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 31.4: 实现动态 Few-shot 选择**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-31-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 32: 实现 CLI 工具（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 32: 实现 CLI 工具**.

# References
1. **Design Specs**: Refer to `design.md` section **## 目录结构 / CLI**.
2. **Interfaces**: Implement strictly according to interface **CLI Commands**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/cli/src/commands/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-32.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 32.1, 32.2, 32.3, 32.4
```

### Task 32.1: 实现 init 命令（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 32.1: 实现 init 命令**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-32-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 32.2: 实现 eval 命令（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 32.2: 实现 eval 命令**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-32-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 32.3: 实现 ingest 命令（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 32.3: 实现 ingest 命令**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-32-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 32.4: 实现 serve 命令（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 8: 评估与工具**.
Your immediate goal is to complete **Task 32.4: 实现 serve 命令**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-32-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 33: Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```

## Phase 9: 集成与文档

### Task 34: 实现配置管理（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 34: 实现配置管理**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-34.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 34.1, 34.2, 34.3, 34.4
```

### Task 34.1: 实现 ConfigManager 核心类（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 34.1: 实现 ConfigManager 核心类**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-34-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 34.2: 实现配置验证（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 34.2: 实现配置验证**.

# References
1. **Design Specs**: Refer to `design.md` section **## 配置示例 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **ConfigManager**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `packages/core/src/config/index.ts and packages/core/src/config/schema.ts`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-34-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 34.3: 实现热更新支持（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 34.3: 实现热更新支持**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-34-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 34.4: 实现环境隔离（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 34.4: 实现环境隔离**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-34-4.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 35: 实现插件系统（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 35: 实现插件系统**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-35.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 35.1, 35.2, 35.3
```

### Task 35.1: 定义插件接口（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 35.1: 定义插件接口**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-35-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 35.2: 实现插件注册和执行（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 35.2: 实现插件注册和执行**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-35-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 35.3: 实现运行时启用/禁用（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 35.3: 实现运行时启用/禁用**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-35-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 36: 编写文档（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 36: 编写文档**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-36.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 36.1, 36.2, 36.3
```

### Task 36.1: 编写 API 文档（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 36.1: 编写 API 文档**.

# References
1. **Design Specs**: Refer to `design.md` section **架构 / Fastify 流式响应 Header 规范 / 错误处理**.
2. **Interfaces**: Implement strictly according to interface **Fastify Route / Zod Schemas**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `apps/api/src/routes/...`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-36-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 36.2: 编写快速开始指南（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 36.2: 编写快速开始指南**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-36-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 36.3: 编写架构文档（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 36.3: 编写架构文档**.

# References
1. **Design Specs**: Refer to `design.md` section **## 架构**.
2. **Interfaces**: Implement strictly according to interface **N/A**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `[目标文件路径]`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-36-3.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 37: 配置 Docker 开发环境（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 37: 配置 Docker 开发环境**.

# References
1. **Design Specs**: Refer to `design.md` section **## 测试策略 / 目录结构**.
2. **Interfaces**: Implement strictly according to interface **Docker Compose / Dockerfile**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `docker-compose.yml and Dockerfile`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-37.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.

# Scope Note
This is an umbrella task. Ensure all nested sub-tasks are completed: 37.1, 37.2
```

### Task 37.1: 编写 docker-compose.yml（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 37.1: 编写 docker-compose.yml**.

# References
1. **Design Specs**: Refer to `design.md` section **## 测试策略 / 目录结构**.
2. **Interfaces**: Implement strictly according to interface **Docker Compose / Dockerfile**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `docker-compose.yml and Dockerfile`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-37-1.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 37.2: 编写 Dockerfile（普通任务）

```markdown
# Context
You are the Lead Engineer for the Vertical AI Framework.
We are currently executing **Phase 9: 集成与文档**.
Your immediate goal is to complete **Task 37.2: 编写 Dockerfile**.

# References
1. **Design Specs**: Refer to `design.md` section **## 测试策略 / 目录结构**.
2. **Interfaces**: Implement strictly according to interface **Docker Compose / Dockerfile**.
3. **Correctness Property**: You MUST verify **Property TBD** (TBD) defined in `design.md`.

# Instructions

## Step 1: Implementation
- Create/Edit file: `docker-compose.yml and Dockerfile`.
- Implement the logic using **TypeScript** and **Zod**.
- **Constraint**: Ensure strict type safety. Do not use `any`.
- **Constraint**: If specific error codes/types are defined in `design.md` (Error Handling section), use them.

## Step 2: Property-Based Testing
- Create/Edit test file: `tests/property/task-37-2.test.ts`.
- Use `fast-check` and `vitest`.
- **Goal**: Implement the test for **Property TBD**.
- Logic:
  1. Define the Arbitrary (generator) for input data strictly matching the Zod schema.
  2. Run the function/class method.
  3. Assert the invariant (the "Property") holds true.
  - *Example invariant*: `result.startOffset < result.endOffset` OR `decode(encode(x)) === x`.

# Notes
- If no suitable correctness property exists in `design.md`, propose one and add a corresponding property-based test before proceeding.

# Checklist
- [ ] Code compiles without linting errors.
- [ ] Interface matches `design.md` exactly.
- [ ] At least one Property Test passes 100 iterations.

Please generate the implementation code and the property test code now.
```

### Task 38: Final Checkpoint - 确保所有测试通过（Checkpoint/审查任务）

```markdown
# Context
You have just completed a set of tasks. Now act as a **QA Engineer and Security Specialist**.
Review the current codebase (specifically `packages/core` and `apps/api`).

# Review Objectives

## 1. Design Compliance Check
- Verify that all exported functions/classes match the interfaces in `design.md`.
- Check if **Zod Schemas** are used for ALL external inputs (API inputs, Tool arguments, Config loading).

## 2. Correctness Property Audit
- Look at `design.md` -> "Correctness Properties".
- Are there any implemented features that lack a corresponding Property Test?
- *Action*: If yes, list them and propose the test logic.

## 3. Security & Safety (Guardrails)
- **Injection**: Are variables in SQL/Vector DB queries properly parameterized?
- **PII**: Is there any logging statement that might accidentally log raw user input before PII redaction?
- **Error Handling**: Are we leaking stack traces to the API response? (Ensure `Fastify` error handler masks internal errors).

## 4. Performance (Async/Await)
- Check for "await inside loop" patterns. Suggest `Promise.all` where applicable.
- Check if high-latency operations (DB writes, Telemetry) are blocking the main response thread (should use `event.waitUntil` pattern or fire-and-forget).

# Output
Provide a concise bulleted list of issues found (if any) and a refactoring plan. If the code is solid, verify clearly why it meets the criteria.
```
