# 🚀 如何查看新 UI（App.new.tsx）

## 最快启动方式（3 步）

### 1️⃣ 配置 API Key

```bash
# 在 apps/web 目录下
copy .env.example .env.local
```

然后编辑 `.env.local`，填入你的 Gemini API Key：
```
VITE_GEMINI_API_KEY=你的实际密钥
```

> 💡 获取 API Key: https://ai.google.dev/

### 2️⃣ 切换到新 UI

**Windows 用户（推荐）：**
```bash
# 双击运行
switch-to-new-ui.bat
```

**或使用命令行：**
```bash
cd apps/web
switch-to-new-ui.bat
```

### 3️⃣ 启动开发服务器

```bash
# 在项目根目录
npm run dev -w @niche/web

# 或在 apps/web 目录
npm run dev
```

然后访问：**http://localhost:5173**

---

## 📸 预期效果

### 首页（模板选择器）
- 深色主题背景
- 3 个场景卡片：
  - 🔬 研究助手 (Research Copilot)
  - 🎓 学习导师 (苏格拉底式)
  - ✍️ 学术写作助手
- 每个卡片显示能力标签（RAG检索、深度推理等）
- 悬停时卡片上浮并发光

### 对话界面
- 左侧：导航栏 + 历史记录
- 中间：对话区域
  - 流式打字机效果
  - 推理动画（"正在分析与推理..."）
- 右侧：知识引用面板（仅 RAG 模式）
  - 来源构成饼图
  - 引用列表

---

## 🔄 恢复原始版本

```bash
# 双击运行
restore-original-ui.bat
```

---

## ⚠️ 故障排查

### 问题：依赖缺失

```bash
# 在项目根目录
npm install
```

### 问题：API Key 无效

检查 `.env.local`：
- ✅ 文件名是 `.env.local`（不是 `.env`）
- ✅ 变量名是 `VITE_GEMINI_API_KEY`
- ✅ 没有多余空格或引号

### 问题：端口被占用

修改 `vite.config.ts` 中的端口：
```typescript
server: {
  port: 5174, // 改成其他端口
  // ...
}
```

### 问题：样式不显示

检查 `index.html` 是否包含：
```html
<script src="https://cdn.tailwindcss.com"></script>
```

---

## 📝 功能对比

| 功能 | 新 UI | 原版 |
|------|-------|------|
| 场景模板选择 | ✅ 卡片式 | ⚠️ 下拉菜单 |
| 深色主题 | ✅ 现代设计 | ⚠️ 简单样式 |
| 推理动画 | ✅ 呼吸灯 | ❌ 无 |
| 知识面板 | ✅ 图表+引用 | ⚠️ 简单列表 |
| 流式输出 | ✅ 打字机 | ✅ 支持 |
| 后端集成 | ❌ 直接 API | ✅ 完整 |
| Step Events | ❌ 未实现 | ✅ 支持 |
| 导出功能 | ❌ 未实现 | ✅ Markdown |

---

## 🎨 自定义

### 修改场景模板

编辑 `src/constants/templates.ts`

### 修改配色

编辑 `index.html` 中的 Tailwind 配置

### 添加新组件

参考 `src/components/` 目录下的现有组件

---

## 💬 反馈

查看完新 UI 后，请提供：
1. 视觉设计反馈
2. 交互体验反馈
3. 功能需求建议
4. 是否应用到主应用

---

## 📚 相关文档

- [完整启动指南](./QUICKSTART-NEW-UI.md)
- [新 UI 说明](./README-NEW-UI.md)
- [项目需求](../../specs/study-copilot/requirements.md)
