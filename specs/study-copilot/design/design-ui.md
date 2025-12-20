# Study Copilot - Design (UI)

## Summary
本文件描述 Study Copilot 的 UI 信息架构、关键交互与状态呈现，重点覆盖：模板选择、任务运行、流式输出、步骤事件、引用证据展示与导出。

## Requirements Mapping
- R3 UI 体验与导出
- R4 流式呈现（协议消费侧表现）
- R5 中间步骤事件流（呈现与筛选）
- R21 引用溯源与证据链（点击引用展示证据）

## Architecture / Components
- Template Picker
- Task Runner
- Step Timeline
- Citation Panel
- Export Panel

## Key Flows
### Flow: 选择模板并启动
- 展示模板列表、能力概览、说明
- 启动参数表单（最小必填）

### Flow: 运行中体验
- 运行中状态条：阶段/步骤、可取消入口
- 输出区：流式增量渲染，按阶段分段
- 步骤列表：可筛选/搜索/复制

### Flow: 点击引用展示证据
- 引用点击 -> 侧栏/弹层
- 显示：来源标识、定位信息、可复制摘录
- 若降级：展示降级原因与恢复建议

### Flow: 导出
- 导出预览
- 导出选项：Markdown/Obsidian 友好格式
- 导出后反馈路径/链接

## NFR
- 可访问性：键盘导航、焦点状态清晰。
- 阅读体验：长内容折叠/展开、排版。

## Observability
- UI 事件埋点：模板选择、启动、取消、引用点击、导出。

## Testing Strategy
- 交互回归：启动/取消/重试。
- 引用弹层：可用/降级两种路径。

## Open Questions
- 引用证据展示：默认展示 snippet 还是仅展示定位信息并按需拉取？
- step events 与 data stream 同通道时，UI 分段的规范字段是什么？
