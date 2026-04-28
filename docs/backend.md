# 校园失物招领系统 - 后端模块说明文档

## 模块功能

### 1.用户认证与鉴权

- 用户注册、登录
- 基于 JWT 的令牌生成与验证
- 用户角色区分（普通用户 user / 管理员 admin）
- 接口权限控制（Spring Security）

### 2.用户管理

- 用户信息查询与修改
- 修改密码/用户名
- 管理员可查看所有用户信息并进行管理

### 3.失物信息管理

- 发布失物信息
- 查看所有失物信息
- 修改/删除自己发布的失物信息
- 管理员可管理所有失物信息

### 4.招领信息管理

- 发布招领信息
- 查看所有招领信息
- 修改/删除自己发布的招领信息
- 管理员可管理所有招领信息

### 5.管理员功能

- 用户管理（查看、禁用、删除）

- 所有失物/招领信息审核与管理

- 操作日志记录

  

## 技术选型

| 技术                  | 说明     |
| --------------------- | -------- |
| Java                  | 开发语言 |
| SpringBoot            | 核心框架 |
| Spring Security + JWT | 安全框架 |
| MySQL                 | 数据库   |
| Maven                 | 构建工具 |
| 全局 CORS 配置        | 跨域处理 |
| Git + GitHub          | 版本控制 |



## 目录结构

```
backend/
├── src/main/java/com/lostfound/
│   ├── controller/                      # 接口层
│   │   ├── AuthController.java          # 认证相关接口         
│   │   ├── UserController.java          # 用户管理接口
│   │   ├── LostItemController.java      # 失物信息接口
│   │   ├── FoundItemController.java     # 招领信息接口
│   │   
│   ├── mapper/                          # 数据访问层
│   │   ├── UserMapper.java       
│   │   ├── LostItemMapper.java
│   │   ├── FoundItemMapper.java
│   │ 
│   ├── entity/                          # 实体类
│   │   ├── User.java
│   │   ├── LostItem.java
│   │   ├── FoundItem.java
│   │   ├── AdminLog.java
│   │ 
│   ├──  config/                         # 配置类
│   │   ├── SecurityConfig.java          # Spring Security配置    
│   │   ├── CorsConfig.java              # 跨域配置
│   │ 
│   ├── filter/                          # 过滤器
│   │   └── JwtFilter.java               # JWT令牌验证过滤器
│   │ 
│   └── utils/                           # 工具类
│
├── src/main/resources/
│   ├── application.yml                  # 主配置文件
│
├── src/test/                            # 单元测试
├── pom.xml                              # 项目依赖配置
└── README.md                            # 项目说明
```



## 运行方式

### 1.环境要求

- JDK 17 或更高版本
- MySQL 8.0 或更高版本
- Maven 3.8 或更高版本
- Git

###  2.启动项目

```
# 进入项目目录
cd backend

# 编译打包
mvn clean package

# 启动服务
java -jar target/lostfound-backend.jar
```

### 3.访问地址

- 后端 API 默认地址：`http://localhost:8080`
