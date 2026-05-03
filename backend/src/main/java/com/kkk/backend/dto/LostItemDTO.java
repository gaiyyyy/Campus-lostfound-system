package com.kkk.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class LostItemDTO {
    private Long id;
    private String title;
    private String category;
    private String lostLocation;
    private LocalDateTime lostTime;
    private String description;
    private String imageUrl;
    private Integer status;
    private Long userId;
    private LocalDateTime createTime;

    // 新增：用户名
    private String username;
    private String name; // 用户姓名
    private String contact;
}