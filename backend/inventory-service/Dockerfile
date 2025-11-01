# syntax=docker/dockerfile:1.5
# Multi-stage build for inventory-service (match other services)
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
# Build context is backend/, so copy all modules
COPY . .
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -e -U \
      -DskipTests \
      -Dmaven.wagon.http.retryHandler.count=5 \
      -Dmaven.wagon.http.pool=false \
      -Dmaven.wagon.http.connectionTimeout=60000 \
      -Dmaven.wagon.http.readTimeout=600000 \
      -pl inventory-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/inventory-service/target/*.jar /app/app.jar
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app/app.jar"]

