# 安全审查报告

**审查日期**：2026-5-5

**审查人员**：孔欣然

## 一、审查范围

| 模块 | 文件 |
|------|------|
| 认证与授权 | SecurityConfig.java, JwtFilter.java |
| 用户管理 | UserController.java, ProfileController.java |
| 失物管理 | LostItemController.java, LostItemService.java |
| 招领管理 | FoundItemController.java, FoundItemService.java |
| 管理员功能 | AdminController.java |
| 数据访问层 | FoundItemRepository.java, LostItemRepository.java, UserRepository.java |



## 二、发现的问题

### 问题 1：SQL LIKE 注入风险

| 项目 | 内容 |
|------|------|
| **文件** | `FoundItemRepository.java` |
| **漏洞类型** | 注入漏洞（LIKE 通配符注入） |
| **危害等级** | 🟡 中 |
| **OWASP 类别** | A03:2021 – 注入漏洞 |

**问题描述**：
Repository 中的 `@Query` 使用了 `LIKE %:keyword%`，虽然 JPA 会进行参数绑定，但 `%` 和 `_` 是 SQL LIKE 的通配符。用户输入 `%` 或 `_` 会改变查询语义，例如输入 `%` 会匹配所有记录，造成信息泄露。

**原代码**：

```java
@Query("SELECT f FROM FoundItem f WHERE " +
        "(:keyword IS NULL OR f.title LIKE %:keyword% OR f.description LIKE %:keyword%)")
List<FoundItem> findByConditions(@Param("keyword") String keyword);
```

**修复方案**：
使用 ESCAPE 子句转义通配符，在 Service 层对输入进行转义处理。

**修复后代码**：

新增工具类 `JpaUtils.java`：
```java
package com.kkk.backend.util;

public class JpaUtils {
    public static String escapeLikeKeyword(String keyword) {
        if (keyword == null) return null;
        return keyword
                .replace("\\", "\\\\")
                .replace("%", "\\%")
                .replace("_", "\\_");
    }
}
```

修改 Repository 查询（添加 ESCAPE `'\\'`）：
```java
@Query("SELECT f FROM FoundItem f WHERE " +
        "(:keyword IS NULL OR f.title LIKE %:keyword% ESCAPE '\\' OR f.description LIKE %:keyword% ESCAPE '\\') AND " +
        "(:category IS NULL OR f.category = :category) AND " +
        "(:status IS NULL OR f.status = :status) AND " +
        "(:userId IS NULL OR f.userId = :userId) " +
        "ORDER BY f.createTime DESC")
List<FoundItem> findByConditions(@Param("keyword") String keyword,
                                 @Param("category") String category,
                                 @Param("status") Integer status,
                                 @Param("userId") Long userId);
```

Service 层调用转义：
```java
keyword = JpaUtils.escapeLikeKeyword(keyword);
```

---

### 问题 2：错误信息暴露内部细节

| 项目           | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| **文件**       | `AdminController.java`, `UserController.java`, `JwtFilter.java` 等 |
| **漏洞类型**   | 信息泄露                                                     |
| **危害等级**   | 🟡 中                                                         |
| **OWASP 类别** | A04:2021 – 不安全设计                                        |

**问题描述**：
代码中直接向客户端返回敏感错误信息，如 `"用户不存在"`、`"密码错误"`、`"未携带 token"` 等。攻击者可利用这些信息进行用户名枚举、系统信息探测。

**原代码示例**：
```java
// UserController.java
if (user == null) {
    return "用户名不存在";  // 暴露用户是否存在
}
```

**修复方案**：
使用全局异常处理器，将内部错误信息统一转换为通用信息，避免泄露细节。修改 Controller 中的错误抛出方式，保持抛出原始异常，由全局处理器统一处理。

---

### 问题 3：IDOR 越权漏洞

| 项目           | 内容                                                         |
| -------------- | ------------------------------------------------------------ |
| **文件**       | `LostItemController.java`, `FoundItemController.java` 以及对应的 Service 层 |
| **漏洞类型**   | 失效的访问控制 / IDOR                                        |
| **危害等级**   | 🟡 中                                                         |
| **OWASP 类别** | A01:2021 – 失效的访问控制                                    |

**问题描述**：
用户可以通过修改 URL 中的 ID 来操作他人的失物/招领记录。Service 层未验证操作者是否是记录的所有者。

**原代码示例**：
```java
// LostItemService.java（修复前）
public LostItem updateStatus(Long id, Integer status, Long userId) {
    LostItem item = lostItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("记录不存在"));
    item.setStatus(status);
    return lostItemRepository.save(item);
}
// 问题：没有检查 userId 是否等于 item.getUserId()
```

**修复方案**：
在 Service 层所有修改/删除操作中添加所有权验证。

**修复后代码（LostItemService.java）**：
```java
@Service
public class LostItemService {

    @Autowired
    private LostItemRepository lostItemRepository;

    // 修改失物
    public LostItem updateLostItem(Long id, LostItem updatedItem, Long userId) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        // ✅ 所有权验证
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此记录");
        }
        
        item.setTitle(updatedItem.getTitle());
        item.setCategory(updatedItem.getCategory());
        item.setLostLocation(updatedItem.getLostLocation());
        item.setLostTime(updatedItem.getLostTime());
        item.setDescription(updatedItem.getDescription());
        item.setImageUrl(updatedItem.getImageUrl());
        
        return lostItemRepository.save(item);
    }

    // 删除失物
    public void deleteLostItem(Long id, Long userId) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        // ✅ 所有权验证
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此记录");
        }
        
        lostItemRepository.deleteById(id);
    }

    // 更新状态
    public LostItem updateStatus(Long id, Integer status, Long userId) {
        LostItem item = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("记录不存在"));
        
        // ✅ 所有权验证
        if (!item.getUserId().equals(userId)) {
            throw new RuntimeException("无权操作此记录");
        }
        
        item.setStatus(status);
        return lostItemRepository.save(item);
    }
}
```

## 三、已验证的安全项（通过检查）

| 检查项               | 状态     | 说明                                        |
| -------------------- | -------- | ------------------------------------------- |
| 密码存储             | ✅ 安全   | 使用 BCryptPasswordEncoder 哈希，无明文存储 |
| SQL 注入（普通查询） | ✅ 安全   | 使用 JPA 参数化查询，无字符串拼接 SQL       |
| JWT 过期机制         | ✅ 已实现 | Token 有效期 1 小时，有过期检查             |
| 接口鉴权             | ✅ 已实现 | SecurityConfig 配置了需要认证的路径         |
| 跨域配置             | ✅ 合理   | 仅允许指定前端地址                          |
| CSRF 防护            | ✅已关闭  | REST API 无需 CSRF（使用 JWT）              |

---

## 四、总结

本次安全审查共发现 **3 个中危漏洞**，均已修复：

| 问题              | 状态                           |
| ----------------- | ------------------------------ |
| SQL LIKE 注入风险 | 已修复（添加转义 + ESCAPE）    |
| 错误信息暴露细节  | 已修复（全局异常处理器）       |
| IDOR 越权漏洞     | 已修复（Service 层所有权验证） |
