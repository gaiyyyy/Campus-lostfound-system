package com.kkk.backend.controller;

import com.kkk.backend.dto.RegisterRequest;
import com.kkk.backend.entity.User;
import com.kkk.backend.repository.UserRepository;
import com.kkk.backend.security.JwtUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) return "用户名或密码不能为空";
        if (userRepository.findByUsername(request.getUsername()).isPresent()) return "用户名已存在";

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword())); // 加密
        user.setContact(request.getContact());
        user.setRole("user");
        user.setCreateTime(LocalDateTime.now());

        userRepository.save(user);
        return "注册成功";
    }

    @PostMapping("/login")
    public Object login(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "用户名或密码不能为空");
            return error;
        }

        User user = userRepository.findByUsername(request.getUsername()).orElse(null);
        if (user == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "用户名不存在");
            return error;
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "密码错误");
            return error;
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole());
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("username", user.getUsername());
        result.put("role", user.getRole());
        return result;
    }


    @PutMapping("/user/update-username")
    public Map<String, String> updateUsername(@RequestBody Map<String, String> body,
                                              HttpServletRequest request) {
        String newUsername = body.get("newUsername");
        Map<String, String> result = new HashMap<>();

        if (newUsername == null || newUsername.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "用户名不能为空");
            return error;
        }

        // 获取当前用户
        String currentUsername = (String) request.getAttribute("username");
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查新用户名是否已存在
        if (userRepository.findByUsername(newUsername).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "用户名已存在");
            return error;
        }

        user.setUsername(newUsername);
        userRepository.save(user);

        result.put("message", "修改成功");
        result.put("username", newUsername);
        return result;
    }


    @PutMapping("/user/update-password")
    public Map<String, String> updatePassword(@RequestBody Map<String, String> body,
                                              HttpServletRequest request) {
        String oldPassword = body.get("oldPassword");
        String newPassword = body.get("newPassword");
        Map<String, String> result = new HashMap<>();

        if (oldPassword == null || newPassword == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "密码不能为空");
            return error;
        }

        // 获取当前用户
        String currentUsername = (String) request.getAttribute("username");
        User user = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 校验旧密码
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "旧密码错误");
            return error;
        }

        // 新旧密码不能相同
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "新旧密码不能相同");
            return error;
        }

        // 更新密码
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        result.put("message", "修改成功");
        return result;
    }


}


