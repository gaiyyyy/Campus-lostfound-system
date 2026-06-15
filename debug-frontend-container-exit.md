[OPEN] frontend-container-exit

# 背景
- 现象：`test-compose` 阶段持续输出 `Waiting for frontend container...`，随后报 `Service frontend container not found`。
- 已知证据：`backend` 与 `db` 容器为 healthy，`frontend` 容器存在但状态为 `Exited (1)`。
- 目标：确认 `frontend` 容器退出的直接原因，并给出最小修复。

# 初始假设
1. `frontend` 运行阶段镜像里的 `nginx` 配置与非 root 用户不兼容，启动即退出。
2. `frontend` 镜像健康检查依赖的命令或路径不可用，导致容器虽然启动但很快失败退出。
3. `frontend` 构建产物未正确复制到运行阶段，`nginx` 启动时找不到静态文件或配置文件。
4. `frontend` 的 `CMD` 或基础镜像入口脚本在 CI 环境下触发配置校验失败，返回退出码 1。
5. GitHub Actions 的等待脚本只检查“容器是否存在”，但 `frontend` 实际是“创建后立刻崩溃”，因此表象是找不到容器。

# 调试计划
1. 检查 `frontend/Dockerfile`、`frontend/nginx.conf` 与测试编排配置。
2. 收集能解释 `Exited (1)` 的静态证据与现有日志。
3. 如静态证据不足，再添加最小化插桩或失败时日志输出，获取运行时证据。
4. 基于证据实施最小修复并验证。

# 证据分析
- 用户提供的 Actions 输出显示：`backend` 与 `db` 为 healthy，而 `frontend` 容器名 `lostfound-frontend-test` 已创建但状态为 `Exited (1)`。
- 最新运行时日志明确给出：`nginx: [emerg] open() "/var/run/nginx.pid" failed (13: Permission denied)`。
- `frontend/Dockerfile` 中运行阶段显式使用 `USER nginx`，说明容器主进程以非 root 身份运行。
- `frontend/nginx.conf` 原配置将 `pid` 写到 `/var/run/nginx.pid`，与非 root 运行权限冲突，这是当前已确认的直接根因。
- 工作流此前使用 `docker compose ps -q` 仅查询运行中的容器，服务若已退出，会表现为“等待容器出现”或长期 unhealthy，掩盖真实故障。

# 假设结论
1. `nginx` 配置与非 root 运行不兼容：已确认，`pid /var/run/nginx.pid` 是直接根因。
2. 健康检查依赖缺失：已基本排除，镜像中已安装 `wget`。
3. 构建产物未复制：暂无证据支持。
4. `nginx.conf` 语法问题：暂无证据支持。
5. 等待脚本掩盖已退出容器：已确认，是定位困难的次级问题。

# 已实施修复
1. 将前端容器内监听端口从 `80` 调整为 `8080`。
2. 将前端镜像 `EXPOSE` 同步调整为 `8080`。
3. 将测试与生产编排中的前端端口映射改为宿主机 `80` -> 容器 `8080`，并同步更新健康检查地址。
4. 将 `nginx` 的错误日志输出切到 `/dev/stderr`，便于在容器日志中直接看到启动失败原因。
5. 将 `nginx` 的 PID 文件改到 `/tmp/nginx.pid`，避免非 root 用户写 `/var/run` 失败。
6. 增强 GitHub Actions 日志：容器未出现或提前退出时打印对应服务日志，并使用 `ps -aq` 识别已退出容器。
