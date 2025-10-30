# syntax=docker/dockerfile:1.5
# Multi-stage build for auth-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
# Copy entire backend (parent and modules)
COPY . .
# Build only this module and its deps
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -e -U \
      -DskipTests \
      -Dmaven.wagon.http.retryHandler.count=5 \
      -Dmaven.wagon.http.pool=false \
      -Dmaven.wagon.http.connectionTimeout=60000 \
      -Dmaven.wagon.http.readTimeout=600000 \
      -pl auth-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/auth-service/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

