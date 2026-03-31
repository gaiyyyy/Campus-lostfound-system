package com.kkk.backend.service.impl;

import com.kkk.backend.entity.LostItem;
import com.kkk.backend.repository.LostItemRepository;
import com.kkk.backend.service.LostItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LostItemServiceImpl implements LostItemService {

    @Autowired
    private LostItemRepository lostItemRepository;

    /**
     * 发布失物
     */
    @Override
    public LostItem createLostItem(LostItem lostItem, Long userId) {
        lostItem.setId(null);               // 防止前端乱传 id
        lostItem.setUserId(userId);         // 绑定当前用户
        lostItem.setStatus(0);              // 默认：未找回
        lostItem.setCreateTime(LocalDateTime.now());

        return lostItemRepository.save(lostItem);
    }

    /**
     * 编辑失物
     */
    @Override
    public LostItem updateLostItem(Long id, LostItem lostItem, Long userId) {
        LostItem dbItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("失物不存在"));

        // 权限校验：只能操作自己的失物
        if (!dbItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改该失物信息");
        }

        // 更新允许修改的字段
        dbItem.setTitle(lostItem.getTitle());
        dbItem.setCategory(lostItem.getCategory());
        dbItem.setLostLocation(lostItem.getLostLocation());
        dbItem.setLostTime(lostItem.getLostTime());
        dbItem.setDescription(lostItem.getDescription());
        dbItem.setImageUrl(lostItem.getImageUrl());

        return lostItemRepository.save(dbItem);
    }

    /**
     * 删除失物
     */
    @Override
    public void deleteLostItem(Long id, Long userId) {
        LostItem dbItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("失物不存在"));

        // 权限校验
        if (!dbItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权限删除该失物");
        }

        lostItemRepository.deleteById(id);
    }

    /**
     * 查询详情
     */
    @Override
    public LostItem getLostItemById(Long id) {
        return lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("失物不存在"));
    }

    /**
     * 查询列表
     */
    @Override
    public List<LostItem> getLostItemList() {
        return lostItemRepository.findAll();
    }

    /**
     * 更新失物状态
     */
    @Override
    public LostItem updateStatus(Long id, Integer status, Long userId) {
        LostItem dbItem = lostItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("失物不存在"));

        if (!dbItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权限更新失物状态");
        }

        dbItem.setStatus(status);
        return lostItemRepository.save(dbItem);
    }
}

