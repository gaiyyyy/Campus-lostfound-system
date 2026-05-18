# 第一阶段：构建阶段
FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# 复制子目录 backend 中的 pom.xml
COPY backend/backend/pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码
COPY backend/backend/src ./src

# 打包
RUN mvn clean package -DskipTests -B

# 第二阶段：运行阶段
FROM eclipse-temurin:17-jre-alpine

# 创建非 root 用户
RUN addgroup -S spring && adduser -S spring -G spring

USER spring:spring

WORKDIR /app

# 复制 Jar 包（注意路径）
COPY --from=builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-Xmx256m", "-XX:+UseG1GC", "-jar", "app.jar"]