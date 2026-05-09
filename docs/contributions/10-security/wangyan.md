# 安全审查贡献说明

姓名：王琰
学号：2312190223
日期：2026-05-09

## 我完成的工作

### 安全检查清单

**认证与授权**

- [x]  **密码存储**：使用bcrypt ，不存明文
- [x] **JWT / Session**：token 有过期时间，logout 后失效
- [x] **接口鉴权**：所有需要登录的接口都有权限校验
- [x] **越权访问**：用户只能操作自己的数据（不能通过改ID 访问他人数据）

**注入防护**

- [x] **SQL**：使用JPA/参数化JPQL，无字符串拼接SQL
- [x] **XSS**：前端输出用户数据时不用innerHTML，或使用DOMPurify

**敏感信息**

- [x] **API Key / 密码**：不硬编码在代码中，通过环境变量读取
- [x] **.env文件**：已加入.gitignore，仓库中有.env .example

**依赖安全**

- [x] 运行依赖扫描，无高危漏洞（或已记录已知漏洞原因）

## 遇到的问题和解决
### 问题1：npm audit 返回 404 错误
- **原因**：默认 npm registry 镜像不支持 audit 接口
- **解决**：改用官方 registry：`npm audit --registry=https://registry.npmjs.org`

### 问题2：npm audit 发现高危漏洞
- **漏洞**：`glob` 依赖存在命令注入风险（high severity）
- **解决**：运行 `npm audit fix` 自动升级到安全版本，最终 0 vulnerabilities

### 问题3：多个 Vue 组件存在敏感信息打印
- **原因**：开发调试时遗留的 console.log
- **解决**：移除敏感打印，或改为 `if (import.meta.env.MODE === 'development')` 条件打印

## 心得体会
通过 AI 辅助安全审查，发现前端常见的 XSS 和敏感信息泄露问题很容易被忽视。Vibe Coding 场景下，AI 能快速定位潜在风险，但最终判断和修复还是需要开发者理解安全原理。养成"提交前自查"的习惯很重要。