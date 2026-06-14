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
- `tests with coverage` 的直接失败点是 `BackendApplicationTests.contextLoads`
- `surefire-reports` 显示根因是 `Could not resolve placeholder 'jwt.secret'`
- 给 `JwtUtils` 恢复低风险默认值后，本地 `mvn test jacoco:report` 通过，`54` 个测试全部通过
- `gitleaks` 相关证据显示当前仓库存在大量测试假 token、占位密码、coverage 生成文件中的镜像内容
- 本地直接下载 `gitleaks` 二进制两次都被网络中断打断，失败点在下载，不是项目运行错误
- 当前采用最小修复策略：新增 `.gitleaks.toml`，仅忽略测试目录、coverage 生成目录和明确的占位字符串

## Next Steps
1. push 当前最小改动并观察 GitHub Actions 的 `gitleaks` 结果
2. 如果仍失败，读取 job summary 中具体命中的文件和规则
3. 仅对被命中的测试样例或占位值继续缩小 allowlist 范围
