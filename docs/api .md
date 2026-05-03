# 失物招领系统 API 使用说明

## 1. 基础配置

### 1.1 服务地址

本地开发地址：`http://localhost:8080`

### 1.2 认证方式

采用**JWT Bearer 认证**，登录后获取`token`，在请求头中携带：

```plaintext
Authorization: Bearer {your_token}
```

前端已通过 axios 拦截器自动添加，无需手动处理。

### 1.3 数据格式

- 请求格式：`application/json`
- 响应格式：统一 JSON 格式，包含`code`（状态码）、`data`（返回数据）、`message`（提示信息，错误时必返）

### 1.4 通用状态码

| 状态码 |              说明               |
| :----: | :-----------------------------: |
|  200   |            操作成功             |
|  201   |         创建 / 发布成功         |
|  400   |   请求参数错误 / 业务逻辑错误   |
|  401   | 未登录 / 登录过期 / Ttoken 无效 |
|  404   |           资源不存在            |
|  500   |         服务器内部错误          |

## 2. 使用规则

1. 所有需要分页的接口，默认`page=1`、`size=10`，可通过查询参数自定义；
2. 筛选接口通过查询参数传递筛选条件（如`status=pending`）；
3. 管理员接口仅`admin`角色可访问，普通用户访问返回 401/403；
4. 所有修改 / 删除 / 发布接口均需要认证，未登录返回 401。

## 3. 核心接口

### 3.1 失物操作

#### 发布失物

```bash
POST /api/lost_items
请求体：title, content, category, lostLocation, lostTime, imageUrl
自动填充：userId, createTime, status=0
```

#### 获取失物列表（分页）

```bash
GET /lost_item?page=1&size=20&status=pending
Authorization: Bearer {token}
```

#### 获取单个失物详情

```
GET /api/lost_items/{id}
```

#### 修改失物信息

```
PUT /api/lost_items/{id}
```

#### 删除失物

```
DELETE /api/lost_items/{id}
权限：仅本人或管理员
```

#### 获取“我的失物”

```
GET /api/lost_items/my
```

### 3.2 用户操作

#### 用户注册

```bash
POST /api/auth/register
请求体：username, password, contact
后端：UserController.register()
加密：BCryptPasswordEncoder
自动生成：createTime、role=user
```

#### 用户登录

```bash
POST /api/auth/login
请求体：username, password
返回：token、userId、username、role
后端：UserController.login()
Token：JWT 7天有效期
```

#### 获取当前登录用户信息

```bash
GET /api/user/info
请求头：Authorization: Bearer {token}
返回：id, username, role, contact
```

#### 修改用户名

```bash
PUT /api/user/update/username
请求体：newUsername
```

#### 修改密码

```
PUT /api/user/update/password
请求体：oldPassword, newPassword
```

### 3.3寻物操作

#### 发布招领

```
POST /api/found_items
请求体：title, content, category, foundLocation, foundTime, imageUrl
自动填充：userId, createTime, status=0
```

#### 获取招领列表

```
GET /api/found_items
参数：page, size, status, category, keyword
```

#### 获取单个招领详情

```
GET /api/found_items/{id}
```

#### 修改招领

```
PUT /api/found_items/{id}
```

#### 删除招领

```
DELETE /api/found_items/{id}
权限：仅本人或管理员
```

#### 获取“我的招领”

```
GET /api/found_items/my
```



### 3.4 管理员操作

#### 查看所有用户

```
GET /api/admin/users
```

#### 删除用户

```
DELETE /api/admin/users/{id}
```

#### 更新用户角色

```bash
PUT /api/admin/users/1/role?role=admin
Authorization: Bearer {token}
```

#### 查看所有失物

```
GET /api/admin/lost-items
```

#### 查看所有招领

```
GET /api/admin/found-items
```

## 4. 前端 API 调用说明

前端已在`src/api/`目录封装所有 API，按模块划分：

- `axios.js`：全局请求 / 响应拦截器，处理认证、错误提示、路由跳转；
- `lostItem.js`：失物相关所有接口；
- `found.js`：招领相关所有接口；
- `user.js`：普通用户个人信息操作接口；
- `admin.js`：管理员专属操作接口。

**调用示例**：

```javascript
import { getLostItemList, createLostItem } from '@/api/lostItem'

// 获取失物列表
const getList = async () => {
  const res = await getLostItemList({ page: 1, size: 10 })
  console.log(res)
}

// 发布失物
const publish = async () => {
  const data = { title: '丢失钱包', content: '食堂丢失' }
  await createLostItem(data)
}
```

## 5.后端 API 调用说明

### 5.1 后端技术实现基础

- 核心框架：Spring Boot（Java 17+）
- 数据访问：Spring Data JPA
- 认证鉴权：Spring Security + JWT（HS256 签名）
- 密码加密：BCrypt 加密算法（不可逆加密）
- 接口统一前缀：无全局前缀，接口路径直接为`/api/*`/`/lost_item`/`/found_item`

### 5.2 后端接口核心调用规则

1. **JWT 令牌携带**：所有需要认证的接口，请求头必须携带`Authorization: Bearer {token}`，token 由`/api/login`接口登录成功后返回；

2. **用户身份自动解析**：后端通过 JwtFilter 拦截器从 token 中解析用户名 / 角色，无需前端传参，接口内通过`request.getAttribute("username")`获取当前用户；

3. **资源归属校验**：编辑 / 删除 / 更新状态接口，后端会自动校验操作人 ID 与发布者 ID（userId）是否一致，非发布者操作返回权限错误；

4. **自动填充字段**：发布失物 / 招领、注册用户时，`id`/`createTime`/`userId`/`role`（默认 user）由后端自动生成，**前端无需传参**；

5. 时间格式规范：后端接收 / 返回的时间字段为LocalDateTime类型，统一格式为：

   - 失物丢失时间：`yyyy-MM-dd HH:mm`
   - 招领捡拾时间 / 所有创建时间：`yyyy-MM-dd HH:mm:ss`

   

6. **图片字段处理**：`imageUrl`字段为图片访问路径，由后端处理图片上传后返回，前端仅需存储 / 传递该路径即可。

### 5.3 后端接口与代码映射

所有接口均对应后端`controller`层实现，核心映射关系：

- 用户认证 / 信息操作：`UserController.java`（/api/register、/api/login、/api/user/*）
- 个人信息查询：`ProfileController.java`（/api/profile）
- 失物相关操作：`LostItemController.java`（/lost_item/*）
- 招领相关操作：`FoundItemController.java`（/found_item/*）
- 管理员专属操作：`AdminController.java`（/api/admin/*）

## 6. 前端错误处理

前端已通过 axios 响应拦截器统一处理错误：

- 401 错误：自动跳转到登录页，提示 “未登录或登录过期”；
- 其他错误：弹出 Element Plus 的 Message 提示框，显示后端返回的错误信息；
- 网络错误：提示 “请求失败”。

## 7.后端错误处理

### 7.1 后端错误处理机制

后端采用全局异常拦截 + 接口内手动校验的双重错误处理方式，所有错误均返回统一格式的 JSON 数据（部分简单接口直接返回错误字符串，前端可统一解析），保证前端能一致处理错误信息。

### 7.2 后端统一错误返回格式

#### 格式 1：JSON 标准错误（大部分接口采用，如登录、修改信息）

```json
{
  "message": "具体错误描述"
}
```

#### 格式 2：字符串错误（简单操作接口，如删除、注册）

```
"用户名已存在" / "删除成功" / "未携带 token"
```

#### 格式 3：运行时异常（权限 / 资源不存在，后端自动抛出）

```json
{
  "timestamp": "时间戳",
  "status": 500/403/401,
  "error": "错误类型",
  "message": "具体错误信息",
  "path": "请求接口路径"
}
```