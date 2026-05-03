package com.kkk.backend.controller;

import com.kkk.backend.dto.FoundItemDTO;
import com.kkk.backend.dto.LostItemDTO;
import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.LostItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.FoundItemRepository;
import com.kkk.backend.repository.LostItemRepository;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")  // 允许跨域
public class AdminController {

    @Autowired
    private LostItemRepository lostItemRepository;

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    /**
     * 检查用户是否为管理员
     */
    private void checkAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("未登录");
        }

        String token = authHeader.substring(7);
        String username = jwtUtils.getUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (!"admin".equals(user.getRole())) {
            throw new RuntimeException("无管理员权限");
        }
    }

    /**
     * 获取系统统计信息
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats(HttpServletRequest request) {
        checkAdmin(request);

        Map<String, Object> stats = new HashMap<>();

        // 用户统计
        long totalUsers = userRepository.count();
        long adminUsers = userRepository.countByRole("admin");

        // 失物统计
        long totalLostItems = lostItemRepository.count();
        long pendingLostItems = lostItemRepository.countByStatus(0);  // 未找回
        long resolvedLostItems = lostItemRepository.countByStatus(1); // 已找回

        // 招领统计
        long totalFoundItems = foundItemRepository.count();
        long pendingFoundItems = foundItemRepository.countByStatus(0);  // 待认领
        long resolvedFoundItems = foundItemRepository.countByStatus(1); // 已归还

        stats.put("totalUsers", totalUsers);
        stats.put("adminUsers", adminUsers);
        stats.put("totalLostItems", totalLostItems);
        stats.put("pendingLostItems", pendingLostItems);
        stats.put("resolvedLostItems", resolvedLostItems);
        stats.put("totalFoundItems", totalFoundItems);
        stats.put("pendingFoundItems", pendingFoundItems);
        stats.put("resolvedFoundItems", resolvedFoundItems);

        return stats;
    }

    /**
     * 获取所有失物信息（管理员查看全部）
     * GET /api/admin/lost-items
     */
    @GetMapping("/lost-items")
    public List<Map<String, Object>> getAllLostItems(HttpServletRequest request) {
        checkAdmin(request);

        List<LostItem> lostItems = lostItemRepository.findAllByOrderByCreateTimeDesc();

        List<Map<String, Object>> result = new ArrayList<>();
        for (LostItem item : lostItems) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("title", item.getTitle());
            map.put("category", item.getCategory());
            map.put("lostLocation", item.getLostLocation());
            map.put("lostTime", item.getLostTime());
            map.put("description", item.getDescription());
            map.put("imageUrl", item.getImageUrl());
            map.put("status", item.getStatus());
            map.put("userId", item.getUserId());
            map.put("createTime", item.getCreateTime());

            // 关键：添加username字段
            if (item.getUserId() != null) {
                userRepository.findById(item.getUserId()).ifPresent(user -> {
                    map.put("username", user.getUsername());
                });
            }

            result.add(map);
        }
        return result;
    }


    /**
     * 获取所有招领信息（管理员查看全部）
     * GET /api/admin/found-items
     */
    @GetMapping("/found-items")
    public List<Map<String, Object>> getAllFoundItems(HttpServletRequest request) {
        checkAdmin(request);

        List<FoundItem> foundItems = foundItemRepository.findAllByOrderByCreateTimeDesc();

        List<Map<String, Object>> result = new ArrayList<>();
        for (FoundItem item : foundItems) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", item.getId());
            map.put("title", item.getTitle());
            map.put("category", item.getCategory());
            map.put("foundLocation", item.getFoundLocation());
            map.put("foundTime", item.getFoundTime());
            map.put("description", item.getDescription());
            map.put("imageUrl", item.getImageUrl());
            map.put("status", item.getStatus());
            map.put("userId", item.getUserId());
            map.put("createTime", item.getCreateTime());

            // 关键：添加username字段
            if (item.getUserId() != null) {
                userRepository.findById(item.getUserId()).ifPresent(user -> {
                    map.put("username", user.getUsername());
                });
            }

            result.add(map);
        }
        return result;
    }


    /**
     * 管理员删除失物信息
     * DELETE /api/admin/lost-items/{id}
     */
    @DeleteMapping("/lost-items/{id}")
    public String deleteLostItem(@PathVariable Long id, HttpServletRequest request) {
        checkAdmin(request);
        lostItemRepository.deleteById(id);
        return "删除成功";
    }

    /**
     * 管理员删除招领信息
     * DELETE /api/admin/found-items/{id}
     */
    @DeleteMapping("/found-items/{id}")
    public String deleteFoundItem(@PathVariable Long id, HttpServletRequest request) {
        checkAdmin(request);
        foundItemRepository.deleteById(id);
        return "删除成功";
    }

    /**
     * 获取所有用户列表
     * GET /api/admin/users
     */
    @GetMapping("/users")
    public List<User> getAllUsers(HttpServletRequest request) {
        checkAdmin(request);
        return userRepository.findAll();
    }

    /**
     * 设置/取消管理员权限
     * PUT /api/admin/users/{id}/role
     */
    @PutMapping("/users/{id}/role")
    public User updateUserRole(@PathVariable Long id,
                               @RequestParam String role,
                               HttpServletRequest request) {
        checkAdmin(request);

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        user.setRole(role);
        return userRepository.save(user);
    }
}