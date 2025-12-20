# Study Copilot - Design (Frontend)

## Summary
本文件描述前端架构、数据流与对后端契约的消费方式，重点覆盖 GraphQL client、流式协议消费、step events 渲染映射与错误处理。

## Requirements Mapping
- R3 UI 体验支撑（前端实现侧）
- R4 流式响应消费
- R5 step events 消费与渲染
- R10 API 服务层（GraphQL 主干接口消费）
- R21 引用证据接口消费

## Architecture / Components
- GraphQL Client Layer
- Stream Consumer
- Events Normalizer
- Error Boundary & Retry

## Key Flows
### Flow: createTask -> subscribe/stream
- 调用 GraphQL `createTask` 获取 taskId
- 建立 stream（REST 或 subscription）
- 将 stream + events 归一化为 UI 可渲染模型

### Flow: cancel
- UI 发起取消
- 前端关闭连接并请求后端取消

## Interfaces
- 引用 `design-contracts.md`

## NFR
- 性能：首屏加载、长列表虚拟化（如需要）。
- 稳定性：断线重连策略（若需要）。

## Observability
- 关联 requestId（来自后端）用于定位问题。

## Testing Strategy
- stream/events 解析的契约测试。
- 错误块解析与 UI 提示。

## Open Questions
- 是否需要 GraphQL subscription 做 events 通道？
- stream 与 events 的合并策略：时间戳排序还是 stepId 归并？
