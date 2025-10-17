# Multi-stage build for gateway-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -q -DskipTests -pl gateway-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/gateway-service/target/*.jar /app/app.jar
# default Spring Boot port
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]