package com.kkk.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kkk.backend.entity.LostItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import com.kkk.backend.service.LostItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class LostItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private LostItemService lostItemService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtils jwtUtils;

    private LostItem testLostItem;
    private User testUser;
    private String mockToken = "Bearer mock-jwt-token";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setContact("13800138000");

        testLostItem = new LostItem();
        testLostItem.setId(100L);
        testLostItem.setTitle("丢失的钱包");
        testLostItem.setCategory("钱包");
        testLostItem.setLostLocation("操场");
        testLostItem.setLostTime(LocalDateTime.now());
        testLostItem.setDescription("黑色皮质钱包");
        testLostItem.setUserId(1L);
        testLostItem.setStatus(0);
        testLostItem.setCreateTime(LocalDateTime.now());

        when(jwtUtils.getUsername(anyString())).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
    }

    // ==================== 1. 发布失物测试 ====================

    @Test
    void createLostItem_ShouldSuccess_WhenValidData() throws Exception {
        LostItem newItem = new LostItem();
        newItem.setTitle("新失物");
        newItem.setCategory("钥匙");
        newItem.setLostLocation("教学楼");

        when(lostItemService.createLostItem(any(LostItem.class), eq(1L))).thenReturn(testLostItem);

        mockMvc.perform(post("/lost_item")
                        .header("Authorization", mockToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newItem)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("丢失的钱包"));
    }

    // ==================== 2. 获取失物列表测试 ====================

    @Test
    void getLostItemList_ShouldReturnList() throws Exception {
        List<LostItem> items = Arrays.asList(testLostItem);
        when(lostItemService.getLostItemList()).thenReturn(items);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/lost_item")
                        .header("Authorization", mockToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].title").value("丢失的钱包"));
    }

    // ==================== 3. 获取失物详情测试 ====================

    @Test
    void getLostItemDetail_ShouldReturnItem() throws Exception {
        when(lostItemService.getLostItemById(100L)).thenReturn(testLostItem);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/lost_item/100")
                        .header("Authorization", mockToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("丢失的钱包"))
                .andExpect(jsonPath("$.username").value("testuser"));
    }

    // ==================== 4. 更新失物信息测试 ====================

    @Test
    void updateLostItem_ShouldSuccess_WhenUserIsOwner() throws Exception {
        LostItem updateData = new LostItem();
        updateData.setTitle("更新后的标题");

        when(lostItemService.updateLostItem(eq(100L), any(LostItem.class), eq(1L))).thenReturn(testLostItem);

        mockMvc.perform(put("/lost_item/100")
                        .header("Authorization", mockToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100));
    }

    // ==================== 5. 删除失物信息测试 ====================

    @Test
    void deleteLostItem_ShouldSuccess_WhenUserIsOwner() throws Exception {
        mockMvc.perform(delete("/lost_item/100")
                        .header("Authorization", mockToken))
                .andExpect(status().isOk())
                .andExpect(content().string("删除成功"));
    }

    // ==================== 6. 更新失物状态测试 ====================

    @Test
    void updateLostItemStatus_ShouldSuccess() throws Exception {
        testLostItem.setStatus(1);
        when(lostItemService.updateStatus(eq(100L), eq(1), eq(1L))).thenReturn(testLostItem);

        mockMvc.perform(put("/lost_item/100/status")
                        .header("Authorization", mockToken)
                        .param("status", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(1));
    }
}