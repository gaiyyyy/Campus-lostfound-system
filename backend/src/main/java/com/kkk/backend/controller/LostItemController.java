package com.kkk.backend.controller;

import com.kkk.backend.entity.LostItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import com.kkk.backend.service.LostItemService;
import com.kkk.backend.vo.LostItemVO;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.stream.Collectors;


import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/lost_item")
public class LostItemController {

    @Autowired
    private LostItemService lostItemService;

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
     * 发布失物
     * POST /lost_item
     */
    @PostMapping
    public LostItem createLostItem(
            @RequestBody LostItem lostItem,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        return lostItemService.createLostItem(lostItem, userId);
    }

    /**
     * 编辑失物
     * PUT /lost_item/{id}
     */
    @PutMapping("/{id}")
    public LostItem updateLostItem(
            @PathVariable Long id,
            @RequestBody LostItem lostItem,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        return lostItemService.updateLostItem(id, lostItem, userId);
    }

    /**
     * 删除失物
     * DELETE /lost_item/{id}
     */
    @DeleteMapping("/{id}")
    public String deleteLostItem(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        lostItemService.deleteLostItem(id, userId);
        return "删除成功";
    }

    /**
     * 查询失物列表
     * GET /lost_item
     */
    @GetMapping
    public List<LostItemVO> getLostItemList(HttpServletRequest request) {

        List<LostItem> list = lostItemService.getLostItemList();

        Long uid = null;
        try {
            uid = getCurrentUserId(request);
        } catch (Exception ignored) {}

        final Long currentUserId = uid;

        return list.stream()
                .map(item -> {
                    String username = userRepository.findById(item.getUserId())
                            .map(User::getUsername)
                            .orElse("未知用户");

                    return LostItemVO.from(item, currentUserId, username);
                })
                .collect(Collectors.toList());
    }




    /**
     * 查询失物详情
     * GET /lost_item/{id}
     */
    @GetMapping("/{id}")
    public Map<String, Object> getLostItemDetail(
            @PathVariable Long id,
            HttpServletRequest request
    ) {
        LostItem item = lostItemService.getLostItemById(id);

        // 获取用户信息
        User user = userRepository.findById(item.getUserId())
                .orElse(new User());

        // 构建Map，确保包含所有字段
        Map<String, Object> result = new HashMap<>();

        // 基本字段
        result.put("id", item.getId());
        result.put("title", item.getTitle());
        result.put("category", item.getCategory());
        result.put("lostLocation", item.getLostLocation());
        result.put("lostTime", item.getLostTime());
        result.put("description", item.getDescription());
        result.put("imageUrl", item.getImageUrl());
        result.put("status", item.getStatus());
        result.put("userId", item.getUserId());
        result.put("createTime", item.getCreateTime());

        // 用户信息字段
        result.put("username", user.getUsername());
        result.put("contact", user.getContact() != null ? user.getContact() : "");

        // 权限信息
        Long uid = null;
        try {
            uid = getCurrentUserId(request);
        } catch (Exception ignored) {}
        result.put("isOwner", uid != null && uid.equals(item.getUserId()));

        return result;
    }



    /**
     * 更新失物状态
     * PUT /lost_item/{id}/status
     */
    @PutMapping("/{id}/status")
    public LostItem updateLostItemStatus(
            @PathVariable Long id,
            @RequestParam Integer status,
            HttpServletRequest request
    ) {
        Long userId = getCurrentUserId(request);
        return lostItemService.updateStatus(id, status, userId);
    }
}
