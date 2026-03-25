# 数据库设计文档 - 校园失物招领系统

## 数据库ER图

![image-20260318111203537](.\images\database-ER.png)

## 数据表详细设计

### 1.用户表 (user)

#### 表用途

存储系统用户的基本信息与角色类型。

#### 字段设计

| 字段名      | 类型         | 说明                     |
| ----------- | ------------ | ------------------------ |
| id          | BIGINT       | 主键，自增               |
| username    | VARCHAR(50)  | 用户名                   |
| password    | VARCHAR(255) | 密码（加密存储）         |
| contact     | VARCHAR(100) | 联系方式（微信号）       |
| role        | VARCHAR(20)  | 用户角色（user / admin） |
| create_time | DATETIME     | 注册时间                 |

### 2.失物信息表 (lost_item)

#### 表用途

记录用户发布的失物信息。

#### 字段设计

| 字段名        | 类型         | 说明                        |
| ------------- | ------------ | --------------------------- |
| id            | BIGINT       | 主键                        |
| title         | VARCHAR(100) | 失物标题                    |
| category      | VARCHAR(50)  | 物品类别                    |
| lost_location | VARCHAR(100) | 丢失地点                    |
| lost_time     | DATETIME     | 丢失时间                    |
| description   | TEXT         | 详细描述                    |
| image_url     | VARCHAR(255) | 图片路径                    |
| status        | INT          | 状态（0 未找回 / 1 已找回） |
| user_id       | BIGINT       | 发布者 ID                   |
| create_time   | DATETIME     | 发布时间                    |

### 3.招领信息表 (found_item)

#### 表用途

记录用户发布的招领信息。

#### 字段设计

| 字段名         | 类型         | 说明                        |
| -------------- | ------------ | --------------------------- |
| id             | BIGINT       | 主键                        |
| title          | VARCHAR(100) | 招领标题                    |
| category       | VARCHAR(50)  | 物品类别                    |
| found_location | VARCHAR(100) | 捡到地点                    |
| found_time     | DATETIME     | 捡到时间                    |
| description    | TEXT         | 描述（可模糊）              |
| image_url      | VARCHAR(255) | 图片路径                    |
| status         | INT          | 状态（0 未认领 / 1 已认领） |
| user_id        | BIGINT       | 发布者 ID                   |
| create_time    | DATETIME     | 发布时间                    |

#### 设计说明

招领信息在描述字段上不强制填写完整特征信息，以防止冒领行为。

### 数据库关系说明

- user 与 lost_item：一对多
- user 与 found_item：一对多
- 失物信息与招领信息互不直接关联，通过人工匹配完成

## 建表SQL脚本

```sql
CREATE TABLE user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  contact VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lost_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  lost_location VARCHAR(100),
  lost_time DATETIME,
  description TEXT,
  image_url VARCHAR(255),
  status INT DEFAULT 0,
  user_id BIGINT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE found_item (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  found_location VARCHAR(100),
  found_time DATETIME,
  description TEXT,
  image_url VARCHAR(255),
  status INT DEFAULT 0,
  user_id BIGINT,
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

```

