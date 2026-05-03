package com.kkk.backend.repository;

import com.kkk.backend.entity.FoundItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface FoundItemRepository extends JpaRepository<FoundItem, Long>, JpaSpecificationExecutor<FoundItem> {

    // 根据用户ID查询
    List<FoundItem> findByUserIdOrderByCreateTimeDesc(Long userId);

    // 根据状态查询
    List<FoundItem> findByStatusOrderByCreateTimeDesc(Integer status);

    // 根据分类查询
    List<FoundItem> findByCategoryOrderByCreateTimeDesc(String category);

    // 搜索标题或描述包含关键词的记录
    @Query("SELECT f FROM FoundItem f WHERE f.title LIKE %:keyword% OR f.description LIKE %:keyword% ORDER BY f.createTime DESC")
    List<FoundItem> searchByKeyword(@Param("keyword") String keyword);

    // 复合条件查询
    @Query("SELECT f FROM FoundItem f WHERE " +
            "(:keyword IS NULL OR f.title LIKE %:keyword% OR f.description LIKE %:keyword%) AND " +
            "(:category IS NULL OR f.category = :category) AND " +
            "(:status IS NULL OR f.status = :status) AND " +
            "(:userId IS NULL OR f.userId = :userId) " +
            "ORDER BY f.createTime DESC")
    List<FoundItem> findByConditions(@Param("keyword") String keyword,
                                     @Param("category") String category,
                                     @Param("status") Integer status,
                                     @Param("userId") Long userId);

    // 按创建时间倒序
    List<FoundItem> findAllByOrderByCreateTimeDesc();

    // 统计不同状态的数量
    long countByStatus(Integer status);

    // 更新状态
    @Modifying
    @Transactional
    @Query("UPDATE FoundItem f SET f.status = :status WHERE f.id = :id")
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    // 统计总数
    @Query("SELECT COUNT(f) FROM FoundItem f")
    long countTotal();
}