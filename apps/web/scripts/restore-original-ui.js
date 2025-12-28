#!/usr/bin/env node

/**
 * 恢复原始 UI 的脚本
 * 用法: node scripts/restore-original-ui.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const appPath = path.join(srcDir, 'App.tsx');
const appOldPath = path.join(srcDir, 'App.old.tsx');

console.log('🔄 恢复原始 UI...\n');

// 检查备份是否存在
if (!fs.existsSync(appOldPath)) {
  console.error('❌ 错误: 找不到备份文件 App.old.tsx');
  console.log('💡 提示: 可能从未切换过，或备份文件已被删除');
  process.exit(1);
}

// 恢复备份
console.log('📦 恢复: App.old.tsx -> App.tsx');
fs.copyFileSync(appOldPath, appPath);

console.log('\n✅ 恢复完成！\n');
console.log('📝 下一步:');
console.log('  1. 运行: npm run dev');
console.log('  2. 访问: http://localhost:5173\n');
console.log('💡 再次切换到新 UI: node scripts/switch-to-new-ui.js\n');
