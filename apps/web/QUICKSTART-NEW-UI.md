# 快速启动新 UI（App.new.tsx）

## 前置条件

1. Node.js 已安装
2. 获取 Gemini API Key（从 https://ai.google.dev/ 获取）

## 步骤 1：安装依赖

```bash
# 在项目根目录
npm install

# 或者只安装 web 应用的依赖
cd apps/web
npm install
```

## 步骤 2：配置环境变量

创建 `apps/web/.env.local` 文件：

```bash
# 在 apps/web 目录下
echo "VITE_GEMINI_API_KEY=your_actual_api_key_here" > .env.local
```

或者手动创建文件，内容如下：

```
VITE_GEMINI_API_KEY=你的_Gemini_API_密钥
```

## 步骤 3：临时替换 App.tsx

```bash
# 在 apps/web 目录下

# 备份原始文件
mv src/App.tsx src/App.old.tsx

# 使用新版本
cp src/App.new.tsx src/App.tsx
```

## 步骤 4：启动开发服务器

```bash
# 在 apps/web 目录下
npm run dev
```

或者从项目根目录：

```bash
npm run dev -w @niche/web
```

## 步骤 5：访问应用

打开浏览器访问：`http://localhost:5173`

## 预期效果

你应该看到：
1. **深色主题**的界面（slate-950 背景）
2. **左侧边栏**：Niche logo、新建会话按钮、历史记录
3. **中间区域**：场景模板选择器，显示 3 个卡片
   - 研究助手 (Research Copilot)
   - 学习导师 (苏格拉底式)
   - 学术写作助手
4. 每个卡片显示**能力标签**（RAG检索、深度推理、联网搜索等）

## 交互流程

1. **选择模板** → 点击任意场景卡片
2. **进入对话界面** → 看到输入框和对话区域
3. **输入问题** → 在底部输入框输入问题
4. **查看响应** → 
   - 如果模板启用了"深度推理"，会先看到"正在分析与推理..."
   - 然后看到流式打字机效果的回答
5. **查看引用**（仅 RAG 模式）→ 右侧显示知识引用面板

## 恢复原始版本

```bash
# 在 apps/web 目录下
mv src/App.old.tsx src/App.tsx
```

## 故障排查

### 问题 1：依赖安装失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题 2：API Key 错误

检查 `.env.local` 文件：
- 确保文件名正确（`.env.local` 不是 `.env`）
- 确保变量名是 `VITE_GEMINI_API_KEY`（注意 `VITE_` 前缀）
- 确保 API Key 没有多余的空格或引号

### 问题 3：Tailwind CSS 不生效

检查 `index.html` 是否包含 Tailwind CDN：

```html
<script src="https://cdn.tailwindcss.com"></script>
```

### 问题 4：类型错误

确保安装了所有类型定义：

```bash
npm install --save-dev @types/react @types/react-dom
```

## 开发提示

### 修改场景模板

编辑 `apps/web/src/constants/templates.ts`：

```typescript
export const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'your-template',
    name: '你的模板名称',
    description: '描述...',
    icon: 'book', // 可选: book, graduation-cap, pen-tool
    systemInstruction: '系统提示词...',
    capabilities: {
      rag: true,        // 是否显示知识面板
      webSearch: false,
      reasoning: true,  // 是否显示推理动画
      coding: false,
    },
    suggestedPrompts: ['示例问题1', '示例问题2']
  }
];
```

### 修改配色

编辑 `apps/web/index.html` 中的 Tailwind 配置：

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#0f172a',      // 主背景色
        secondary: '#1e293b',    // 次要背景色
        accent: '#38bdf8',       // 强调色（按钮、高亮）
        'accent-hover': '#0ea5e9', // 强调色悬停
      }
    }
  }
}
```

### 调试 Gemini API 调用

打开浏览器开发者工具（F12），查看 Console 标签页，可以看到：
- API 调用日志
- 错误信息
- 流式响应的 chunk

## 与现有版本对比

| 特性 | App.new.tsx | App.tsx (原版) |
|------|-------------|----------------|
| 设计语言 | ✅ 现代深色主题 | ⚠️ 简单样式 |
| 场景模板 | ✅ 卡片式选择器 | ❌ 下拉菜单 |
| 流式输出 | ✅ 打字机效果 | ✅ 支持 |
| 推理动画 | ✅ 呼吸灯效果 | ❌ 无 |
| 知识面板 | ✅ 右侧面板+图表 | ⚠️ 简单列表 |
| 后端集成 | ❌ 直接调用 Gemini | ✅ 完整集成 |
| Step Events | ❌ 未实现 | ✅ 支持 |
| Evidence API | ❌ Mock 数据 | ✅ 真实 API |
| 导出功能 | ❌ 未实现 | ✅ Markdown |

## 下一步

查看完新 UI 后，可以：
1. 提供反馈和改进建议
2. 决定是否将设计应用到主应用
3. 讨论功能补全计划
