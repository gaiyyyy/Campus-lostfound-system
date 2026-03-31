package com.kkk.backend.repository;


import com.kkk.backend.entity.LostItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostItemRepository extends JpaRepository<LostItem, Long> {

    /**
     * 根据用户 id 查询该用户发布的所有失物
     */
    List<LostItem> findByUserId(Long userId);

    /**
     * 根据状态查询失物
     * status: 0-未找回 1-已找回
     */
    List<LostItem> findByStatus(Integer status);

    /**
     * 根据用户 + 状态查询
     */
    List<LostItem> findByUserIdAndStatus(Long userId, Integer status);
}

