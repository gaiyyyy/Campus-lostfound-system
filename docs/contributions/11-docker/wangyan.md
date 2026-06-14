# Docker 部署贡献说明

姓名：王琰
学号：2312190223 
日期：2026-05-19

## 我完成的工作

### 1. Dockerfile 编写
- [x] 前端 Dockerfile（多阶段构建）
- [ ] 后端 Dockerfile（多阶段构建）
- [x] .dockerignore 文件

### 2. Compose 配置
- [x] 开发环境 compose.yaml（添加前端服务配置）
- [x] 生产环境 compose.prod.yaml（添加前端服务配置）
- [x] 健康检查配置（nginx 和 CI 测试栈）

### 3. 自动化部署
- 选择了选项 A（GitHub Actions）
- 具体内容：
  - 在 `.github/workflows/docker.yml` 中增加前端镜像构建步骤，与后端并行构建并推送到 GHCR
  - 新增 `docker-compose.test.yaml` 测试编排文件，用于 CI 验证服务启动
  - 新增 `test` job，实现 `docker compose up -d` 自动验证、健康检查和 curl 测试

## 遇到的问题和解决

### 问题1：前后端端口冲突
- **问题**：生产环境前端和后端都映射主机 80 端口
- **解决**：后端改为 8080 端口，前端占用 80

### 问题2：本地 Docker 无法启动
- **问题**：Windows 上 Docker Desktop 因 WSL 问题无法正常启动
- **解决**：改用 GitHub Actions CI 验证，通过 test job 自动运行 `docker compose up -d` 并检查健康状态

## AI 使用情况

- **使用了哪些 Prompt**：
  - "生成前端 Dockerfile 多阶段构建，使用 nginx 托管静态文件"
  - "生成 nginx.conf 配置 SPA 路由回退"
  - "在 compose.yaml 和 compose.prod.yaml 中添加前端服务配置"
  - "在 docker.yml 中添加前端镜像构建步骤，与后端并行"
  - "在 CI 中添加 test job，验证 docker compose up -d 能正常启动"

- **AI 帮助解决了哪些问题**：
  - nginx 配置中 `try_files` 实现 SPA 路由回退
  - 多阶段构建优化镜像大小
  - GitHub Actions 中前后端并行构建的 job 拆分
  - CI 中服务健康检查和 curl 验证的自动化流程

## 心得体会

通过本次 Docker 部署作业，我掌握了：

1. **前端容器化**：学会了如何将 Vue 项目打包成 Docker 镜像，使用 nginx 托管静态文件

2. **多阶段构建**：理解了如何通过多阶段构建大幅减小镜像体积（构建阶段用 node 镜像，运行阶段用 nginx alpine）

3. **Compose 编排**：掌握了开发和生产环境的 Compose 配置差异，包括热重载卷挂载、健康检查、资源限制

4. **CI/CD 集成**：学会了在 GitHub Actions 中实现镜像构建、推送和自动化部署验证

5. **问题排查**：通过 CI 日志定位端口冲突、SPA 路由等问题，比本地调试更高效