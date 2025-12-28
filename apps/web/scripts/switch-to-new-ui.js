#!/usr/bin/env node

/**
 * 切换到新 UI 的脚本
 * 用法: node scripts/switch-to-new-ui.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const appPath = path.join(srcDir, 'App.tsx');
const appNewPath = path.join(srcDir, 'App.new.tsx');
const appOldPath = path.join(srcDir, 'App.old.tsx');

console.log('🔄 切换到新 UI...\n');

// 检查文件是否存在
if (!fs.existsSync(appNewPath)) {
  console.error('❌ 错误: App.new.tsx 不存在');
  process.exit(1);
}

// 备份原始文件（如果还没有备份）
if (!fs.existsSync(appOldPath)) {
  console.log('📦 备份原始 App.tsx -> App.old.tsx');
  fs.copyFileSync(appPath, appOldPath);
} else {
  console.log('ℹ️  已存在备份文件 App.old.tsx');
}

// 复制新版本
console.log('✨ 应用新 UI: App.new.tsx -> App.tsx');
fs.copyFileSync(appNewPath, appPath);

console.log('\n✅ 切换完成！\n');
console.log('📝 下一步:');
console.log('  1. 确保已配置 .env.local 文件（包含 VITE_GEMINI_API_KEY）');
console.log('  2. 运行: npm run dev');
console.log('  3. 访问: http://localhost:5173\n');
console.log('💡 恢复原版本: node scripts/restore-original-ui.js\n');
