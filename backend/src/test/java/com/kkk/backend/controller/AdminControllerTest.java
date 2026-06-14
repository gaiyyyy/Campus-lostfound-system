package com.kkk.backend.controller;

import com.kkk.backend.entity.FoundItem;
import com.kkk.backend.entity.LostItem;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.FoundItemRepository;
import com.kkk.backend.repository.LostItemRepository;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
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
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private LostItemRepository lostItemRepository;

    @MockBean
    private FoundItemRepository foundItemRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private JwtUtils jwtUtils;

    private User adminUser;
    private User normalUser;
    private String adminToken = "Bearer admin-token";

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setRole("admin");

        normalUser = new User();
        normalUser.setId(2L);
        normalUser.setUsername("user");
        normalUser.setRole("user");

        when(jwtUtils.getUsername(anyString())).thenReturn("admin");
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(adminUser));
    }

    // ==================== 1. 获取系统统计测试 ====================

    @Test
    void getStats_ShouldReturnStats_WhenAdmin() throws Exception {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole("admin")).thenReturn(1L);
        when(lostItemRepository.count()).thenReturn(20L);
        when(lostItemRepository.countByStatus(0)).thenReturn(15L);
        when(lostItemRepository.countByStatus(1)).thenReturn(5L);
        when(foundItemRepository.count()).thenReturn(30L);
        when(foundItemRepository.countByStatus(0)).thenReturn(20L);
        when(foundItemRepository.countByStatus(1)).thenReturn(10L);

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUsers").value(10))
                .andExpect(jsonPath("$.totalLostItems").value(20))
                .andExpect(jsonPath("$.totalFoundItems").value(30));
    }

    // ==================== 2. 管理员删除失物测试 ====================

    @Test
    void deleteLostItemByAdmin_ShouldSuccess() throws Exception {
        mockMvc.perform(delete("/api/admin/lost-items/100")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("删除成功"));
    }

    // ==================== 3. 管理员删除招领测试 ====================

    @Test
    void deleteFoundItemByAdmin_ShouldSuccess() throws Exception {
        mockMvc.perform(delete("/api/admin/found-items/100")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(content().string("删除成功"));
    }

    // ==================== 4. 获取所有用户列表测试 ====================

    @Test
    void getAllUsers_ShouldReturnUsers_WhenAdmin() throws Exception {
        when(userRepository.findAll()).thenReturn(Arrays.asList(adminUser, normalUser));

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].username").value("admin"));
    }
}