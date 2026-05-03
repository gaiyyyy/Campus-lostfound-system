package com.kkk.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {

    // 密钥，实际项目建议放在配置文件中
    private final String secret = "mySecretKey123456";

    // token 有效期，单位毫秒（这里 1 小时）
    private final long expiration = 60 * 60 * 1000;

    // 生成 token
    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    // 解析 token
    public Claims parseToken(String token) {
        return Jwts.parser()
                .setSigningKey(secret)
                .parseClaimsJws(token)
                .getBody();
    }

    // 获取用户名
    public String getUsername(String token) {
        return parseToken(token).getSubject();
    }

    // 获取角色
    public String getRole(String token) {
        return (String) parseToken(token).get("role");
    }

    // 判断是否过期
    public boolean isExpired(String token) {
        return parseToken(token).getExpiration().before(new Date());
    }
}
