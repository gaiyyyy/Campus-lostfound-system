package com.kkk.backend.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "found_item")
public class FoundItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "found_location", length = 100)
    private String foundLocation;

    @Column(name = "found_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime foundTime;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(name = "status")
    private Integer status = 0; // 0:待认领 1:已归还

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createTime = LocalDateTime.now();

    // 关联的用户信息（非数据库字段，用于展示）
    @Transient
    private String publisherName;

    @Transient
    @JsonProperty("contact")
    private String contact;
}