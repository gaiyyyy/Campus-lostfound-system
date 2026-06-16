package com.kkk.backend.vo;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kkk.backend.entity.LostItem;
//import lombok.Data;
import java.time.format.DateTimeFormatter;

//@Data
public class LostItemVO {

    private Long id;
    private String title;
    private String category;
    private String lostLocation;

    private String lostTime; // 字符串显示

    private String description;
    private String imageUrl;
    private Integer status;

    private String username;
    private String contact;

    private Boolean isOwner;

    public static LostItemVO from(LostItem item, Long currentUserId, String username) {
        LostItemVO vo = new LostItemVO();
        vo.setId(item.getId());
        vo.setTitle(item.getTitle());
        vo.setCategory(item.getCategory());
        vo.setLostLocation(item.getLostLocation());
        // 转字符串
        vo.setLostTime(item.getLostTime() != null
                ? item.getLostTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
                : null);
        vo.setDescription(item.getDescription());
        vo.setImageUrl(item.getImageUrl());
        vo.setStatus(item.getStatus());
        vo.setUsername(username);
        vo.setIsOwner(currentUserId != null && item.getUserId() != null && item.getUserId().equals(currentUserId));
        return vo;
    }

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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLostTime() {
        return lostTime;
    }

    public void setLostTime(String lostTime) {
        this.lostTime = lostTime;
    }

    public String getLostLocation() {
        return lostLocation;
    }

    public void setLostLocation(String lostLocation) {
        this.lostLocation = lostLocation;
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

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    @JsonProperty("isOwner")
    public Boolean getOwner() {
        return isOwner;
    }

    public void setIsOwner(Boolean owner) {
        isOwner = owner;
    }
}
