package com.kkk.backend.service;

import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.FoundItemRepository;
import com.kkk.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class FoundItemService {

    @Autowired
    private FoundItemRepository foundItemRepository;

    @Autowired
    private UserRepository userRepository;

    // 发布招领信息
    @Transactional
    public FoundItem createFoundItem(FoundItem foundItem, Long userId) {
        foundItem.setUserId(userId);
        foundItem.setStatus(0);  // 默认状态：待认领
        foundItem.setCreateTime(LocalDateTime.now());
        return foundItemRepository.save(foundItem);
    }

    // 修改招领信息
    @Transactional
    public FoundItem updateFoundItem(Long id, FoundItem foundItem, Long userId) {
        // 先查询是否存在且是当前用户发布的
        FoundItem existing = foundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("招领信息不存在"));

        if (!existing.getUserId().equals(userId)) {
            throw new RuntimeException("无权限修改");
        }

        // 更新字段
        existing.setTitle(foundItem.getTitle());
        existing.setCategory(foundItem.getCategory());
        existing.setFoundLocation(foundItem.getFoundLocation());
        existing.setFoundTime(foundItem.getFoundTime());
        existing.setDescription(foundItem.getDescription());
        existing.setImageUrl(foundItem.getImageUrl());

        return foundItemRepository.save(existing);
    }

    // 删除招领信息
    @Transactional
    public void deleteFoundItem(Long id, Long userId) {
        FoundItem foundItem = foundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("招领信息不存在"));

        if (!foundItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权限删除");
        }

        foundItemRepository.deleteById(id);
    }

    // 获取招领详情（带发布者信息）
    public FoundItem getFoundItemById(Long id) {
        Optional<FoundItem> foundItemOpt = foundItemRepository.findById(id);
        if (foundItemOpt.isEmpty()) {
            return null;
        }

        FoundItem foundItem = foundItemOpt.get();
        // 获取发布者信息
        Optional<User> userOpt = userRepository.findById(foundItem.getUserId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            foundItem.setPublisherName(user.getUsername());
            foundItem.setContact(user.getContact());
        }

        return foundItem;
    }

    // 获取招领列表（带分页和筛选）
    public List<FoundItem> getFoundItems(String keyword, String category, Integer status, Long userId) {
        List<FoundItem> foundItems = foundItemRepository.findByConditions(keyword, category, status, userId);

        // 为每个招领信息添加发布者信息
        for (FoundItem item : foundItems) {
            Optional<User> userOpt = userRepository.findById(item.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                item.setPublisherName(user.getUsername());
                item.setContact(user.getContact());
            }
        }

        return foundItems;
    }

    // 获取招领列表（使用Specification动态查询）
    public List<FoundItem> getFoundItemsDynamic(String keyword, String category, Integer status, Long userId) {
        Specification<FoundItem> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 关键词搜索（标题或描述）
            if (StringUtils.hasText(keyword)) {
                Predicate titlePredicate = criteriaBuilder.like(root.get("title"), "%" + keyword + "%");
                Predicate descPredicate = criteriaBuilder.like(root.get("description"), "%" + keyword + "%");
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
            }

            // 分类筛选
            if (StringUtils.hasText(category)) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // 状态筛选
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            // 用户ID筛选（用于个人中心）
            if (userId != null) {
                predicates.add(criteriaBuilder.equal(root.get("userId"), userId));
            }

            // 按创建时间倒序排序
            query.orderBy(criteriaBuilder.desc(root.get("createTime")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        List<FoundItem> foundItems = foundItemRepository.findAll(spec);

        // 为每个招领信息添加发布者信息
        for (FoundItem item : foundItems) {
            Optional<User> userOpt = userRepository.findById(item.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                item.setPublisherName(user.getUsername());
                item.setContact(user.getContact());
            }
        }

        return foundItems;
    }

    // 更新状态
    @Transactional
    public FoundItem updateStatus(Long id, Integer status, Long userId) {
        FoundItem foundItem = foundItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("招领信息不存在"));

        // 如果是用户操作，检查权限
        if (!foundItem.getUserId().equals(userId)) {
            throw new RuntimeException("无权限操作");
        }

        foundItem.setStatus(status);
        return foundItemRepository.save(foundItem);
    }

    // 获取用户发布的招领信息
    public List<FoundItem> getUserFoundItems(Long userId) {
        List<FoundItem> foundItems = foundItemRepository.findByUserIdOrderByCreateTimeDesc(userId);

        // 添加发布者信息
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            for (FoundItem item : foundItems) {
                item.setPublisherName(user.getUsername());
                item.setContact(user.getContact());
            }
        }

        return foundItems;
    }

    // 获取所有招领信息（用于管理员）
    public List<FoundItem> getAllFoundItems() {
        List<FoundItem> foundItems = foundItemRepository.findAll();

        // 为每个招领信息添加发布者信息
        for (FoundItem item : foundItems) {
            Optional<User> userOpt = userRepository.findById(item.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                item.setPublisherName(user.getUsername());
                item.setContact(user.getContact());
            }
        }

        return foundItems;
    }

    // 统计总数
    public long getTotalCount() {
        return foundItemRepository.countTotal();
    }

    // 分页查询
    public Page<FoundItem> getFoundItemsPage(String keyword, String category, Integer status,
                                             int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Specification<FoundItem> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                Predicate titlePredicate = criteriaBuilder.like(root.get("title"), "%" + keyword + "%");
                Predicate descPredicate = criteriaBuilder.like(root.get("description"), "%" + keyword + "%");
                predicates.add(criteriaBuilder.or(titlePredicate, descPredicate));
            }

            if (StringUtils.hasText(category)) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            query.orderBy(criteriaBuilder.desc(root.get("createTime")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Page<FoundItem> pageResult = foundItemRepository.findAll(spec, pageable);

        // 为每个招领信息添加发布者信息
        for (FoundItem item : pageResult.getContent()) {
            Optional<User> userOpt = userRepository.findById(item.getUserId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                item.setPublisherName(user.getUsername());
                item.setContact(user.getContact());
            }
        }

        return pageResult;
    }
}