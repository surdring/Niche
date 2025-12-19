# qwen3-embedding-4b-Q5_K_M.gguf 在内存（RAM/可选显存）上运行：llama.cpp 使用笔记

本文整理了关于如何使用 `llama.cpp` 运行 `qwen3-embedding-4b-Q5_K_M.gguf`（GGUF 格式 embedding 模型），并解释“运行在内存上”的含义、以及如何做到“只用 RAM、不占显存”。

## 1. “运行在内存上”到底指什么

在 `llama.cpp` 语境里，常见的“在内存上运行”大致有三种含义：

- **在 RAM（主内存）中运行**：模型权重会被加载/映射到进程地址空间，推理时主要访问 RAM。
- **在显存（VRAM）中运行**：通过 GPU offload 把部分层/张量放到 GPU 显存里。
- **尽量减少磁盘 IO / 常驻内存**：使用 OS page cache、`mlock`、或将模型放到 `tmpfs` 等方式，让模型数据尽量留在 RAM 中。

本文重点覆盖：

- 使用 `llama-server` 进行 embedding
- **只用 RAM（不放显存）** 的配置方式

## 2. 是否需要按 CPU 文档重新编译

- 如果你已有可用的 `llama.cpp` 可执行程序（无论是 CPU 版还是 AMD GPU/ROCm/HIP 版），通常 **不需要为了“在 RAM 里运行”专门重编 CPU 版**。
- `llama.cpp` 运行时会把模型加载/映射到内存中（通常使用 `mmap` + OS page cache），这已经满足“在 RAM 中运行”的基本含义。

如果你的诉求是“完全不初始化 GPU / 不依赖 GPU runtime”，才需要单独编译一个纯 CPU 后端的二进制。

## 3. 官方 server 示例（embedding）

你可以用类似下面的方式启动 embedding server：

```bash
./build-hip/bin/llama-server -m model.gguf --embedding --pooling last -ub 8192 --verbose-prompt
```

关键参数说明：

- `-m, --model`：模型路径（`.gguf`）
- `--embedding`：限制为 embedding 用例（适合专用 embedding 模型）
- `--pooling {none,mean,cls,last,rank}`：embedding 的 pooling 方式
- `-ub, --ubatch-size`：物理 batch 上限（影响性能与内存占用）
- `--verbose-prompt`：输出更详细日志，便于确认是否 offload、加载方式等

## 4. 只用 RAM（不占显存）的推荐命令

你的 `llama-server --help` 显示当前二进制支持以下关键参数：

- `-dev, --device <dev1,dev2,..>`：`none = don't offload`
- `-ngl, --gpu-layers, --n-gpu-layers N`：最大放入 VRAM 的层数

因此要 **明确禁止使用显存**，建议同时设置两项（双保险）：

```bash
./build-hip/bin/llama-server \
  -m qwen3-embedding-4b-Q5_K_M.gguf \
  --embedding --pooling last \
  -ub 8192 \
  --verbose-prompt \
  --device none \
  -ngl 0
```

含义：

- `--device none`：不把任何层/张量 offload 到设备（GPU）
- `-ngl 0`：0 层放入 VRAM

> 说明：即使你使用的是 HIP/ROCm 编译的 `llama-server`，程序仍可能会“枚举/初始化”ROCm 设备（日志里会看到 found ROCm devices）。但上述设置可以确保 **不把模型层 offload 到显存**，从而避免大块 VRAM 占用。

## 5. 让模型更“常驻 RAM”：`--mlock`

如果你希望模型尽量不要被系统换出（swap）或被内存压缩/回收，可以加上：

- `--mlock`：强制系统尽量把模型留在 RAM

示例：

```bash
./build-hip/bin/llama-server \
  -m qwen3-embedding-4b-Q5_K_M.gguf \
  --embedding --pooling last \
  -ub 8192 \
  --verbose-prompt \
  --device none \
  -ngl 0 \
  --mlock
```

注意：

- `--mlock` 是否生效可能受系统限制影响（例如 `ulimit -l` 允许锁定的内存大小）。

## 6. 关于 `--no-mmap`

你的 help 中也有：

- `--no-mmap`：不使用内存映射（加载更慢，但在不使用 `mlock` 时可能减少 pageouts）

一般建议：

- 优先使用默认 mmap（不加 `--no-mmap`）。
- 若你的环境对 pageout 行为特别敏感，可再评估是否需要 `--no-mmap`。

## 7. 如何确认“没有使用显存”

启动时观察日志：

- 不应出现“offloaded X layers to GPU / VRAM”之类的提示（或 X 为 0）。
- 如果看到大量 VRAM buffer 分配信息，说明仍有 offload（或其它 GPU 相关 buffer），需要检查是否真的传入了 `--device none -ngl 0`。

## 8. 常见问题

### 8.1 我已经是 AMD GPU 编译版，能不能只用 RAM？

可以。通过 `--device none -ngl 0` 即可做到“不 offload 到显存”。

### 8.2 我需要按 CPU build 文档重新编译吗？

通常不需要。

只有在以下情况才建议额外编一个纯 CPU 版：

- 你希望运行时完全不触碰/初始化 GPU runtime
- 你的 HIP/ROCm 环境有兼容性问题导致启动即报错

---

以上文档基于 `llama.cpp` 的 `llama-server --help` 中出现的参数（`--device none`、`-ngl 0`、`--mlock` 等）整理。
