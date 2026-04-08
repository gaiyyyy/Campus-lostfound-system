# 1. 使用 Java 17 运行环境（精简版）
FROM openjdk:17-jdk-slim

# 2. 设置容器内的工作目录
WORKDIR /app

# 3. 复制 jar 包到容器内
COPY target/*.jar app.jar

# 4. 暴露端口（默认 8080）
EXPOSE 8080

# 5. 启动命令：运行 jar 包
ENTRYPOINT ["java", "-jar", "app.jar"]