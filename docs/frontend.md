# 校园失物招领系统前端说明文档

## 1. 模块功能

前端模块主要负责用户与系统的交互，提供直观、友好的操作界面，核心功能包括：

- **用户认证模块**：用户注册、登录、登出
- **失物管理模块**：发布失物、查看失物列表、查看失物详情、编辑/删除本人发布的失物、更新失物状态
- **招领管理模块**：发布招领、查看招领列表、查看招领详情、编辑/删除本人发布的招领、更新招领状态
- **个人中心模块**：查看本人发布的失物/招领、修改用户名/密码、查看联系方式
- **管理员模块**（权限控制）：用户管理、所有失物/招领信息审核与管理
- **实时检索模块**：支持关键词搜索、分类筛选、状态筛选的实时过滤功能

------

## 2. 技术选型

| 技术             | 说明                         |
| :--------------- | :--------------------------- |
| **Vue 3**        | 前端核心框架，组合式 API     |
| **Vue Router 4** | 路由管理                     |
| **Element Plus** | UI 组件库，快速构建界面      |
| **Axios**        | HTTP 请求库，与后端 API 交互 |
| **Vite**         | 构建工具，开发体验好         |
| **JavaScript**   | 开发语言（ES6+）             |
| **GitHub**       | 代码托管与版本控制           |

------

## 3. 目录结构

```text
frontend/
├── public/                 # 静态资源
├── src/
│   ├── api/                # API 请求封装
│   │   ├── axio.js          
│   │   ├── user.js         # 登录/注册相关
│   │   ├── lost.js         # 失物相关
│   │   ├── found.js        # 招领相关
│   │   └── admin.js        # 管理员相关
│   ├── assets/             # 图片、样式等资源
│   ├── components/         # 公共组件
│   ├── router/             # 路由配置
│   │   └── index.js
│   ├── views/              # 页面视图
│   │   ├── Login.vue
│   │   ├── Register.vue
│   │   ├── Home.vue        # 主页（失物/招领列表）
│   │   ├── Lost/
│   │       ├── LostDetail.vue
│   │       ├── LostList.vue
│   │       ├── LostNew.vue
│   │       └── LostEdit.vue
│   │   ├── found/
│   │       ├── FoundDetail.vue
│   │       ├── FoundList.vue
│   │       └── FoundPublish.vue
│   │   ├── Profile.vue
│   │   └── Admin/
│   │       ├── AdminDashboard.vue
│   │       ├── UserManage.vue
│   │       └── ItemManage.vue
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

------

## 4. 运行方式

### 4.1 环境要求

- Node.js 16+
- npm 

### 5.2 安装与启动

```bash
# 克隆项目（假设已克隆）
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 5.3 访问地址

- 前端服务默认运行在：`http://localhost:5173`
- 后端 API 默认地址：`http://localhost:8080`

### 5.4 构建生产版本

```bash
npm run build
```