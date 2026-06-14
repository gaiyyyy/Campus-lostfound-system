package com.kkk.backend.config;

import com.kkk.backend.service.MetricsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class MetricsFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(MetricsFilter.class);
    private final MetricsService metricsService;

    public MetricsFilter(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        long startTime = System.currentTimeMillis();
        boolean isError = false;

        try {
            filterChain.doFilter(request, response);
            if (response.getStatus() >= 400) {
                isError = true;
            }
        } catch (Exception e) {
            isError = true;
            throw e;
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            metricsService.recordRequest(duration, isError);

            logger.info("Request metrics: URI={}, Method={}, Status={}, Duration={}ms",
                    request.getRequestURI(), request.getMethod(), response.getStatus(), duration);
        }
    }
}
