# [OPEN] CI Debug Session: ci-coverage-gitleaks

## Symptoms
- GitHub Actions `run tests with coverage` 失败，日志末尾显示 `MojoFailureException`
- GitHub Actions `run gitleaks` 失败，提示 `Leaks detected`

## Scope
- 仅收集证据与定位根因
- 在拿到足够证据前不修改业务逻辑

## Hypotheses
1. `tests with coverage` 失败是单元测试断言失败，而不是 Maven/JaCoCo 插件本身配置错误。
2. `tests with coverage` 失败是覆盖率阈值未达标或测试阶段触发了 profile / env 缺失。
3. `gitleaks` 当前命中的不是工作区现状，而是 Git 历史中的旧密钥字符串。
4. `gitleaks` 仍命中了仓库中的占位符、文档样例、生成文件或工作流相关文件。
5. GitHub Actions 工作流与本地运行方式不一致，导致 CI 独有失败。

## Evidence Log
- Pending

## Next Steps
1. 读取 CI 工作流与 Maven 配置
2. 本地复现测试与覆盖率命令
3. 搜索剩余可能触发 `gitleaks` 的内容
4. 根据证据决定是否做最小修复
