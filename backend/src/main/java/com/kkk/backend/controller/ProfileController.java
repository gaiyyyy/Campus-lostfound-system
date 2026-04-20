package com.kkk.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class ProfileController {

    @GetMapping("/api/profile")
    public Map<String, Object> profile(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        String role = (String) request.getAttribute("role");

        Map<String, Object> result = new HashMap<>();
        result.put("username", username);
        result.put("role", role);

        return result;
    }
}
