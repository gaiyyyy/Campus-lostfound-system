package com.kkk.backend.security;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;

    public JwtFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        System.out.println("[JwtFilter] 请求路径: " + path);

        // 放行注册和登录接口，不检查 JWT
        if (path.equals("/api/login") || path.equals("/api/register")) {
            System.out.println("[JwtFilter] 放行登录/注册接口");
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        System.out.println("[JwtFilter] Authorization Header: " + authHeader);

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                System.out.println("[JwtFilter] 解析 Token: " + token);

                if (!jwtUtils.isExpired(token)) {
                    String username = jwtUtils.getUsername(token);
                    String role = jwtUtils.getRole(token);

                    System.out.println("[JwtFilter] Token 用户名: " + username + ", 角色: " + role);

                    List<SimpleGrantedAuthority> authorities =
                            Arrays.asList(new SimpleGrantedAuthority("ROLE_" + role));

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(username, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(authToken);

                    request.setAttribute("username", username);
                    request.setAttribute("role", role);

                } else {
                    System.out.println("[JwtFilter] Token 已过期");
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.getWriter().write("Token 已过期");
                    return;
                }
            } catch (Exception e) {
                System.out.println("[JwtFilter] Token 解析异常: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("无效的 Token");
                return;
            }
        } else {
            System.out.println("[JwtFilter] 未携带 Bearer Token 或格式错误");
        }

        filterChain.doFilter(request, response);
    }

}
