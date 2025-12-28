# Niche 学习助手 - 新 UI 重构

## 概述

这是基于 ui-demo 参考设计的 Niche 项目重构版本。新 UI 采用现代化的设计语言，强调场景模板、学术诚信和深度推理能力。

## 核心特性

### 1. 场景模板系统
- **研究助手 (Research Copilot)**: 深入研究学术课题，提供文献引用和结构化综合报告
- **学习导师 (苏格拉底式)**: 通过提问和解释帮助学习，坚持学术诚信
- **学术写作助手**: 协助构建、校对和润色学术论文

### 2. 设计语言
- **配色方案**: 深色模式，主背景 `slate-950`，强调色 `#38bdf8`
- **排版**: Inter 字体，清晰的层级结构
- **动效**: Thinking Pulse（呼吸灯）、平滑淡入淡出
- **布局**: 三栏式布局（左侧导航、中间对话、右侧知识面板）

### 3. 核心组件

#### Sidebar (左侧导航)
- 新建会话按钮
- 历史记录列表
- 核心模块入口
- 用户信息

#### TemplateSelector (场景选择器)
- Grid 网格布局展示场景卡片
- 能力标签（RAG检索、深度推理、联网搜索、代码辅助）
- 悬停动效

#### ChatInterface (对话界面)
- 流式打字机效果
- 推理状态指示器
- 用户/AI 消息气泡
- 底部悬浮输入框

#### KnowledgePanel (知识溯源面板)
- 来源构成可视化（饼图）
- 引用列表
- 仅在 RAG 模式下显示

## 文件结构

```
apps/web/src/
├── components/
│   ├── Sidebar.tsx              # 左侧导航栏
│   ├── TemplateSelector.tsx     # 场景模板选择器
│   ├── ChatInterface.tsx        # 对话界面
│   ├── KnowledgePanel.tsx       # 知识引用面板
│   └── Icons.tsx                # 图标组件
├── services/
│   └── geminiService.ts         # Gemini API 服务
├── types/
│   └── index.ts                 # TypeScript 类型定义
├── constants/
│   └── templates.ts             # 场景模板配置
├── App.new.tsx                  # 新版主应用组件
└── main.tsx                     # 应用入口
```

## 安装与运行

### 1. 安装依赖

```bash
npm install
```

新增的依赖包括：
- `@google/genai`: Google Gemini API SDK
- `lucide-react`: 图标库
- `recharts`: 图表库
- `react@19.2.3`: React 19

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，添加你的 Gemini API Key：

```
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173`

## 使用新 UI

### 方式 1: 替换现有 App.tsx

```bash
# 备份现有文件
mv apps/web/src/App.tsx apps/web/src/App.old.tsx

# 使用新版本
mv apps/web/src/App.new.tsx apps/web/src/App.tsx
```

### 方式 2: 创建独立路由

在 `main.tsx` 中添加路由切换逻辑，保留两个版本共存。

## 技术栈

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (CDN)
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI Integration**: Google Gemini API
- **Language**: TypeScript (Strict Mode)

## 设计原则

1. **拒绝通用聊天界面**: 通过场景模板提供专业化体验
2. **学术诚信**: 内置荣誉准则提示，引导式教学
3. **深度推理**: 支持 Gemini 3.0 的 thinking 能力
4. **引用溯源**: RAG 模式下显示知识来源和引用

## 后续开发

### 待实现功能
- [ ] 会话持久化（LocalStorage/IndexedDB）
- [ ] 真实的 RAG 集成（替换 mock 数据）
- [ ] 导出为 Markdown
- [ ] 移动端响应式优化
- [ ] 暗色/亮色主题切换
- [ ] 多语言支持

### 集成现有后端
新 UI 目前使用 Gemini API 直接调用。要集成现有的 Niche 后端：

1. 修改 `services/geminiService.ts`，调用 `/api/stream` 端点
2. 适配 `@niche/core/contracts` 中的类型定义
3. 使用现有的 GraphQL/REST API

## 参考

- UI Demo: `ui-demo/` 目录
- 设计规范: 参见用户提供的设计要求
- Gemini API: https://ai.google.dev/docs

## 许可

与 Niche 项目主仓库保持一致
