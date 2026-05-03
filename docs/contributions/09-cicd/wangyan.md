# CI/CD 配置贡献说明

姓名：王琰
学号：2312190223
角色：前端 
日期：2026-05-03

## 完成的工作

### 工作流相关
- [x] 参与编写 `.github/workflows/ci.yml`
- [x] 配置 Codecov 覆盖率上传（frontend flag）
- [ ] 添加 README 状态徽章

### 代码适配
- [x] 本地测试命令与 CI 一致，无需额外配置（`npm test`、`npm run lint`）
- [x] 代码通过 Lint 检查（ESLint 零警告）
- [x] 核心覆盖率达标（82.97% > 60%）

## PR 链接
- PR #28: https://github.com/gaiyyyy/Campus-lostfound-system/pull/28

## CI 运行链接
- [Update README.md · gaiyyyy/Campus-lostfound-system@b6de4fd](https://github.com/gaiyyyy/Campus-lostfound-system/actions/runs/25274238427/job/74101455443)

## 遇到的问题和解决

### 问题1：Vitest 在 CI 中找不到 `node:inspector/promises` 模块
- **原因**：CI 环境使用 Node.js 18，但 Vitest 4.1.5 需要 Node.js 20+
- **解决**：将 `.github/workflows/ci.yml` 中的 `node-version` 从 `18` 改为 `20`

### 问题2：CI 前端 job 被后端 job 卡住
- **原因**：`needs: backend` 导致前端 job 等待后端完成
- **解决**：临时移除 `needs` 依赖，让前后端 CI 独立运行

## 心得体会

通过本次 CI/CD 配置作业，我掌握了：

1. **GitHub Actions 工作流编写**：理解 `on` 触发条件、`jobs` 并行执行、`steps` 顺序执行

2. **前端测试在 CI 环境的适配**：学会了处理 Node.js 版本兼容、非交互式测试运行、覆盖率生成

3. **Codecov 集成**：了解了覆盖率上报流程和徽章生成原理，解决了 flag 配置和缓存问题

4. **团队协作**：通过 PR 参与工作流配置和代码审查，体会了 CI 在团队开发中的价值

5. **问题排查能力**：通过 GitHub Actions 日志定位问题，逐步修复 Node.js 版本、路径配置、上传条件等细节

6. **工具认知**：深刻认识到自动化测试和覆盖率检查对保障代码质量的重要性