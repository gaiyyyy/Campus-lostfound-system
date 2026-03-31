package com.kkk.backend.vo;

import com.kkk.backend.entity.LostItem;
import lombok.Data;
import java.time.format.DateTimeFormatter;

@Data
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
}
