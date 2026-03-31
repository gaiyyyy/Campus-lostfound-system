package com.kkk.backend.service;


import com.kkk.backend.entity.LostItem;
import java.util.List;

public interface LostItemService {

    /**
     * 发布失物
     */
    LostItem createLostItem(LostItem lostItem, Long userId);

    /**
     * 编辑失物信息
     */
    LostItem updateLostItem(Long id, LostItem lostItem, Long userId);

    /**
     * 删除失物
     */
    void deleteLostItem(Long id, Long userId);

    /**
     * 查询失物详情
     */
    LostItem getLostItemById(Long id);

    /**
     * 查询失物列表（全部）
     */
    List<LostItem> getLostItemList();

    /**
     * 更新失物状态（未找回 → 已找回）
     */
    LostItem updateStatus(Long id, Integer status, Long userId);
}
