# ==========================================
# Stage 1: Build the JAR using Maven
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and resolve dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy src code and build the package
COPY src ./src
RUN mvn package -DskipTests

# ==========================================
# Stage 2: Runtime image
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy built JAR from Stage 1
COPY --from=build /app/target/sharefare-backend-*.jar app.jar

# Expose port (Render sets PORT env, Spring Boot reads it)
EXPOSE 8080

# Run the app
ENTRYPOINT ["java", "-jar", "app.jar"]
