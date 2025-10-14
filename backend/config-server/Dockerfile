# # Multi-stage build for config-server
# FROM maven:3.9.6-eclipse-temurin-21 AS builder
# WORKDIR /workspace
# COPY . .
# RUN mvn -q -DskipTests -pl config-server -am package

# FROM eclipse-temurin:21-jre
# WORKDIR /app
# COPY --from=builder /workspace/config-server/target/*.jar /app/app.jar
# # map externally to 8888 in compose if desired
# EXPOSE 8080
# ENTRYPOINT ["java","-jar","/app/app.jar"]


# Stage 1: Build all modules
FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /workspace
COPY . .
RUN mvn -B clean package -DskipTests -pl config-server

# Stage 2: Prepare runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /workspace/config-server/target/*.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]

