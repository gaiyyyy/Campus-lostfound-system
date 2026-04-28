package com.kkk.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import com.kkk.backend.service.FoundItemService;
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
class FoundItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private FoundItemService foundItemService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtils jwtUtils;

    private FoundItem testFoundItem;
    private User testUser;
    private String mockToken = "Bearer mock-jwt-token";

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setContact("13800138000");

        testFoundItem = new FoundItem();
        testFoundItem.setId(100L);
        testFoundItem.setTitle("测试失物");
        testFoundItem.setCategory("电子产品");
        testFoundItem.setFoundLocation("图书馆");
        testFoundItem.setFoundTime(LocalDateTime.now());
        testFoundItem.setDescription("一部黑色手机");
        testFoundItem.setUserId(1L);
        testFoundItem.setStatus(0);
        testFoundItem.setCreateTime(LocalDateTime.now());
        testFoundItem.setPublisherName("testuser");
        testFoundItem.setContact("13800138000");

        when(jwtUtils.getUsername(anyString())).thenReturn("testuser");
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
    }

    // ==================== 1. 发布招领测试 ====================

    @Test
    void createFoundItem_ShouldSuccess_WhenValidData() throws Exception {
        FoundItem newItem = new FoundItem();
        newItem.setTitle("新失物");
        newItem.setCategory("证件");
        newItem.setFoundLocation("食堂");

        when(foundItemService.createFoundItem(any(FoundItem.class), eq(1L))).thenReturn(testFoundItem);

        mockMvc.perform(post("/found_item")
                        .header("Authorization", mockToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newItem)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("测试失物"));
    }

    // ==================== 2. 获取招领列表测试 ====================

    @Test
    void getFoundItemList_ShouldReturnList() throws Exception {
        List<FoundItem> items = Arrays.asList(testFoundItem);
        when(foundItemService.getFoundItemsDynamic(any(), any(), any(), any())).thenReturn(items);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/found_item")
                        .header("Authorization", mockToken)
                        .param("keyword", "手机"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100))
                .andExpect(jsonPath("$[0].title").value("测试失物"));
    }

    // ==================== 3. 获取招领详情测试 ====================

    @Test
    void getFoundItemDetail_ShouldReturnItem() throws Exception {
        when(foundItemService.getFoundItemById(100L)).thenReturn(testFoundItem);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/found_item/100")
                        .header("Authorization", mockToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.title").value("测试失物"))
                .andExpect(jsonPath("$.publisherName").value("testuser"));
    }

    // ==================== 4. 更新招领信息测试 ====================

    @Test
    void updateFoundItem_ShouldSuccess_WhenUserIsOwner() throws Exception {
        FoundItem updateData = new FoundItem();
        updateData.setTitle("更新后的标题");

        when(foundItemService.updateFoundItem(eq(100L), any(FoundItem.class), eq(1L))).thenReturn(testFoundItem);

        mockMvc.perform(put("/found_item/100")
                        .header("Authorization", mockToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateData)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100));
    }

    // ==================== 5. 删除招领信息测试 ====================

    @Test
    void deleteFoundItem_ShouldSuccess_WhenUserIsOwner() throws Exception {
        mockMvc.perform(delete("/found_item/100")
                        .header("Authorization", mockToken))
                .andExpect(status().isOk())
                .andExpect(content().string("删除成功"));
    }

    // ==================== 6. 更新招领状态测试 ====================

    @Test
    void updateFoundItemStatus_ShouldSuccess() throws Exception {
        testFoundItem.setStatus(1);
        when(foundItemService.updateStatus(eq(100L), eq(1), eq(1L))).thenReturn(testFoundItem);

        mockMvc.perform(put("/found_item/100/status")
                        .header("Authorization", mockToken)
                        .param("status", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(1));
    }

    // ==================== 7. 获取我的招领列表测试 ====================

    @Test
    void getMyFoundItems_ShouldReturnUserItems() throws Exception {
        List<FoundItem> items = Arrays.asList(testFoundItem);
        when(foundItemService.getUserFoundItems(1L)).thenReturn(items);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        mockMvc.perform(get("/found_item/my")
                        .header("Authorization", mockToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(100));
    }
}