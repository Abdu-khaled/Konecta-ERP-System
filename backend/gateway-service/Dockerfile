# syntax=docker/dockerfile:1.5
# Multi-stage build for gateway-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -e -U \
      -DskipTests \
      -Dmaven.wagon.http.retryHandler.count=5 \
      -Dmaven.wagon.http.pool=false \
      -Dmaven.wagon.http.connectionTimeout=60000 \
      -Dmaven.wagon.http.readTimeout=600000 \
      -pl gateway-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/gateway-service/target/*.jar /app/app.jar
# default Spring Boot port
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
