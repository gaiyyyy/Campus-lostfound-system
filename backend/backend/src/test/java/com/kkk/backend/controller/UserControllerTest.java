package com.kkk.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private JwtUtils jwtUtils;

    private User testUser;
    private Map<String, String> loginRequest;
    private Map<String, String> registerRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setContact("13800138000");
        testUser.setRole("user");

        loginRequest = new HashMap<>();
        loginRequest.put("username", "testuser");
        loginRequest.put("password", "123456");

        registerRequest = new HashMap<>();
        registerRequest.put("username", "newuser");
        registerRequest.put("password", "123456");
        registerRequest.put("contact", "13900139000");
    }

    // ==================== 注册测试 ====================

    @Test
    void register_ShouldSuccess_WhenValidData() throws Exception {
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("注册成功"));
    }

    @Test
    void register_ShouldReturnError_WhenUsernameExists() throws Exception {
        when(userRepository.findByUsername("newuser")).thenReturn(Optional.of(testUser));

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("用户名已存在"));
    }

    @Test
    void register_ShouldReturnError_WhenUsernameMissing() throws Exception {
        Map<String, String> invalidRequest = new HashMap<>();
        invalidRequest.put("password", "123456");

        mockMvc.perform(post("/api/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk())
                .andExpect(content().string("用户名或密码不能为空"));
    }

    // ==================== 登录测试 ====================

    @Test
    void login_ShouldReturnToken_WhenCredentialsValid() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(true);
        when(jwtUtils.generateToken("testuser", "user")).thenReturn("mock-jwt-token");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mock-jwt-token"))
                .andExpect(jsonPath("$.username").value("testuser"))
                .andExpect(jsonPath("$.role").value("user"));
    }

    @Test
    void login_ShouldReturnError_WhenUsernameNotFound() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("用户名不存在"));
    }

    @Test
    void login_ShouldReturnError_WhenPasswordWrong() throws Exception {
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("123456", "encodedPassword")).thenReturn(false);

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("密码错误"));
    }

    @Test
    void login_ShouldReturnError_WhenUsernameMissing() throws Exception {
        Map<String, String> invalidRequest = new HashMap<>();
        invalidRequest.put("password", "123456");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("用户名或密码不能为空"));
    }

    @Test
    void login_ShouldReturnError_WhenPasswordMissing() throws Exception {
        Map<String, String> invalidRequest = new HashMap<>();
        invalidRequest.put("username", "testuser");

        mockMvc.perform(post("/api/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("用户名或密码不能为空"));
    }
}