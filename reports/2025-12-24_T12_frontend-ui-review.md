# 代码审查报告 - T12 前端 UI 实现

## 审查概要
- 审查时间：2025-12-24 08:22
- 任务编号：T12
- 审查范围：前端 UI 实现（模板选择、任务运行、流式输出、步骤事件、引用证据展示）
- 审查结果：**有条件通过**（存在 1 个阻断性问题、3 个严重问题、5 个一般问题）

## 问题清单

### 🔴 阻断性问题（1）

1. **测试中存在大量 React act() 警告**
   - 位置：apps/web/src/app.e2e-ish.test.tsx（测试执行输出）
   - 原因：异步状态更新未正确包裹在 act() 中，导致测试不稳定
   - 影响：测试结果不可靠，可能掩盖真实的 UI 状态问题
   - 建议：
     - 将所有异步状态更新（fetch、setTimeout）包裹在 `act()` 中
     - 使用 `@testing-library/react` 的 `waitFor` 替代自定义 `waitFor`
     - 参考：https://react.dev/warnings/react-dom-test-utils

### 🟠 严重问题（3）

1. **缺少导出功能实现**
   - 位置：T12 任务要求包含导出功能，但当前代码中未实现
   - 原因：任务 Checklist 中明确要求"导出为 Markdown/Obsidian 友好格式"，但 App.tsx 中无导出相关代码
   - 影响：任务未完整交付，用户无法导出成果
   - 建议：
     - 实现导出按钮与导出逻辑（至少支持 Markdown 格式）
     - 导出内容应包含：正文、引用元数据、来源信息
     - 提供导出预览与下载/复制功能

2. **前端未对所有后端响应进行 Zod 校验**
   - 位置：apps/web/src/lib/api/graphql.ts、stream.ts、evidence.ts
   - 原因：虽然使用了 Zod schema 解析，但部分错误路径未覆盖（例如 GraphQL errors 数组的深度解析）
   - 影响：后端契约变更可能导致前端静默失败或类型不安全
   - 建议：
     - 在 `parseAppErrorResponse` 中对 GraphQL errors 数组的每个元素进行完整 schema 校验
     - 对所有 `safeParse` 失败的情况返回 `CONTRACT_VIOLATION` 错误
     - 补充契约测试覆盖（T17）

3. **键盘导航未完整实现**
   - 位置：apps/web/src/App.tsx
   - 原因：虽然支持 Ctrl+Enter 提交，但缺少其他关键键盘导航（模板选择、引用浏览、证据面板关闭）
   - 影响：不符合 R3 的可访问性要求（"键盘可完成核心流程"）
   - 建议：
     - 模板选择：支持 ↑↓ 键导航
     - 引用列表：支持 Tab/Shift+Tab 切换，Enter 打开证据
     - 证据面板：支持 Esc 关闭
     - 添加可见的焦点状态样式

### 🟡 一般问题（5）

1. **组件未拆分，单文件过长**
   - 位置：apps/web/src/App.tsx（876 行）
   - 原因：所有 UI 逻辑集中在一个组件中，违反单一职责原则
   - 影响：可维护性差，难以测试单个组件
   - 建议：
     - 拆分为独立组件：TemplatePicker、TaskRunner、StreamOutput、StepTimeline、CitationsList、EvidencePanel
     - 每个组件独立测试
     - 使用 Context 或 props 传递共享状态

2. **错误处理不一致**
   - 位置：apps/web/src/App.tsx（多处）
   - 原因：部分错误使用 `toErrorMessage(e)`，部分使用 `AppErrorSchema.parse`，缺少统一错误处理策略
   - 影响：错误展示不一致，用户体验差
   - 建议：
     - 统一使用 `tryParseAppError` 工具函数
     - 所有 catch 块都应返回结构化 AppError
     - 错误展示组件化（ErrorBlock）

3. **缺少 loading 状态的骨架屏**
   - 位置：apps/web/src/App.tsx
   - 原因：模板加载、任务运行时仅显示文本提示，缺少视觉反馈
   - 影响：不符合 R3 的"慢网下优先呈现骨架屏"要求
   - 建议：
     - 模板加载时显示骨架屏（Skeleton）
     - 任务运行时在输出区显示加载动画
     - 引用证据加载时显示 Spinner

4. **自动滚动逻辑可能导致性能问题**
   - 位置：apps/web/src/App.tsx:217-234
   - 原因：每次 `output` 或 `sortedEvents` 变化都触发 `useEffect`，频繁操作 DOM
   - 影响：在高频更新场景下可能卡顿
   - 建议：
     - 使用 `useCallback` + `requestAnimationFrame` 节流
     - 或使用 CSS `scroll-behavior: smooth` + `scrollIntoView`

5. **测试覆盖不足**
   - 位置：apps/web/src/app.test.tsx
   - 原因：仅有 1 个占位测试，未覆盖组件逻辑
   - 影响：无法保证组件行为正确性
   - 建议：
     - 补充单元测试：TemplatePicker、StreamOutput、StepTimeline、CitationsList、EvidencePanel
     - 补充集成测试：错误分支、边界条件（空数据、超长文本）
     - 补充可访问性测试：键盘导航、焦点管理

### 🟢 优化建议（3）

1. **响应式布局可优化**
   - 位置：apps/web/src/App.tsx:isNarrow 逻辑
   - 建议：使用 CSS Media Query 替代 JS 监听 resize，减少重渲染

2. **引用证据展示可增强**
   - 位置：apps/web/src/App.tsx:evidence 渲染
   - 建议：
     - 支持高亮 snippet 中的关键词
     - 支持复制 snippet 到剪贴板
     - 支持跳转到原文（如果有 URL）

3. **步骤事件可增加筛选功能**
   - 位置：apps/web/src/App.tsx:StepTimeline
   - 建议：
     - 支持按事件类型筛选（step_started/tool_called/step_completed）
     - 支持搜索事件内容
     - 支持复制单个事件的 JSON

## 审查维度详情

### A. 代码质量审查
- [x] TypeScript 严格性：通过（无 `any`，类型完整）
- [x] Zod 校验：部分通过（API 层使用 Zod，但错误路径覆盖不足）
- [x] 错误处理：部分通过（有错误处理，但不一致）
- [ ] 代码风格与可维护性：未通过（单文件过长，组件未拆分）
- [x] 安全性：通过（无明显安全漏洞）

### B. 契约一致性审查
- [x] Schema 定义：通过（所有契约有 Zod schema）
- [x] 输入契约：通过（API 调用前校验输入）
- [x] 输出契约：部分通过（使用 schema 解析，但错误路径覆盖不足）
- [x] 事件契约：通过（StepEvent 使用 schema 解析）
- [x] 错误契约：通过（AppError 使用 schema）

### C. 测试覆盖审查
- [x] 单元测试：未通过（仅占位测试）
- [x] 集成测试：部分通过（E2E 测试覆盖主流程，但有 act() 警告）
- [x] 契约测试：通过（stream/events/citation 有 schema 校验）
- [ ] E2E 测试：部分通过（覆盖主流程，但测试不稳定）

### D. 文档审查
- [x] 代码文档：通过（关键函数有注释）
- [x] 设计文档：通过（与 design-ui.md 一致）
- [ ] 用户文档：缺失（无 README 或使用说明）

### E. 可观测性审查
- [x] 日志：通过（requestId 贯穿）
- [x] Metrics：不适用（前端无 metrics）
- [x] 追踪：通过（requestId 传递到所有 API 调用）

### F. 性能与资源审查
- [x] 时间复杂度：通过（无明显性能瓶颈）
- [x] 空间复杂度：通过（无内存泄漏风险）
- [ ] 性能优化：可优化（自动滚动、响应式布局）

### G. 依赖与配置审查
- [x] 依赖必要性：通过（依赖合理）
- [x] 依赖版本：通过（版本锁定）
- [x] 依赖许可：通过（MIT/Apache 2.0）
- [x] 依赖维护性：通过（依赖活跃维护）

### H. 任务验收审查
- [ ] Checklist 完成：未完成（缺少导出功能）
- [x] 产出物齐全：部分齐全（缺少导出功能）
- [x] 验证通过：通过（build/typecheck/lint/test 通过）

## 验收建议

### 当前状态
- [ ] 可以标记任务完成
- [x] 需要修复阻断性问题后再验收
- [x] 需要补充严重问题的风险说明

### 修复优先级
1. 🔴 修复测试 act() 警告（阻断）
2. 🟠 实现导出功能（严重）
3. 🟠 补充键盘导航（严重）
4. 🟠 完善契约校验错误路径（严重）
5. 🟡 拆分组件（一般）
6. 🟡 统一错误处理（一般）
7. 🟡 补充单元测试（一般）

### 风险评估
- **高风险**：测试不稳定可能掩盖真实问题，导出功能缺失影响用户体验
- **中风险**：键盘导航不完整影响可访问性，组件未拆分影响可维护性
- **低风险**：性能优化、骨架屏、筛选功能为增强项

## 附录

### 检查清单
- [x] 代码质量审查（A）
- [x] 契约一致性审查（B）
- [x] 测试覆盖审查（C）
- [x] 文档审查（D）
- [x] 可观测性审查（E）
- [x] 性能与资源审查（F）
- [x] 依赖与配置审查（G）
- [x] 任务验收审查（H）

### 审查工具
- TypeScript Compiler: v5.7.2
- ESLint: 通过
- Test Runner: Vitest v2.1.9
- Coverage: 未测量（建议补充）

### 自动化验证结果
```bash
✅ npm run build -w @niche/web: 通过
✅ npm run typecheck -w @niche/web: 通过
✅ npm run lint -w @niche/web: 通过
⚠️  npm run test -w @niche/web: 通过（但有大量 act() 警告）

参考文档
AGENTS.md
specs/study-copilot/requirements.md (R3, R4, R5, R21)
specs/study-copilot/tasks.md (T12)
specs/study-copilot/design/design-ui.md
specs/study-copilot/design/design-frontend.md
specs/study-copilot/design/design-contracts.md
优点总结
✅ TypeScript Strict 严格遵守：无 any，类型完整
✅ 契约驱动开发：所有 API 调用使用 Zod schema 解析
✅ E2E 测试覆盖主流程：happy path、cancel、responsive 三个核心场景
✅ requestId 贯穿：所有 API 调用包含 requestId，便于追踪
✅ 响应式布局：支持 mobile/desktop 断点切换
✅ 流式输出增量渲染：正确消费 Vercel AI Data Stream Protocol
✅ 步骤事件归并排序：按 timestamp 排序，支持按 step 分组
✅ 引用证据展示：点击引用触发 Evidence API 并展示状态
改进建议总结
🔴 立即修复：测试 act() 警告、实现导出功能
🟠 尽快修复：键盘导航、契约校验错误路径、组件拆分
🟡 后续优化：骨架屏、性能优化、筛选功能、单元测试
结论
AI-DEV 完成了 T12 的核心功能实现，代码质量整体良好，TypeScript Strict 严格遵守，契约驱动开发落实到位。但存在以下关键问题：

阻断性问题：测试不稳定（act() 警告）必须修复
功能缺失：导出功能未实现，任务未完整交付
可访问性不足：键盘导航不完整
可维护性问题：组件未拆分，单文件过长