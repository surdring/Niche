# 发布检查清单

## 环境变量
- [ ] `NODE_ENV` 已配置（production/staging）
- [ ] `API_PORT` 已配置
- [ ] `WEB_PORT` 已配置
- [ ] `RAGFLOW_API_URL` 已配置
- [ ] `RAGFLOW_API_KEY` 已配置
- [ ] `PROVIDER_API_KEY` 已配置

## 日志/告警
- [ ] 日志级别已设置（INFO/DEBUG）
- [ ] requestId 日志关联已验证（可按 requestId 查询）
- [ ] 告警规则已配置（错误率/延迟）
- [ ] 告警通知渠道已配置（例如 Slack/Email）

## 回滚/降级策略
- [ ] 数据库备份（如适用）
- [ ] 记录当前版本号（Git SHA）
- [ ] 准备回滚方案（revert commit / 回滚到上一个 tag）
- [ ] 关键依赖不可用时的降级策略已明确（例如 RAGFlow 不可用时降级为无检索/无证据模式）

## 验证命令
- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run test`
- [ ] `npm run build`

## CI 缓存策略说明
- [ ] CI 使用 `actions/setup-node` 的 `cache: npm`
- [ ] 缓存 key 绑定 `package-lock.json`（lockfile 变更会导致缓存失效并重新安装依赖）

## 可选自动化预检查
- [ ] 运行 `./scripts/pre-release-check.sh`（检查关键环境变量是否已设置）
