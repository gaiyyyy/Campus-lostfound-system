package com.kkk.backend.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MetricsService {
    private final AtomicLong totalRequests = new AtomicLong(0);
    private final AtomicLong errorRequests = new AtomicLong(0);
    private final AtomicLong totalResponseTime = new AtomicLong(0);

    public void recordRequest(long responseTimeMs, boolean isError) {
        totalRequests.incrementAndGet();
        totalResponseTime.addAndGet(responseTimeMs);
        if (isError) {
            errorRequests.incrementAndGet();
        }
    }

    public Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        long requests = totalRequests.get();
        long errors = errorRequests.get();
        long responseTime = totalResponseTime.get();

        metrics.put("total_requests", requests);
        metrics.put("error_requests", errors);
        metrics.put("error_rate", requests == 0 ? 0.0 : (double) errors / requests);
        metrics.put("average_response_time_ms", requests == 0 ? 0.0 : (double) responseTime / requests);
        return metrics;
    }
}
