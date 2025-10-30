# syntax=docker/dockerfile:1.5
# Multi-stage build for finance-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
# Use BuildKit cache for Maven repo and add robust retry/timeouts
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -e -U \
      -DskipTests \
      -Dmaven.wagon.http.retryHandler.count=5 \
      -Dmaven.wagon.http.pool=false \
      -Dmaven.wagon.http.connectionTimeout=60000 \
      -Dmaven.wagon.http.readTimeout=600000 \
      -pl finance-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/finance-service/target/*.jar /app/app.jar
# finance-service configured on 8083
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]