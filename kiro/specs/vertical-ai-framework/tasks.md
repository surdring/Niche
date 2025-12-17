# 实现计划

## Phase 1: 项目骨架搭建

- [ ] 1. 初始化项目结构和基础配置
  - [ ] 1.1 创建 monorepo 结构（packages/core, packages/cli, apps/api, apps/web）
    - 使用 pnpm workspace + Turborepo 管理（利用缓存加速构建）
    - 配置 TypeScript、ESLint、Prettier
    - 集成 t3-env 实现环境变量类型安全校验
    - _Requirements: 17.5_
  - [ ] 1.2 配置 Fastify 服务器骨架
    - 集成 fastify-type-provider-zod
    - 集成 fastify-swagger 自动文档生成
    - _Requirements: 16.1, 16.3_
  - [ ] 1.3 配置 Vercel AI SDK Core 集成
    - 安装 ai, @ai-sdk/openai, @ai-sdk/anthropic
    - 创建基础 streamText 示例验证集成
    - _Requirements: 2.1, 2.7_
  - [ ] 1.4 配置 OpenTelemetry 追踪基础设施
    - 集成 @opentelemetry/sdk-node
    - 配置 Fastify 请求追踪
    - _Requirements: 8.1, 8.3_
  - [ ] 1.5 编写项目初始化属性测试
    - **Property 5: Provider 接口统一性**
    - **Validates: Requirements 2.1, 2.7**

- [ ] 2. 实现中间件层
  - [ ] 2.1 实现 wrapLanguageModel 中间件模式
    - 支持 System Prompt 注入
    - 支持请求上下文传递
    - _Requirements: 23.1, 23.4_
  - [ ] 2.2 编写中间件属性测试
    - **Property 19: 中间件执行顺序**
    - **Validates: Requirements 23.1**
  - [ ] 2.3 实现 MockLanguageModel 测试支持
    - 支持预定义响应
    - 零 Token 消耗
    - _Requirements: 23.2_
  - [ ] 2.4 编写 Mock 模型属性测试
    - **Property 20: Mock 模型注入**
    - **Validates: Requirements 23.2**

- [ ] 3. 实现流式处理器
  - [ ] 3.1 实现 StreamHandler 核心类
    - 实现 toFastifyReply 方法（含正确 Header）
    - 实现 Error Chunk 发送
    - _Requirements: 9.1, 9.2, 9.4_
  - [ ] 3.2 编写流式协议属性测试
    - **Property 14: 流式协议合规性**
    - **Validates: Requirements 9.1**
  - [ ] 3.3 编写错误块属性测试
    - **Property 15: 流式错误块格式**
    - **Validates: Requirements 9.4**
  - [ ] 3.4 实现 Token 用量估算回退
    - 实现 UsageEstimator 类
    - 处理流式中断场景
    - _Requirements: 8.2_
  - [ ] 3.5 编写 Token 追踪属性测试
    - **Property 13: Token 用量追踪完整性**
    - **Validates: Requirements 8.2**

- [ ] 4. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 2: 核心引擎实现

- [ ] 5. 实现向量数据库适配器
  - [ ] 5.1 定义 IVectorStore 接口和统一过滤 DSL
    - 定义 IVectorFilter、IVectorFilterGroup 类型
    - 定义 IDocument、ISearchResult、ICitation 类型
    - _Requirements: 1.5_
  - [ ] 5.2 实现 Chroma 适配器
    - 实现 addDocuments、similaritySearch、deleteDocuments
    - 实现过滤 DSL 转译
    - _Requirements: 1.5, 1.6_
  - [ ] 5.3 实现 Pinecone 适配器
    - 实现相同接口方法
    - 实现 Pinecone 特定的过滤语法转译
    - _Requirements: 1.5, 1.6_
  - [ ] 5.4 编写向量库适配器属性测试
    - **Property 1: 向量库适配器接口一致性**
    - **Validates: Requirements 1.5, 1.6**

- [ ] 6. 实现文档处理管道
  - [ ] 6.1 实现文档加载器
    - 支持 PDF、Markdown、HTML、Word、Excel、纯文本
    - 统一输出格式
    - _Requirements: 1.2_
  - [ ] 6.2 实现分块器（Chunker）
    - 实现语义分块策略
    - 实现段落分块策略
    - 实现滑动窗口策略
    - 记录 startOffset、endOffset
    - _Requirements: 1.3_
  - [ ] 6.3 编写分块完整性属性测试
    - **Property 2: 文档分块完整性**
    - **Validates: Requirements 1.3, 1.4**
  - [ ] 6.4 实现数据清洗管道
    - 移除 HTML 标签、修复编码
    - 规范化空白字符
    - _Requirements: 5.1_
  - [ ] 6.5 编写数据清洗属性测试
    - **Property 8: 数据清洗幂等性**
    - **Validates: Requirements 5.1**
  - [ ] 6.6 实现 PII 脱敏处理
    - 检测姓名、电话、邮箱、身份证号
    - 替换为占位符
    - _Requirements: 5.2_
  - [ ] 6.7 编写 PII 脱敏属性测试
    - **Property 9: PII 脱敏完整性**
    - **Validates: Requirements 5.2**

- [ ] 7. 实现 RAG 管道
  - [ ] 7.1 实现 RAGPipeline 核心类
    - 实现 ingest 方法（文档摄入）
    - 实现 retrieve 方法（检索）
    - 实现 generate 方法（生成）
    - _Requirements: 1.1, 1.4_
  - [ ] 7.2 实现引用坐标追踪
    - 在检索结果中包含完整 ICitation
    - 支持前端高亮定位
    - _Requirements: 19.1, 19.2_
  - [ ] 7.3 编写检索溯源属性测试
    - **Property 3: 检索结果溯源完整性**
    - **Validates: Requirements 1.4, 19.1**
  - [ ] 7.4 实现 Reranker 组件
    - 支持可配置的重排序模型
    - _Requirements: 1.7_
  - [ ] 7.5 实现流式生成（streamGenerate）
    - 通过 Data Channel 发送引用
    - _Requirements: 9.1, 19.1_

- [ ] 8. 实现模型路由器
  - [ ] 8.1 实现 ModelRouter 核心类
    - 实现 route 方法
    - 实现 registerProvider 方法
    - 实现 setRoutingRules 方法
    - _Requirements: 2.1, 2.2_
  - [ ] 8.2 实现复杂度评估逻辑
    - 基于规则的评估
    - 支持分类器模型评估
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ] 8.3 编写路由规则属性测试
    - **Property 4: 模型路由规则确定性**
    - **Validates: Requirements 2.2, 2.3, 2.4**
  - [ ] 8.4 实现故障转移逻辑
    - 自动切换备用 Provider
    - 记录故障事件
    - _Requirements: 2.5, 14.1_

- [ ] 9. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 3: Agent 和结构化输出

- [ ] 10. 实现 Agent 引擎
  - [ ] 10.1 实现 AgentEngine 核心类
    - 实现 defineAgent 方法
    - 实现 execute 方法
    - 实现 streamExecute 方法
    - _Requirements: 3.1, 3.4, 3.5_
  - [ ] 10.2 实现 Zod 工具参数验证
    - 自动参数解析
    - 验证失败反馈给模型
    - _Requirements: 3.1, 3.2_
  - [ ] 10.3 编写工具参数验证属性测试
    - **Property 6: 工具参数 Zod 验证**
    - **Validates: Requirements 3.1, 3.2**
  - [ ] 10.4 实现 maxSteps 限制
    - 控制最大迭代次数
    - 优雅终止并返回部分结果
    - _Requirements: 3.3_
  - [ ] 10.5 编写步数限制属性测试
    - **Property 7: Agent 步数限制**
    - **Validates: Requirements 3.3**
  - [ ] 10.6 实现多 Agent 协作
    - Agent 间消息传递
    - 任务委托机制
    - _Requirements: 3.7_

- [ ] 11. 实现结构化输出
  - [ ] 11.1 实现 generateObject 封装
    - 强制 Zod Schema 验证
    - 类型安全返回
    - _Requirements: 22.1, 22.2_
  - [ ] 11.2 实现 streamObject 封装
    - 支持 Partial JSON Parsing
    - 增量推送已解析字段
    - _Requirements: 22.3_
  - [ ] 11.3 编写结构化输出属性测试
    - **Property 16: 结构化输出类型安全**
    - **Validates: Requirements 22.2, 22.4**
  - [ ] 11.4 实现自动修复重试
    - 格式错误触发重试
    - 配置最大重试次数
    - _Requirements: 22.5, 22.6_
  - [ ] 11.5 编写自动修复属性测试
    - **Property 17: 结构化输出自动修复**
    - **Validates: Requirements 22.5**

- [ ] 12. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 4: 安全与缓存

- [ ] 13. 实现安全护栏
  - [ ] 13.1 实现 Guardrails 核心类
    - 实现 checkInput 方法
    - 实现 checkOutput 方法
    - 实现 addRule 方法
    - _Requirements: 6.1, 6.2, 6.5_
  - [ ] 13.2 实现提示注入检测
    - 检测已知注入模式
    - 阻止恶意请求
    - _Requirements: 6.1, 6.6_
  - [ ] 13.3 编写注入检测属性测试
    - **Property 10: 护栏注入检测**
    - **Validates: Requirements 6.1**
  - [ ] 13.4 实现内容过滤规则
    - 关键词过滤
    - 话题过滤
    - _Requirements: 6.2, 6.5_
  - [ ] 13.5 实现降级响应
    - 返回安全的降级消息
    - 记录护栏事件
    - _Requirements: 6.3, 6.4_

- [ ] 14. 实现缓存系统
  - [ ] 14.1 实现 CacheSystem 核心类
    - 实现 get、set 方法
    - 实现 invalidateByTag 方法
    - _Requirements: 7.1, 7.2, 7.7_
  - [ ] 14.2 实现 Redis 缓存适配器
    - 支持 TTL 配置
    - 支持 LRU 淘汰
    - _Requirements: 7.2, 7.3, 7.5_
  - [ ] 14.3 编写缓存命中属性测试
    - **Property 11: 缓存命中一致性**
    - **Validates: Requirements 7.1**
  - [ ] 14.4 实现语义相似缓存
    - 基于嵌入向量相似度匹配
    - 可配置相似度阈值
    - _Requirements: 7.4_
  - [ ] 14.5 编写语义缓存属性测试
    - **Property 12: 语义缓存相似性**
    - **Validates: Requirements 7.4**

- [ ] 15. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 5: 租户与可观测性

- [ ] 16. 实现租户管理
  - [ ] 16.1 配置 Prisma 数据库 Schema
    - 创建 Tenant、ApiKey、Document、Chunk、UsageRecord 模型
    - 配置索引和关系
    - _Requirements: 21.1_
  - [ ] 16.2 实现 TenantManager 核心类
    - 实现 createTenant 方法
    - 实现 checkQuota 方法
    - 实现 getUsageStats 方法
    - _Requirements: 21.1, 21.2, 21.6_
  - [ ] 16.3 实现配额检查和执行
    - Token 预算上限检查
    - 超限时限流或阻断
    - _Requirements: 21.3, 21.4_
  - [ ] 16.4 编写配额执行属性测试
    - **Property 18: 租户配额执行**
    - **Validates: Requirements 21.4**
  - [ ] 16.5 实现 API Key 管理
    - Key 生成和哈希存储
    - 权限和配额配置
    - _Requirements: 21.5_

- [ ] 17. 实现可观测性系统
  - [ ] 17.1 实现 Observability 核心类
    - 实现 startTrace 方法
    - 实现 recordMetric 方法
    - 实现 recordUsage 方法
    - _Requirements: 8.1, 8.4, 8.5_
  - [ ] 17.2 集成 onFinish 回调
    - 从 usage 对象读取 Token 用量
    - 异步写入 OpenTelemetry
    - _Requirements: 8.1, 8.2_
  - [ ] 17.3 实现成本分析报表
    - 按模型、用户、功能维度统计
    - _Requirements: 8.5_
  - [ ] 17.4 实现告警触发
    - 延迟飙升告警
    - 错误率上升告警
    - _Requirements: 8.3_

- [ ] 18. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 6: API 层实现

- [ ] 19. 实现 API 路由
  - [ ] 19.1 实现 /api/chat 端点
    - 支持流式和非流式响应
    - 集成认证和限流中间件
    - _Requirements: 16.1, 16.2_
  - [ ] 19.2 实现 /api/rag 端点
    - 支持检索和生成
    - 返回引用坐标
    - _Requirements: 1.4, 19.1_
  - [ ] 19.3 实现 /api/documents 端点
    - 文档上传和摄入
    - 文档查询和删除
    - _Requirements: 1.2, 5.3_
  - [ ] 19.4 实现 /api/agents 端点
    - Agent 任务执行
    - 流式事件推送
    - _Requirements: 3.4, 3.5_
  - [ ] 19.5 实现 /api/admin 端点
    - 租户管理
    - 用量统计
    - _Requirements: 21.6_

- [ ] 20. 实现认证和限流
  - [ ] 20.1 实现 API Key 认证中间件
    - Key 验证和权限检查
    - _Requirements: 16.4_
  - [ ] 20.2 实现限流中间件
    - 按用户、IP、API Key 维度限流
    - _Requirements: 14.3, 14.4_
  - [ ] 20.3 实现 JWT 认证支持
    - Token 验证
    - _Requirements: 16.4_

- [ ] 21. 实现 WebSocket 支持
  - [ ] 21.1 配置 Fastify WebSocket 插件
    - 支持实时双向通信
    - _Requirements: 16.5_
  - [ ] 21.2 实现 WebSocket 消息处理
    - 流式响应推送
    - 连接状态管理
    - _Requirements: 9.5, 16.5_

- [ ] 22. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 7: 前端实现

- [ ] 23. 初始化前端项目
  - [ ] 23.1 创建 React + Vite 项目
    - 配置 TypeScript
    - 配置 Tailwind CSS
    - _Requirements: 前端架构_
  - [ ] 23.2 安装和配置 Shadcn/ui
    - 初始化组件库
    - 配置主题和颜色
    - _Requirements: UI设计系统_
  - [ ] 23.3 配置 Zustand 状态管理
    - 创建 ConversationStore
    - 创建 DocumentStore
    - 创建 UIStore
    - _Requirements: 前端架构_

- [ ] 24. 实现聊天界面
  - [ ] 24.1 实现 ChatInterface 组件
    - 消息列表渲染
    - 输入区域
    - _Requirements: 前端架构_
  - [ ] 24.2 实现 useChat Hook 扩展
    - 集成 Vercel AI SDK useChat
    - 扩展引用和反馈支持
    - _Requirements: 10.1, 19.1_
  - [ ] 24.3 实现流式文本渲染
    - 打字机效果
    - 光标动画
    - _Requirements: 9.1, 9.6_
  - [ ] 24.4 编写流式渲染属性测试
    - **Property 21: 流式文本渲染一致性**
    - **Validates: Requirements 9.1, 9.6**
  - [ ] 24.5 实现工具调用状态指示
    - 思考中、调用中、完成状态
    - Framer Motion 动画
    - _Requirements: 3.4_

- [ ] 25. 实现文档查看器
  - [ ] 25.1 实现 DocumentViewer 组件
    - 文档内容渲染
    - 高亮支持
    - _Requirements: 19.2, 19.3_
  - [ ] 25.2 实现引用高亮功能
    - 根据坐标高亮文本
    - 点击跳转
    - _Requirements: 19.1, 19.2_
  - [ ] 25.3 编写引用高亮属性测试
    - **Property 22: 引用高亮准确性**
    - **Validates: Requirements 19.1, 19.2**
  - [ ] 25.4 实现划词操作
    - 文本选择检测
    - 操作弹窗
    - _Requirements: 19.4_
  - [ ] 25.5 编写划词操作属性测试
    - **Property 23: 划词操作响应性**
    - **Validates: Requirements 19.4**

- [ ] 26. 实现引用面板
  - [ ] 26.1 实现 CitationPanel 组件
    - 引用列表展示
    - Glassmorphism 卡片样式
    - _Requirements: 19.1_
  - [ ] 26.2 实现引用与文档联动
    - 点击引用高亮原文
    - _Requirements: 19.2, 19.3_

- [ ] 27. 实现反馈系统
  - [ ] 27.1 实现 FeedbackButton 组件
    - 点赞/点踩按钮
    - 反馈提交
    - _Requirements: 10.1_
  - [ ] 27.2 实现反馈后续问卷
    - 负面反馈原因收集
    - _Requirements: 10.4_
  - [ ] 27.3 编写反馈完整性属性测试
    - **Property 24: 反馈数据完整性**
    - **Validates: Requirements 10.1, 10.2**

- [ ] 28. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 8: 评估与工具

- [ ] 29. 实现评估框架
  - [ ] 29.1 实现 EvalFramework 核心类
    - 数据集管理
    - 评估运行
    - _Requirements: 4.1, 4.2_
  - [ ] 29.2 实现多维度评估
    - 准确性评估
    - 完整性评估
    - 格式合规性评估
    - 安全性评估
    - _Requirements: 4.2_
  - [ ] 29.3 实现 LLM-as-a-Judge 模式
    - 使用强模型评估弱模型输出
    - _Requirements: 4.5_
  - [ ] 29.4 实现评估报告生成
    - JSON、CSV、HTML 格式导出
    - 基线对比
    - _Requirements: 4.3, 4.6_

- [ ] 30. 实现合成数据生成
  - [ ] 30.1 实现 SyntheticDataGenerator 类
    - 基于文档生成 QA 对
    - 支持问题类型配置
    - _Requirements: 20.1, 20.2_
  - [ ] 30.2 实现数据增强
    - 问题变体生成
    - 同义替换
    - _Requirements: 20.4_
  - [ ] 30.3 实现数据导出
    - 评估框架格式
    - 微调 JSONL 格式
    - _Requirements: 20.3, 20.6_

- [ ] 31. 实现提示词管理
  - [ ] 31.1 实现 PromptManager 核心类
    - 模板变量支持
    - 条件逻辑支持
    - _Requirements: 11.1_
  - [ ] 31.2 实现版本管理
    - 自动版本化
    - 历史记录
    - _Requirements: 11.2_
  - [ ] 31.3 实现 A/B 测试支持
    - 流量分配
    - 效果对比
    - _Requirements: 11.3_
  - [ ] 31.4 实现动态 Few-shot 选择
    - 基于相似度选择示例
    - _Requirements: 11.4_

- [ ] 32. 实现 CLI 工具
  - [ ] 32.1 实现 init 命令
    - 项目脚手架生成
    - _Requirements: 18.1_
  - [ ] 32.2 实现 eval 命令
    - 运行评估并输出报告
    - _Requirements: 18.2_
  - [ ] 32.3 实现 ingest 命令
    - 文档导入
    - _Requirements: 18.4_
  - [ ] 32.4 实现 serve 命令
    - 启动 API 服务
    - 健康检查
    - _Requirements: 18.5_

- [ ] 33. Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Phase 9: 集成与文档

- [ ] 34. 实现配置管理
  - [ ] 34.1 实现 ConfigManager 核心类
    - 多源配置加载（环境变量、文件、远程）
    - _Requirements: 17.1_
  - [ ] 34.2 实现配置验证
    - Zod Schema 验证
    - 必填项检查
    - _Requirements: 17.4_
  - [ ] 34.3 实现热更新支持
    - 配置变更监听
    - 无需重启更新
    - _Requirements: 17.3_
  - [ ] 34.4 实现环境隔离
    - 开发、测试、生产配置分离
    - _Requirements: 17.5_

- [ ] 35. 实现插件系统
  - [ ] 35.1 定义插件接口
    - 生命周期钩子
    - 配置管理
    - _Requirements: 15.1, 15.3_
  - [ ] 35.2 实现插件注册和执行
    - 按顺序调用插件
    - 错误隔离
    - _Requirements: 15.2, 15.4_
  - [ ] 35.3 实现运行时启用/禁用
    - 动态插件管理
    - _Requirements: 15.5_

- [ ] 36. 编写文档
  - [ ] 36.1 编写 API 文档
    - 自动生成 OpenAPI 文档
    - 使用示例
    - _Requirements: 16.3_
  - [ ] 36.2 编写快速开始指南
    - 安装和配置
    - 基础使用
  - [ ] 36.3 编写架构文档
    - 组件说明
    - 扩展指南

- [ ] 37. 配置 Docker 开发环境
  - [ ] 37.1 编写 docker-compose.yml
    - Redis 服务
    - Chroma 服务
    - PostgreSQL 服务
  - [ ] 37.2 编写 Dockerfile
    - 多阶段构建
    - 生产优化

- [ ] 38. Final Checkpoint - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.
