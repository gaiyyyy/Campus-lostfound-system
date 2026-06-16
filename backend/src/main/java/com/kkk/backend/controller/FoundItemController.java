package com.kkk.backend.controller;

import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import com.kkk.backend.service.FoundItemService;
import com.kkk.backend.vo.FoundItemVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/found_item")
public class FoundItemController {

    @Autowired
    private FoundItemService foundItemService;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserRepository userRepository;

    /**
     * 从请求中解析当前登录用户 ID
     */
    private Long getCurrentUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("未携带 token");
        }

        String token = authHeader.substring(7);
        String username = jwtUtils.getUsername(token);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        if (user == null) {
            throw new RuntimeException("用户不存在");
        }

        return user.getId();
    }

    /**
     * 发布招领信息
     * POST /found_item
     */
    @PostMapping
    public FoundItem createFoundItem(
            @RequestBody FoundItem foundItem,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        return foundItemService.createFoundItem(foundItem, userId);
    }

    /**
     * 编辑招领信息
     * PUT /found_item/{id}
     */
    @PutMapping("/{id}")
    public FoundItem updateFoundItem(
            @PathVariable Long id,
            @RequestBody FoundItem foundItem,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        return foundItemService.updateFoundItem(id, foundItem, userId);
    }

    /**
     * 删除招领信息
     * DELETE /found_item/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteFoundItem(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        foundItemService.deleteFoundItem(id, userId);
        return "删除成功";
    }

    /**
     * 查询招领列表
     * GET /found_item
     */
    @GetMapping
    public List<FoundItemVO> getFoundItemList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status,
            HttpServletRequest request
    ) {
        // 改为使用动态查询方法
        List<FoundItem> list = foundItemService.getFoundItemsDynamic(keyword, category, status, null);

        Long uid = null;
        try {
            uid = getCurrentUserId(request);
        } catch (Exception ignored) {}

        final Long currentUserId = uid;

        return list.stream()
                .map(item -> {
                    User user = userRepository.findById(item.getUserId())
                            .orElse(new User());  // 防止用户不存在

                    String username = user.getUsername() != null ? user.getUsername() : "未知用户";
                    String contact = user.getContact() != null ? user.getContact() : "";

                    return FoundItemVO.from(item, currentUserId, username, contact);
                })
                .collect(Collectors.toList());
    }

    /**
     * 查询招领详情
     * GET /found_item/{id}
     */
    @GetMapping("/{id}")
    public Map<String, Object> getFoundItemDetail(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        FoundItem item = foundItemService.getFoundItemById(id);

        // 构建 Map，确保所有字段都存在
        Map<String, Object> result = new HashMap<>();

        // 基本字段
        result.put("id", item.getId());
        result.put("title", item.getTitle());
        result.put("category", item.getCategory());
        result.put("foundLocation", item.getFoundLocation());
        result.put("foundTime", item.getFoundTime());
        result.put("description", item.getDescription());
        result.put("imageUrl", item.getImageUrl());
        result.put("status", item.getStatus());
        result.put("userId", item.getUserId());
        result.put("createTime", item.getCreateTime());

        // 确保 transient 字段也被放入
        result.put("publisherName", item.getPublisherName());
        result.put("contact", item.getContact());

        // 权限信息
        Long uid = null;
        try {
            uid = getCurrentUserId(request);
        } catch (Exception ignored) {}
        result.put("isOwner", uid != null && uid.equals(item.getUserId()));

        return result;
    }

    /**
     * 更新招领状态
     * PUT /found_item/{id}/status
     */
    @PutMapping("/{id}/status")
    public FoundItem updateFoundItemStatus(
            @PathVariable Long id,
            @RequestParam Integer status,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        return foundItemService.updateStatus(id, status, userId);
    }

    /**
     * 获取我发布的招领信息
     * GET /found_item/my
     */
    @GetMapping("/my")
    public List<FoundItemVO> getMyFoundItems(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);

        List<FoundItem> list = foundItemService.getUserFoundItems(userId);

        return list.stream()
                .map(item -> {
                    User user = userRepository.findById(item.getUserId())
                            .orElse(new User());  // 防止用户不存在

                    String username = user.getUsername() != null ? user.getUsername() : "未知用户";
                    String contact = user.getContact() != null ? user.getContact() : "";

                    return FoundItemVO.from(item, userId, username, contact);
                })
                .collect(Collectors.toList());
    }
}