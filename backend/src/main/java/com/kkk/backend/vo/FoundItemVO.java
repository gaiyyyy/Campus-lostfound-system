package com.kkk.backend.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.kkk.backend.entity.FoundItem;
import lombok.Data;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.ALWAYS)
public class FoundItemVO {
    private Long id;
    private String title;
    private String category;
    private String foundLocation;
    private LocalDateTime foundTime;
    private String description;
    private String imageUrl;
    private Integer status; // 0:待认领 1:已归还
    private Long userId;
    private LocalDateTime createTime;

    // 视图层额外字段
    private String publisherName;
    private String contact; // 新增：联系方式
    private Boolean isOwner;

    // 手动添加 getter 方法
    public String getContact() {
        return this.contact;
    }

    // 手动添加 setter 方法（可选，但建议添加）
    public void setContact(String contact) {
        this.contact = contact;
    }

    public static FoundItemVO from(FoundItem item, Long currentUserId, String publisherName, String contact) {
        FoundItemVO vo = new FoundItemVO();
        vo.setId(item.getId());
        vo.setTitle(item.getTitle());
        vo.setCategory(item.getCategory());
        vo.setFoundLocation(item.getFoundLocation());
        vo.setFoundTime(item.getFoundTime());
        vo.setDescription(item.getDescription());
        vo.setImageUrl(item.getImageUrl());
        vo.setStatus(item.getStatus());
        vo.setUserId(item.getUserId());
        vo.setCreateTime(item.getCreateTime());

        vo.setPublisherName(publisherName);
        vo.setContact(contact); // 设置联系方式
        vo.setIsOwner(currentUserId != null && currentUserId.equals(item.getUserId()));

        return vo;
    }
}