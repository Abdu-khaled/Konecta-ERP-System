# Multi-stage build for hr-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -q -DskipTests -pl hr-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/hr-service/target/*.jar /app/app.jar
# hr-service configured on 8082
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]