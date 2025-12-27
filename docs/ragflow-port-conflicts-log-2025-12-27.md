# RAGFlow 部署端口冲突排障日志（6379/80）

时间：2025-12-27

本文记录在同一台机器上同时存在其他服务（例如 Dify 相关容器、宿主机服务）时，启动 RAGFlow Docker Compose 过程中遇到的端口冲突现象、定位过程与解决方案。

---

## 1. 背景

- 目标：在 `~/workspace/ragflow/docker` 目录下执行：

```bash
docker compose -f docker-compose.yml up -d
```

- 环境：机器上已有其他容器/服务运行（曾看到多组 `docker-xxx` 容器，例如 Dify 相关），存在端口复用风险。

- 关键配置：RAGFlow 的端口主要由 `docker/.env` 控制，例如：
  - `REDIS_PORT`
  - `SVR_WEB_HTTP_PORT`
  - `SVR_WEB_HTTPS_PORT`

---

## 2. 冲突一：Redis 端口 6379 冲突

### 2.1 现象
执行 `docker compose -f docker-compose.yml up -d` 报错：

```text
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint docker-redis-1 (...):
failed to bind host port 0.0.0.0:6379/tcp: address already in use
```

含义：
- RAGFlow 的 `docker-redis-1` 容器尝试将容器内 Redis（6379）映射到宿主机 `0.0.0.0:6379`。
- 但宿主机 6379 已被占用，导致端口绑定失败。

### 2.2 定位
验证宿主机端口占用：

```bash
ss -ltnp | grep ':6379'
```

输出（用户环境示例）：

```text
LISTEN 0      511        127.0.0.1:6379       0.0.0.0:*
LISTEN 0      511            [::1]:6379          [::]:*
```

说明：
- 6379 在宿主机 loopback 上已监听（极可能是宿主机的 `redis-server` 或其他服务）。
- 即使只监听 `127.0.0.1:6379`，也会阻止 Docker 再绑定 `0.0.0.0:6379`。

### 2.3 解决方案（推荐）
修改 RAGFlow 的 `docker/.env`：

- 将：

```bash
REDIS_PORT=6379
```

- 改为（示例）：

```bash
REDIS_PORT=6381
```

然后重启：

```bash
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d --remove-orphans
```

验证 RAGFlow 的 Redis 映射是否生效：

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep redis
```

期望看到类似：
- `0.0.0.0:6381->6379/tcp`

备注：
- 该方案不会影响容器内服务间通信（容器内仍使用 6379）。
- 只是把“宿主机暴露端口”改到空闲端口，避免与现有服务冲突。

---

## 3. 冲突二：Web 端口 80 冲突

### 3.1 现象
修复 6379 后再次 `up -d --remove-orphans` 报错：

```text
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint docker-ragflow-cpu-1 (...):
failed to bind host port 0.0.0.0:80/tcp: address already in use
```

含义：
- RAGFlow 对外提供 Web（HTTP）服务时尝试绑定宿主机 `0.0.0.0:80`。
- 但宿主机 80 已被占用（常见占用者：宿主机 nginx/apache，或其他容器映射 80，例如 Dify 的 nginx/web）。

### 3.2 定位
确认端口 80 占用：

```bash
ss -ltnp | grep ':80' || true
```

（在用户环境中确认到 `0.0.0.0:80` 正在 LISTEN）

同时确认 `.env` 的配置：

```bash
grep -nE 'SVR_WEB_HTTP_PORT|SVR_WEB_HTTPS_PORT' .env
```

期望看到：

```text
SVR_WEB_HTTP_PORT=80
SVR_WEB_HTTPS_PORT=443
```

### 3.3 解决方案（推荐）
修改 RAGFlow 的 `docker/.env`，把对外端口改为未占用端口（示例）：

- 将：

```bash
SVR_WEB_HTTP_PORT=80
SVR_WEB_HTTPS_PORT=443
```

- 改为：

```bash
SVR_WEB_HTTP_PORT=8088
SVR_WEB_HTTPS_PORT=8443
```

然后重启：

```bash
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml up -d --remove-orphans
```

之后通过：
- `http://<host>:8088` 访问 RAGFlow UI

### 3.4 备选方案
如果你坚持使用 80/443：
- 需要先停止当前占用 80/443 的服务或容器映射。

常用排查：

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}' | grep -E ':80->|:443->' || true
```

---

## 4. Orphan containers 提示的含义与处理

日志中出现：

```text
Found orphan containers (...) for this project.
...
run this command with the --remove-orphans flag to clean it up.
```

含义：
- 当前 compose project 名称下存在“compose 文件里不再定义，但历史遗留的容器”。

处理建议：
- 使用：

```bash
docker compose -f docker-compose.yml up -d --remove-orphans
```

- 或者在确认无用后：

```bash
docker compose -f docker-compose.yml down --remove-orphans
```

---

## 5. 经验总结（建议）

- **优先改端口而不是停别的服务**：
  - 同机多套系统共存（例如 Dify + RAGFlow）时，端口冲突是常态。
  - 改 `.env` 的宿主机映射端口成本最低，风险最小。

- **建议建立端口规划表**：
  - 例如：RAGFlow 统一从 8088/8443/6381 起；Dify 保持 80/443/6379。

- **最少确认三类端口**：
  - Redis（`REDIS_PORT`）
  - Web（`SVR_WEB_HTTP_PORT`/`SVR_WEB_HTTPS_PORT`）
  - 其他对外端口（ES、MySQL、MinIO 等）

