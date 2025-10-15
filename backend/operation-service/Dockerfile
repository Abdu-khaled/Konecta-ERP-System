# Multi-stage build for operation-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
# Copy entire backend (parent and modules)
COPY . .
# Build only this module and its dependencies
RUN mvn -q -DskipTests -pl operation-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/operation-service/target/*.jar /app/app.jar
# operation-service configured on 8085
EXPOSE 8085
ENTRYPOINT ["java","-jar","/app/app.jar"]

