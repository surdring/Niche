# 需求文档

## 简介

本框架是一个基于 **Vercel AI SDK Core** 构建的轻量级垂直领域 AI 引擎。它拒绝过度抽象，利用 **TypeScript** 强类型特性和 **Fastify** 的高性能 I/O，实现对大模型交互的精确控制。

核心设计理念：**统一的 Provider 接口 + Zod 严格结构化输出 + 标准化流式传输协议**。

框架提供从RAG管道、多模型路由、Agent工作流、评估体系、数据处理、安全护栏到LLMOps运维的完整能力，帮助开发者快速构建高质量的垂直AI产品。

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js
- **核心SDK**: Vercel AI SDK Core
- **API框架**: Fastify
- **向量数据库**: Chroma（开发）/ Pinecone（生产）
- **缓存**: Redis
- **监控**: OpenTelemetry + Prometheus
- **Schema验证**: Zod

## 术语表

- **RAG (Retrieval-Augmented Generation)**: 检索增强生成，通过外挂知识库为大模型提供上下文信息
- **Embedding**: 将文本转换为向量表示的过程，用于语义检索
- **Chunking**: 将长文档切分成小块以便存入向量数据库的过程
- **Model Router**: 模型路由器，根据请求复杂度自动选择合适的模型
- **Agent**: 具备规划、工具调用、自我反思能力的AI代理
- **Guardrails**: 安全护栏，用于过滤不当输入输出和防止Prompt注入
- **Eval Dataset**: 评估数据集，用于衡量AI系统输出质量的标准测试集
- **PII**: 个人身份信息，需要在数据处理中脱敏
- **LLMOps**: 大语言模型运维，包括监控、缓存、降级等生产环境管理
- **Few-shot**: 少样本学习，在提示词中提供示例来引导模型输出
- **CoT (Chain-of-Thought)**: 思维链，让模型逐步推理的提示技术

## 需求

### 需求 1

**用户故事:** 作为开发者，我希望快速搭建RAG管道，以便构建知识增强的AI应用而无需从零开始。

#### 验收标准

1. WHEN 开发者初始化框架 THEN 框架 SHALL 创建包含文档加载器、分块器、嵌入器和检索器的可配置RAG管道
2. WHEN 开发者提供文档 THEN 框架 SHALL 支持PDF、Markdown、HTML、Word、Excel和纯文本等多种文件格式
3. WHEN 框架对文档分块 THEN 框架 SHALL 支持语义分块、段落分块、滑动窗口和父子文档索引等可配置策略
4. WHEN 框架检索上下文 THEN 框架 SHALL 返回相关文档块及其来源归属以支持溯源
5. WHEN 开发者配置向量数据库 THEN 框架 SHALL 定义标准的 `IVectorStore` 接口（包含 `addDocuments`、`similaritySearch` 方法），业务层只调用接口不依赖具体库SDK
6. WHEN 切换向量数据库实现 THEN 框架 SHALL 通过向量库适配器模式（Vector Store Adapter Pattern）支持Pinecone、Milvus、Weaviate、Chroma等主流向量数据库的无缝切换
7. WHEN 检索结果需要重排序 THEN 框架 SHALL 提供可配置的Reranker组件以提升检索精度

### 需求 2

**用户故事:** 作为开发者，我希望拥有基于统一Provider接口的多模型路由系统，以便根据查询复杂度优化成本和性能。

#### 验收标准

1. WHEN 开发者切换模型提供商（如从OpenAI切至Anthropic） THEN 代码逻辑无需修改，系统 SHALL 使用SDK的统一 `LanguageModel` 接口进行适配
2. WHEN 收到查询请求 THEN 模型路由器 SHALL 使用可配置规则或分类器模型评估查询复杂度
3. WHEN 检测到简单查询 THEN 模型路由器 SHALL 路由到经济型模型（如GPT-4o-mini、Claude Haiku）
4. WHEN 检测到复杂查询 THEN 模型路由器 SHALL 路由到高能力模型（如GPT-4o、Claude Sonnet）
5. WHEN 需要自定义模型参数 THEN 系统 SHALL 支持通过SDK的 `providerOptions` 传递特定厂商参数（如top_k、seed）
6. WHEN 模型提供商故障 THEN 模型路由器 SHALL 自动故障转移到备用提供商
7. WHEN 路由逻辑执行时 THEN 系统 SHALL 利用SDK的 `generateText` 或 `streamText` 统一方法调用，屏蔽底层API差异
8. WHEN 模型调用发生 THEN 模型路由器 SHALL 记录每次调用的成本和延迟指标

### 需求 3

**用户故事:** 作为开发者，我希望拥有基于SDK Tool Calling与Core Message Protocol的Agent工作流引擎，以便构建具备规划、工具调用和自我反思能力的AI代理。

#### 验收标准

1. WHEN 定义工具（Tools） THEN 开发者 SHALL 使用 **Zod Schema** 定义工具参数，并直接注册到SDK的 `tools` 配置中
2. WHEN 模型决定调用工具 THEN 系统 SHALL 利用SDK的自动参数解析能力，验证参数符合Zod定义，若失败则自动反馈错误给模型进行自我修正
3. WHEN 执行多步推理（Multi-step） THEN 系统 SHALL 使用 `maxSteps` 参数控制最大迭代次数，防止无限循环
4. WHEN 管理对话历史 THEN 系统 SHALL 严格遵守SDK的 `CoreMessage` 类型标准（User/Assistant/System/Tool），确保上下文序列化的高效性
5. WHEN Agent执行多步骤任务 THEN Agent引擎 SHALL 维护执行状态和上下文记忆
6. WHEN Agent遇到错误 THEN Agent引擎 SHALL 支持重试和回退策略
7. WHEN 开发者需要多Agent协作 THEN 框架 SHALL 支持Agent之间的消息传递和任务委托

### 需求 4

**用户故事:** 作为开发者，我希望拥有完整的评估框架，以便系统化地衡量和追踪AI系统的输出质量。

#### 验收标准

1. WHEN 开发者创建评估数据集 THEN 评估框架 SHALL 支持包含输入、上下文、期望输出和标签的结构化测试用例
2. WHEN 开发者运行评估 THEN 评估框架 SHALL 测量准确性、完整性、格式合规性和安全性维度
3. WHEN 评估完成 THEN 评估框架 SHALL 生成与基线指标对比的报告
4. WHEN 开发者修改提示词 THEN 评估框架 SHALL 支持修改前后对比以检测回归
5. WHEN 需要自动评估 THEN 评估框架 SHALL 支持LLM-as-a-Judge模式用强模型评估弱模型输出
6. WHEN 评估结果生成 THEN 评估框架 SHALL 支持导出为JSON、CSV和HTML报告格式
7. WHEN 开发者需要持续评估 THEN 评估框架 SHALL 支持集成到CI/CD流水线

### 需求 5

**用户故事:** 作为开发者，我希望拥有完整的数据处理管道，以便清洗、转换和准备领域特定数据。

#### 验收标准

1. WHEN 原始文档被摄入 THEN 数据管道 SHALL 清洗内容，移除HTML标签、修复编码问题、规范化空白字符
2. WHEN 文档包含PII THEN 数据管道 SHALL 检测并替换敏感信息为占位符
3. WHEN 文档被处理 THEN 数据管道 SHALL 输出适合向量数据库摄入的结构化记录
4. WHEN 处理某文档失败 THEN 数据管道 SHALL 记录错误并继续处理剩余文档
5. WHEN 处理PDF文档 THEN 数据管道 SHALL 正确处理表格、页眉页脚和多栏布局
6. WHEN 需要OCR THEN 数据管道 SHALL 支持图片和扫描PDF的文字识别
7. WHEN 数据需要增强 THEN 数据管道 SHALL 支持元数据提取和自动标签生成

### 需求 6

**用户故事:** 作为开发者，我希望拥有内置的安全护栏，以便保护应用免受提示注入和不当输出的影响。

#### 验收标准

1. WHEN 收到用户输入 THEN 护栏 SHALL 扫描提示注入模式并阻止恶意请求
2. WHEN 模型生成输出 THEN 护栏 SHALL 基于可配置规则过滤内容（关键词、话题、情感）
3. WHEN 请求被阻止 THEN 护栏 SHALL 返回安全的降级响应并说明限制原因
4. WHEN 护栏事件发生 THEN 护栏 SHALL 记录事件以供安全审查
5. WHEN 配置内容策略 THEN 护栏 SHALL 支持自定义禁止话题和敏感词列表
6. WHEN 检测到越狱尝试 THEN 护栏 SHALL 立即终止请求并记录告警
7. WHEN 输出包含幻觉风险 THEN 护栏 SHALL 标记低置信度内容并建议人工复核

### 需求 7

**用户故事:** 作为开发者，我希望拥有响应缓存能力，以便降低重复查询的成本和延迟。

#### 验收标准

1. WHEN 查询匹配缓存响应 THEN 缓存系统 SHALL 返回缓存结果而不调用模型
2. WHEN 生成新响应 THEN 缓存系统 SHALL 以可配置TTL存储响应
3. WHEN 缓存存储超限 THEN 缓存系统 SHALL 使用LRU策略淘汰条目
4. WHEN 启用语义相似缓存 THEN 缓存系统 SHALL 通过嵌入相似度而非精确匹配来匹配查询
5. WHEN 配置缓存后端 THEN 缓存系统 SHALL 支持Redis、内存和磁盘等多种存储
6. WHEN 缓存命中 THEN 缓存系统 SHALL 在响应中标记缓存来源以便调试
7. WHEN 需要缓存失效 THEN 缓存系统 SHALL 支持按标签或模式批量清除缓存

### 需求 8

**用户故事:** 作为开发者，我希望拥有基于SDK Callbacks的无侵入式可观测性和监控工具，以便追踪系统健康、调试问题和优化性能。

#### 验收标准

1. WHEN 模型调用结束 THEN 系统 SHALL 触发SDK的 `onFinish` 回调钩子
2. WHEN 捕获Token用量 THEN 系统 SHALL 从 `onFinish` 的 `usage` 对象中直接读取 `promptTokens` 和 `completionTokens`，并异步写入OpenTelemetry
3. WHEN 记录完整链路 THEN 系统 SHALL 将SDK生成的 `telemetry` 数据与Fastify的Request ID关联
4. WHEN 请求被处理 THEN 可观测性系统 SHALL 追踪完整请求生命周期（输入、检索、提示词、输出）
5. WHEN 收集指标 THEN 可观测性系统 SHALL 追踪延迟、Token用量、错误率和缓存命中率
6. WHEN 检测到异常 THEN 可观测性系统 SHALL 触发可配置告警（延迟飙升、错误率上升）
7. WHEN 开发者查询日志 THEN 可观测性系统 SHALL 支持按请求ID、时间戳和自定义标签过滤
8. WHEN 需要成本分析 THEN 可观测性系统 SHALL 提供按模型、用户、功能维度的成本报表
9. WHEN 集成外部系统 THEN 可观测性系统 SHALL 支持导出到Prometheus、Grafana、LangSmith等

### 需求 9

**用户故事:** 作为开发者，我希望拥有基于AI Stream Protocol的标准化流式响应支持，以便通过渐进式输出提供更好的用户体验。

#### 验收标准

1. WHEN 建立流式连接 THEN 系统 SHALL 输出符合 **Vercel AI Data Stream Protocol** 标准的格式（包含文本块、工具调用块、元数据块）
2. WHEN 集成Fastify THEN 系统 SHALL 利用Fastify的原生Stream支持，将SDK的 `toDataStreamResponse()` 直接pipe到HTTP响应中，零内存拷贝
3. WHEN 流式传输响应 THEN 框架 SHALL 追踪首Token延迟(TTFT)作为关键指标
4. WHEN 流式传输中遇到错误 THEN 框架 SHALL 发送特定格式的错误块（Error Chunk，如 `e:{"error": "..."}`），以便前端SDK捕获并切换UI状态
5. WHEN 客户端在流式传输中断开 THEN 框架 SHALL 取消底层模型请求以节省成本
6. WHEN 需要前端渲染 THEN 流式响应 SHALL 包含结构化标记，以便前端能区分"正在思考"、"工具执行中"和"最终回答"
7. WHEN 流式输出完成 THEN 框架 SHALL 提供完整响应的回调钩子

### 需求 10

**用户故事:** 作为开发者，我希望拥有反馈收集机制，以便收集用户信号来持续改进AI系统。

#### 验收标准

1. WHEN 响应被传递 THEN 反馈系统 SHALL 提供捕获用户评分（点赞/点踩）的钩子
2. WHEN 收集反馈 THEN 反馈系统 SHALL 将其与关联的查询、上下文和响应一起存储
3. WHEN 收到正面反馈 THEN 反馈系统 SHALL 将示例标记为Few-shot提示词候选
4. WHEN 收到负面反馈 THEN 反馈系统 SHALL 将示例标记为待审查和针对性优化
5. WHEN 需要分析反馈 THEN 反馈系统 SHALL 提供反馈趋势和问题分类报表
6. WHEN 反馈数据积累 THEN 反馈系统 SHALL 支持导出用于模型微调的数据集

### 需求 11

**用户故事:** 作为开发者，我希望拥有提示词管理系统，以便版本化、测试和优化提示词模板。

#### 验收标准

1. WHEN 开发者创建提示词 THEN 提示词管理器 SHALL 支持模板变量和条件逻辑
2. WHEN 提示词被修改 THEN 提示词管理器 SHALL 自动版本化并保留历史记录
3. WHEN 需要A/B测试 THEN 提示词管理器 SHALL 支持多版本提示词的流量分配
4. WHEN 提示词包含Few-shot示例 THEN 提示词管理器 SHALL 支持动态示例选择
5. WHEN 需要提示词优化 THEN 提示词管理器 SHALL 集成评估框架自动对比效果
6. WHEN 部署提示词 THEN 提示词管理器 SHALL 支持热更新无需重启服务

### 需求 12

**用户故事:** 作为开发者，我希望拥有多模态支持，以便处理图片、音频等非文本数据。

#### 验收标准

1. WHEN 输入包含图片 THEN 框架 SHALL 支持视觉模型处理图片内容
2. WHEN 输入包含音频 THEN 框架 SHALL 支持语音转文字处理
3. WHEN 需要图片生成 THEN 框架 SHALL 集成图像生成模型API
4. WHEN 处理多模态文档 THEN 框架 SHALL 提取并关联文本和图片内容
5. WHEN 配置多模态模型 THEN 框架 SHALL 支持GPT-4V、Claude Vision等视觉模型

### 需求 13

**用户故事:** 作为开发者，我希望拥有会话管理能力，以便维护多轮对话的上下文和状态。

#### 验收标准

1. WHEN 用户开始对话 THEN 会话管理器 SHALL 创建唯一会话ID并初始化上下文
2. WHEN 对话继续 THEN 会话管理器 SHALL 维护对话历史并提供给模型
3. WHEN 对话历史过长 THEN 会话管理器 SHALL 执行上下文压缩或摘要
4. WHEN 会话超时 THEN 会话管理器 SHALL 自动清理并释放资源
5. WHEN 需要持久化会话 THEN 会话管理器 SHALL 支持将会话存储到数据库
6. WHEN 用户恢复会话 THEN 会话管理器 SHALL 加载历史上下文继续对话

### 需求 14

**用户故事:** 作为开发者，我希望拥有灾备和降级策略，以便在故障时保持服务可用性。

#### 验收标准

1. WHEN 主模型提供商故障 THEN 框架 SHALL 自动切换到备用提供商
2. WHEN 模型响应超时 THEN 框架 SHALL 返回友好的降级消息而非错误
3. WHEN 检测到服务过载 THEN 框架 SHALL 启用限流保护
4. WHEN 配置限流规则 THEN 框架 SHALL 支持按用户、IP、API Key维度限流
5. WHEN 服务恢复正常 THEN 框架 SHALL 自动切回主服务并记录事件
6. WHEN 需要熔断保护 THEN 框架 SHALL 在连续失败后暂停对故障服务的调用

### 需求 15

**用户故事:** 作为开发者，我希望框架提供插件化架构，以便扩展自定义功能而不修改核心代码。

#### 验收标准

1. WHEN 开发者创建插件 THEN 框架 SHALL 提供标准化的插件接口和生命周期钩子
2. WHEN 插件被注册 THEN 框架 SHALL 在适当的生命周期阶段调用插件
3. WHEN 插件需要配置 THEN 框架 SHALL 支持插件级别的配置管理
4. WHEN 插件发生错误 THEN 框架 SHALL 隔离错误不影响核心功能
5. WHEN 需要禁用插件 THEN 框架 SHALL 支持运行时启用/禁用插件
6. WHEN 开发者分享插件 THEN 框架 SHALL 支持插件的打包和分发

### 需求 16

**用户故事:** 作为开发者，我希望框架提供API服务层，以便快速暴露AI能力为RESTful或GraphQL接口。

#### 验收标准

1. WHEN 开发者配置API THEN 框架 SHALL 自动生成RESTful端点
2. WHEN API被调用 THEN 框架 SHALL 执行认证、限流和日志记录
3. WHEN 需要API文档 THEN 框架 SHALL 使用 `fastify-type-provider-zod` 配合 `fastify-swagger` 自动从Zod Schema生成OpenAPI文档，实现"代码即文档"
4. WHEN 配置认证方式 THEN 框架 SHALL 支持API Key、JWT和OAuth2.0
5. WHEN 需要WebSocket THEN 框架 SHALL 支持实时双向通信
6. WHEN API版本迭代 THEN 框架 SHALL 支持多版本API共存

### 需求 17

**用户故事:** 作为开发者，我希望框架提供配置管理系统，以便集中管理和动态更新配置。

#### 验收标准

1. WHEN 框架启动 THEN 配置系统 SHALL 从环境变量、配置文件和远程配置中心加载配置
2. WHEN 配置包含敏感信息 THEN 配置系统 SHALL 支持加密存储和安全访问
3. WHEN 配置被修改 THEN 配置系统 SHALL 支持热更新无需重启
4. WHEN 配置缺失必填项 THEN 配置系统 SHALL 在启动时报错并提供明确提示
5. WHEN 需要环境隔离 THEN 配置系统 SHALL 支持开发、测试、生产环境配置分离
6. WHEN 配置变更 THEN 配置系统 SHALL 记录变更历史以便审计

### 需求 18

**用户故事:** 作为开发者，我希望框架提供完整的CLI工具，以便通过命令行管理和调试框架。

#### 验收标准

1. WHEN 开发者初始化项目 THEN CLI SHALL 提供脚手架命令生成项目结构
2. WHEN 开发者运行评估 THEN CLI SHALL 提供命令执行评估并输出报告
3. WHEN 开发者调试提示词 THEN CLI SHALL 提供交互式提示词测试环境
4. WHEN 开发者管理数据 THEN CLI SHALL 提供数据导入、导出和清理命令
5. WHEN 开发者部署服务 THEN CLI SHALL 提供健康检查和状态查询命令
6. WHEN CLI执行命令 THEN CLI SHALL 提供详细的进度和错误信息

### 需求 19

**用户故事:** 作为开发者，我希望API响应包含精确的引用溯源信息，以便前端实现"点击引用高亮原文"的交互体验。

#### 验收标准

1. WHEN RAG检索返回结果 THEN 框架 SHALL 在响应中包含引用坐标（文档ID、段落索引、字符偏移量）
2. WHEN 模型生成包含引用的回答 THEN 框架 SHALL 将引用标记与源文档坐标关联
3. WHEN 前端请求原文高亮 THEN 框架 SHALL 提供API返回指定坐标范围的原文内容
4. WHEN 用户划词选中文本 THEN 框架 SHALL 提供预处理接口支持对选中文本执行特定AI技能（解释、翻译、改写）
5. WHEN 引用来源不可用 THEN 框架 SHALL 在响应中标记引用状态为"不可验证"

### 需求 20

**用户故事:** 作为开发者，我希望框架能自动生成合成数据，以便在冷启动阶段快速构建评估集和训练数据。

#### 验收标准

1. WHEN 开发者提供原始文档 THEN 合成数据生成器 SHALL 使用强模型自动生成问答对（QA Pairs）
2. WHEN 生成问答对 THEN 合成数据生成器 SHALL 支持配置问题类型（事实型、推理型、对比型）
3. WHEN 生成完成 THEN 合成数据生成器 SHALL 输出符合评估框架格式的数据集
4. WHEN 需要数据增强 THEN 合成数据生成器 SHALL 支持对现有问题生成变体（改写、同义替换）
5. WHEN 生成数据需要质量控制 THEN 合成数据生成器 SHALL 支持人工审核和标注流程
6. WHEN 导出训练数据 THEN 合成数据生成器 SHALL 支持输出为微调所需的JSONL格式

### 需求 21

**用户故事:** 作为开发者，我希望框架支持多租户和配额管理，以便实现SaaS订阅制和基于用量的商业模式。

#### 验收标准

1. WHEN 创建租户 THEN 租户管理系统 SHALL 为每个租户分配独立的资源隔离空间
2. WHEN 配置租户配额 THEN 租户管理系统 SHALL 支持设置Token预算上限（Budget Cap）
3. WHEN 租户用量接近上限 THEN 租户管理系统 SHALL 发送预警通知
4. WHEN 租户超出配额 THEN 租户管理系统 SHALL 根据策略执行限流或阻断
5. WHEN 管理API Key THEN 租户管理系统 SHALL 支持按Key设置独立的调用次数配额
6. WHEN 需要计费报表 THEN 租户管理系统 SHALL 提供按租户、时间段的用量和成本统计
7. WHEN 配置订阅计划 THEN 租户管理系统 SHALL 支持定义不同等级的功能和配额限制

### 需求 22

**用户故事:** 作为开发者，我希望框架基于Zod强制模型输出符合预定义的结构化格式，以便输出可靠地进入后续工作流。

#### 验收标准

1. WHEN 场景需要JSON输出（如数据提取、表单填充） THEN 系统 SHALL 使用SDK的 `streamObject` 或 `generateObject` 方法
2. WHEN 定义输出结构 THEN 开发者 SHALL 必须提供 **Zod Schema**
3. WHEN 模型处于流式生成过程中 THEN 系统 SHALL 支持 **Partial JSON Parsing**（增量解析），即在JSON未闭合时也能向前端推送已解析的字段
4. WHEN 模型生成的数据类型不匹配（如String给了Int） THEN 系统 SHALL 抛出类型验证错误，不予返回脏数据
5. WHEN 输出格式不符合Schema THEN 框架 SHALL 自动触发修复重试（Self-correction）
6. WHEN 修复重试失败 THEN 框架 SHALL 返回结构化错误信息说明违规字段
7. WHEN 配置重试策略 THEN 框架 SHALL 支持设置最大重试次数和回退模型

### 需求 23

**用户故事:** 作为开发者，我希望在不修改核心编排代码的情况下，统一注入Prompt前缀或修改模型参数。

#### 验收标准

1. WHEN 核心函数被调用前 THEN 系统 SHALL 支持 `wrapLanguageModel` 中间件模式，用于统一添加System Prompt或安全护栏
2. WHEN 需要模拟测试 THEN 系统 SHALL 支持注入 `MockLanguageModel`，在不消耗Token的情况下进行单元测试
3. WHEN 中间件链执行 THEN 系统 SHALL 按注册顺序依次执行，支持短路返回
4. WHEN 中间件需要访问上下文 THEN 系统 SHALL 提供请求级别的上下文对象（包含用户信息、租户信息等）
5. WHEN 中间件发生错误 THEN 系统 SHALL 捕获错误并执行配置的错误处理策略
6. WHEN 需要条件性中间件 THEN 系统 SHALL 支持基于请求特征动态启用/禁用特定中间件
