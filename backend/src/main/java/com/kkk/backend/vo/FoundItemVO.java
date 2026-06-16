package com.kkk.backend.vo;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.kkk.backend.entity.FoundItem;
//import lombok.Data;
import java.time.format.DateTimeFormatter;
import java.time.LocalDateTime;

//@Data
@JsonInclude(JsonInclude.Include.ALWAYS)
public class FoundItemVO {
    private Long id;
    private String title;
    private String category;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFoundLocation() {
        return foundLocation;
    }

    public void setFoundLocation(String foundLocation) {
        this.foundLocation = foundLocation;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public LocalDateTime getFoundTime() {
        return foundTime;
    }

    public void setFoundTime(LocalDateTime foundTime) {
        this.foundTime = foundTime;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public String getPublisherName() {
        return publisherName;
    }

    public void setPublisherName(String publisherName) {
        this.publisherName = publisherName;
    }

    @JsonProperty("isOwner")
    public Boolean getOwner() {
        return isOwner;
    }

    public void setIsOwner(Boolean isOwner) {
        this.isOwner = isOwner;
    }

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