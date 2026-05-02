package com.kkk.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "lost_item")
public class LostItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String category;

    private String lostLocation;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime lostTime; // 保持 LocalDateTime

    private String description;

    private String imageUrl;

    /** 0-未找回 1-已找回 */
    private Integer status;

    /** 发布用户 */
    private Long userId;

    private LocalDateTime createTime;
}
