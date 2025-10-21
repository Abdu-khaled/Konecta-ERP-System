# Multi-stage build for auth-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
# Copy entire backend (parent and modules)
COPY . .
# Build only this module and its deps
RUN mvn -q -DskipTests -pl auth-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/auth-service/target/*.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]