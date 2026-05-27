# 监控配置说明

本文档描述了校园失物招领系统后端（Spring Boot）的基础监控配置。

## 1. 日志管理

系统使用 `Logback` 和 `logstash-logback-encoder` 来输出结构化的 JSON 日志。

- **配置路径**：`backend/backend/src/main/resources/logback-spring.xml`
- **日志输出目标**：
  - 控制台 (Console)
  - 文件 (`logs/app.log`，支持按天滚动，保留 30 天)
- **JSON 字段**：
  - `time`: 时间戳 (UTC)
  - `level`: 日志级别
  - `message`: 日志内容
  - `module`: 日志来源模块 (Logger)

## 2. 健康检查

实现了一个自定义的 HTTP 端点用于健康检查。

- **端点**：`GET /health`
- **实现类**：`HealthController`
- **返回示例**：
  ```json
  {
      "status": "healthy",
      "timestamp": "2026-05-20T12:00:00",
      "version": "1.0.0"
  }
  ```

## 3. 基础指标收集

系统通过自定义过滤器拦截所有 HTTP 请求，以收集和记录关键的运行时指标。

- **端点**：`GET /metrics`
- **实现类**：`MetricsFilter` 和 `MetricsService`
- **收集指标**：
  - `total_requests`: 累计请求总数
  - `error_requests`: 错误请求总数 (HTTP 状态码 >= 400 或抛出异常)
  - `error_rate`: 错误率
  - `average_response_time_ms`: 平均响应时间 (毫秒)
- **指标日志**：
  每次请求完成后，`MetricsFilter` 都会通过结构化日志记录当前请求的 URI、HTTP 方法、状态码和响应时间。
