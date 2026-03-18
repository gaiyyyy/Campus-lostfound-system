# 校园失物招领系统 - 架构设计文档

## 1. 系统整体架构图

```mermaid
graph TB
    subgraph 客户端
        Browser[浏览器]
    end

    subgraph 前端 [前端层 - Vue 3]
        Router[Vue Router]
        Views[页面视图]
        Services[API服务]
    end

    subgraph 后端 [后端层 - Spring Boot]
        Controller[控制器层]
        Service[业务层]
        Repository[数据层]
        Security[安全层]
    end

    subgraph 数据库 [数据库 - MySQL]
        DB[MySQL]
    end

    Browser --> Router
    Router --> Views
    Views --> Services
    Services --> Controller
    Security --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB
```

---

## 2. 前端架构图（页面/组件结构）

```mermaid
graph TD
    App[App.vue] --> Router[Vue Router]
    
    subgraph 公共组件
        Header[Header组件]
        Footer[Footer组件]
        SearchBar[搜索栏组件]
        ItemCard[物品卡片组件]
    end
    
    subgraph 页面视图
        Login[登录页]
        Register[注册页]
        Home[首页]
        
        subgraph 用户页面
            LostList[失物列表页]
            FoundList[招领列表页]
            Publish[发布信息页]
            MyPosts[我的发布页]
        end
        
        subgraph 管理页面 
            UserManage[用户管理页]
            PostManage[信息管理页]
        end
    end
    
    subgraph 服务层 
        Api[API请求封装]
        Auth[认证服务]
        Lost[失物服务]
        Found[招领服务]
    end
    
    Router --> Login
    Router --> Register
    Router --> Home
    Router --> LostList
    Router --> FoundList
    Router --> Publish
    Router --> MyPosts
    Router --> UserManage
    Router --> PostManage
    
    Login --> Auth
    Register --> Auth
    LostList --> Lost
    FoundList --> Found
    Publish --> Lost
    Publish --> Found
    MyPosts --> Lost
    MyPosts --> Found
    UserManage --> Auth
    PostManage --> Lost
    PostManage --> Found
    
    LostList --> ItemCard
    FoundList --> ItemCard
    Home --> SearchBar
    Home --> ItemCard
    App --> Header
    App --> Footer
```

---

## 3. 后端架构图（服务/模块划分）

```mermaid
graph TD
    subgraph 客户端请求
        HTTP[HTTP Requests]
    end

    subgraph 安全过滤层
        JWT[JWT过滤器]
        CORS[跨域配置]
    end

    subgraph 控制器层
        AuthC[认证控制器<br/>登录/注册]
        UserC[用户控制器<br/>用户管理]
        LostC[失物控制器<br/>失物CRUD]
        FoundC[招领控制器<br/>招领CRUD]
        AdminC[管理控制器<br/>系统管理]
    end

    subgraph 业务逻辑层
        AuthS[认证服务<br/>JWT生成/验证]
        UserS[用户服务<br/>用户业务逻辑]
        ItemS[物品服务<br/>物品业务逻辑]
    end

    subgraph 数据访问层
        UserR[用户Repository]
        LostR[失物Repository]
        FoundR[招领Repository]
        LogR[日志Repository]
    end

    subgraph 工具类层
        JwtUtil[JWT工具类]
        ResponseUtil[响应工具类]
    end

    HTTP --> JWT
    JWT --> CORS
    CORS --> 控制器层
    
    控制器层 --> 业务逻辑层
    业务逻辑层 --> 数据访问层
    业务逻辑层 --> 工具类层
    
    数据访问层 --> MySQL[(MySQL数据库)]
```

---

## 4. 数据库ER图

```mermaid
erDiagram
    USER ||--o{ LOST_ITEM : 发布
    USER ||--o{ FOUND_ITEM : 发布
    USER ||--o{ ADMIN_LOG : 操作
    ADMIN ||--o{ ADMIN_LOG : 记录
    
    USER {
        BIGINT id PK
        VARCHAR username
        VARCHAR password
        VARCHAR contact
        VARCHAR role
        DATETIME create_time
    }
    
    LOST_ITEM {
        BIGINT id PK
        VARCHAR title
        VARCHAR category
        VARCHAR lost_location
        DATETIME lost_time
        TEXT description
        VARCHAR image_url
        INT status
        BIGINT user_id FK
        DATETIME create_time
    }
    
    FOUND_ITEM {
        BIGINT id PK
        VARCHAR title
        VARCHAR category
        VARCHAR found_location
        DATETIME found_time
        TEXT description
        VARCHAR image_url
        INT status
        BIGINT user_id FK
        DATETIME create_time
    }
    
    ADMIN_LOG {
        BIGINT id PK
        BIGINT admin_id FK
        VARCHAR operation
        DATETIME create_time
    }
    
    ADMIN {
        BIGINT id PK
        VARCHAR username
        VARCHAR password
        VARCHAR role
    }
```

---

## 5. 系统交互流程图（用户发布失物信息）

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端(Vue)
    participant Backend as 后端(Spring Boot)
    participant Database as 数据库(MySQL)
    
    User->>Frontend: 1. 填写失物信息
    User->>Frontend: 2. 点击发布
    
    Frontend->>Frontend: 3. 表单验证
    Frontend->>Frontend: 4. 从localStorage获取Token
    
    Frontend->>Backend: 5. POST /api/lost-items\n(携带Token)
    
    Backend->>Backend: 6. JwtFilter验证Token
    alt Token无效/过期
        Backend-->>Frontend: 7. 返回401未授权
        Frontend-->>User: 8. 跳转到登录页
    else Token有效
        Backend->>Backend: 9. 从Token解析用户ID
        Backend->>Backend: 10. 业务逻辑处理
        Backend->>Database: 11. INSERT INTO lost_item
        Database-->>Backend: 12. 返回插入结果
        
        alt 发布成功
            Backend-->>Frontend: 13. 返回201 Created\n{code:200, data, message}
            Frontend-->>User: 14. 显示发布成功
            Frontend->>Frontend: 15. 跳转到失物列表页
        else 发布失败
            Backend-->>Frontend: 13. 返回400错误
            Frontend-->>User: 14. 显示错误信息
        end
    end
```

---

## 6. 系统交互流程图（用户搜索招领信息）

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端(Vue)
    participant Backend as 后端(Spring Boot)
    participant Database as 数据库(MySQL)
    
    User->>Frontend: 1. 输入搜索关键词
    User->>Frontend: 2. 选择分类筛选
    User->>Frontend: 3. 选择状态筛选
    
    Note over Frontend: 4. computed计算属性\n实时过滤本地数据
    
    alt 需要从后端获取新数据
        Frontend->>Backend: 5. GET /api/found-items\n?keyword=xxx&category=xxx
        Backend->>Database: 6. SELECT * FROM found_item
        Database-->>Backend: 7. 返回数据
        Backend-->>Frontend: 8. 返回JSON数据
    end
    
    Frontend->>Frontend: 9. 多维度筛选
    Frontend-->>User: 10. 实时显示筛选结果
    
    User->>Frontend: 11. 点击查看详情
    Frontend->>Backend: 12. GET /api/found-items/{id}
    Backend->>Database: 13. 查询详情
    Database-->>Backend: 14. 返回详情数据
    Backend-->>Frontend: 15. 返回详情
    Frontend-->>User: 16. 显示详细信息
```

---

## 7. 系统交互流程图（JWT认证流程）

```mermaid
sequenceDiagram
    participant User as 用户
    participant Frontend as 前端
    participant Filter as JwtFilter
    participant Auth as 认证服务
    participant DB as 数据库
    
    User->>Frontend: 1. 输入用户名/密码
    Frontend->>Auth: 2. POST /api/auth/login
    Auth->>DB: 3. 查询用户
    DB-->>Auth: 4. 返回用户信息
    
    alt 验证成功
        Auth->>Auth: 5. JwtUtils生成Token
        Auth-->>Frontend: 6. 返回Token
        Frontend->>Frontend: 7. 存储Token
        Frontend-->>User: 8. 登录成功
    else 验证失败
        Auth-->>Frontend: 6. 返回401
        Frontend-->>User: 7. 显示错误信息
    end
    
    Note over Frontend,Filter: 后续请求
    Frontend->>Frontend: 9. Axios拦截器添加Token
    Frontend->>Filter: 10. 请求携带Authorization头
    
    Filter->>Filter: 11. 验证Token
    alt Token有效
        Filter->>Filter: 12. 设置认证信息到上下文
        Filter->>Controller: 13. 放行请求
        Controller-->>Frontend: 14. 返回业务数据
    else Token无效/过期
        Filter-->>Frontend: 15. 返回401
        Frontend-->>User: 16. 跳转到登录页
    end
```

---

## 8. 部署架构图

```mermaid
graph TB
    subgraph 用户端
        Client[浏览器]
    end
    
    subgraph 服务器
        subgraph 前端容器
            Nginx[Nginx]
            VueApp[Vue应用]
        end
        
        subgraph 后端容器
            SpringBoot[Spring Boot应用]
        end
        
        subgraph 数据库容器
            MySQL[MySQL 8.0]
        end
    end
    
    Client --> Nginx
    Nginx --> SpringBoot
    SpringBoot --> MySQL
```
