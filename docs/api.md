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

## 3. 核心接口示例

### 3.1 失物操作

#### 发布失物

```bash
POST /lost_item
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "丢失校园卡",
  "content": "图书馆三楼丢失，卡号123456",
  "status": "pending"
}
```

返回：`201 Created`，包含新发布的失物信息。

#### 获取失物列表（分页）

```bash
GET /lost_item?page=1&size=20&status=pending
Authorization: Bearer {token}
```

返回：200，包含失物数组和分页信息。

### 3.2 用户操作

#### 修改用户名

```bash
PUT /api/user/update-username
Content-Type: application/json
Authorization: Bearer {token}

{
  "newUsername": "新用户名"
}
```

返回：200，修改成功。

### 3.3 管理员操作

#### 更新用户角色

```bash
PUT /api/admin/users/1/role?role=admin
Authorization: Bearer {token}
```

返回：200，角色更新成功。

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

## 5. 错误处理

前端已通过 axios 响应拦截器统一处理错误：

- 401 错误：自动跳转到登录页，提示 “未登录或登录过期”；
- 其他错误：弹出 Element Plus 的 Message 提示框，显示后端返回的错误信息；
- 网络错误：提示 “请求失败”。