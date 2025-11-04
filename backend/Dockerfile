#Backend
# -------- Build stage --------
FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Speed up by caching dependencies
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline

# Build the app
COPY src ./src
RUN mvn -q -DskipTests package

# -------- Runtime stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar (whatever its exact name)
COPY --from=build /workspace/target/*.jar /app/app.jar

# Cloud Run injects PORT
ENV PORT=8080
EXPOSE 8080

# Cloud Run injects PORT; we also bind datasource props explicitly
ENTRYPOINT ["sh","-c","exec java \
 -Dserver.port=${PORT:-8080} \
 -Dserver.address=0.0.0.0 \
 -Dspring.datasource.url='${SPRING_DATASOURCE_URL}' \
 -Dspring.datasource.username='${SPRING_DATASOURCE_USERNAME}' \
 -Dspring.datasource.password='${SPRING_DATASOURCE_PASSWORD}' \
 -Dspring.jpa.hibernate.ddl-auto='${SPRING_JPA_HIBERNATE_DDL_AUTO:-none}' \
 -jar /app/app.jar"]