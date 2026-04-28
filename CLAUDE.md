# 项目规则 

## 技术栈 

- 前端：Vue 3 + Vue Router 4 + Element Plus + Axios + Vite + JavaScript 

- 后端：Spring Boot（Java）+ JWT + Spring Security 

- 数据库：MySQL 

## 目录结构 

### 前端 

```
frontend/
├── src/
│   ├── components/     - 可复用组件（Header/Footer/SearchBar等）
│   ├── views/          - 页面组件（登录/注册/列表/发布/管理等）
│   ├── services/       - API 调用（Axios封装）
│   ├── router/         - 路由配置
│   ├── stores/         - 状态管理（Pinia/Vuex）
│   ├── utils/          - 工具函数
│   └── assets/         - 静态资源
```

### 后端

```
backend/
├── src/main/java/com/lostfound/
│   ├── controller/           - 控制器层（处理HTTP请求）
│   ├── service/              - 业务逻辑层
│   ├── repository/           - 数据访问层（DAO）
│   ├── model/                - 实体类
│   ├── dto/                  - 数据传输对象
│   ├── config/               - 配置类
│   ├── filter/               - 过滤器
│   ├── utils/                - 工具类
│   └── LostFoundApplication.java    - 启动类
└── pom.xml                   - Maven依赖配置
```

## 代码规范 

- 组件使用组合式 API + `<script setup>` 语法 

- 优先使用 Element Plus 组件，样式使用组件内置样式 

- API 响应使用统一格式 `{ code, data, message }` 

- 变量命名使用 camelCase，组件命名使用 PascalCase 

- API 请求统一放在 `services/` 目录，使用 Axios 拦截器处理 Token 

## 禁止事项 

- 不要使用隐式类型转换

- 不要内联样式 

- 不要直接操作 DOM 

- 不要修改配置文件（除非明确要求）