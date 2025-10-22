# Multi-stage build for finance-service
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -q -DskipTests -pl finance-service -am package

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/finance-service/target/*.jar /app/app.jar
# finance-service configured on 8083
EXPOSE 8083
ENTRYPOINT ["java","-jar","/app/app.jar"]