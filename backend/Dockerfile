# -------- Build Stage --------
FROM maven:3.8.3-openjdk-17 AS build
WORKDIR /app

# Copy your bazuyuu Maven project descriptor and sources
COPY pom.xml ./
COPY src ./src

# Build the fat JAR (skip tests for speed)
RUN mvn clean package -DskipTests

# -------- Runtime Stage --------
FROM openjdk:17-jdk-slim
WORKDIR /app

# Copy the built JAR from the previous stage
# – you can use the exact name or a wildcard if your version changes
COPY --from=build /app/target/bazuuyu-0.0.1-SNAPSHOT.jar app.jar

# Or, more flexibly:
# COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
