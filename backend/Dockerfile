# ─── Stage 1: Build ───────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml first to cache Maven dependencies layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests -B

# ─── Stage 2: Run ─────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy only the built JAR from the build stage
COPY --from=build /app/target/restaurant-backend-1.0.0.jar app.jar

# Expose the port Render will use (via $PORT env variable)
EXPOSE 8080

# Use -Xmx400m to stay within Render's 512MB free tier RAM limit
ENTRYPOINT ["java", "-Xmx400m", "-jar", "app.jar"]
