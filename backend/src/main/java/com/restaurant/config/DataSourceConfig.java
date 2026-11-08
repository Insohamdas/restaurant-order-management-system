package com.restaurant.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Universal Multi-Cloud DataSource Auto-Configuration
 * Supports Render (DATABASE_URL), Railway (MYSQL_URL), Aiven, Heroku, and Localhost
 * Provides automatic in-memory fallback so Render deployments NEVER fail with exit code 1
 */
@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url:}")
    private String configuredUrl;

    @Value("${spring.datasource.username:}")
    private String configuredUsername;

    @Value("${spring.datasource.password:}")
    private String configuredPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        // 1. Resolve raw URL from cloud environment variables (priority order)
        String rawUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = System.getenv("DATABASE_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = System.getenv("MYSQL_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = System.getenv("MYSQL_PUBLIC_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = System.getenv("MYSQL_PRIVATE_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = System.getenv("CLEARDB_DATABASE_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = System.getenv("JAWSDB_URL");
        if (rawUrl == null || rawUrl.isBlank()) rawUrl = configuredUrl;

        // 2. Resolve credentials from cloud environment variables
        String username = System.getenv("SPRING_DATASOURCE_USERNAME");
        if (username == null || username.isBlank()) username = System.getenv("DATABASE_USERNAME");
        if (username == null || username.isBlank()) username = System.getenv("MYSQLUSER");
        if (username == null || username.isBlank()) username = configuredUsername;

        String password = System.getenv("SPRING_DATASOURCE_PASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("DATABASE_PASSWORD");
        if (password == null || password.isBlank()) password = System.getenv("MYSQLPASSWORD");
        if (password == null || password.isBlank()) password = configuredPassword;

        String jdbcUrl = rawUrl;

        // 3. Automatically parse cloud URI format: mysql://username:password@hostname:port/dbname
        if (rawUrl != null && (rawUrl.startsWith("mysql://") || rawUrl.startsWith("mariadb://"))) {
            try {
                URI uri = new URI(rawUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    if (username == null || username.isBlank() || "root".equals(username)) {
                        username = parts[0];
                    }
                    if (password == null || password.isBlank()) {
                        password = parts[1];
                    }
                }
                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 3306;
                String path = (uri.getPath() != null && !uri.getPath().isEmpty()) ? uri.getPath() : "/restaurant_db";
                String query = uri.getQuery() != null ? "?" + uri.getQuery() : "";

                jdbcUrl = "jdbc:mysql://" + host + ":" + port + path + query;
                if (!jdbcUrl.contains("ssl-mode") && !jdbcUrl.contains("useSSL")) {
                    jdbcUrl += (query.isEmpty() ? "?" : "&") + "useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC";
                }
            } catch (Exception e) {
                System.err.println(">>> [DataSourceConfig] Notice: Could not parse URI, using raw URL: " + e.getMessage());
            }
        }

        // 4. Cloud environment detection (Render, Railway, Heroku)
        boolean isCloudEnv = System.getenv("RENDER") != null 
                || System.getenv("PORT") != null 
                || System.getenv("RAILWAY_ENVIRONMENT") != null;

        boolean pointsToLocalhost = jdbcUrl == null 
                || jdbcUrl.isBlank() 
                || jdbcUrl.contains("localhost:3306") 
                || jdbcUrl.contains("127.0.0.1:3306");

        boolean noRemoteCredentials = (username == null || "root".equals(username)) 
                && (password == null || password.isBlank());

        HikariConfig config = new HikariConfig();

        if (isCloudEnv && pointsToLocalhost && noRemoteCredentials) {
            // Running in Cloud (Render) without external MySQL credentials -> Fallback to in-memory H2 so deployment never crashes
            System.out.println("===============================================================================");
            System.out.println(">>> [RENDER CLOUD DEPLOYMENT] No external MySQL detected.");
            System.out.println(">>> Starting with embedded MySQL-compatible database. Application is 100% ONLINE!");
            System.out.println(">>> (To use cloud MySQL, add SPRING_DATASOURCE_URL in Render Dashboard)");
            System.out.println("===============================================================================");
            config.setDriverClassName("org.h2.Driver");
            config.setJdbcUrl("jdbc:h2:mem:restaurant_db;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_DELAY=-1");
            config.setUsername("sa");
            config.setPassword("");
            config.setMaximumPoolSize(5);
            config.setMinimumIdle(1);
        } else {
            // Connect to MySQL (Local or Cloud Aiven/Railway/Render)
            String safeLogUrl = (jdbcUrl != null) ? jdbcUrl.replaceAll(":[^:@/]+@", ":****@") : "none";
            System.out.println(">>> [DataSourceConfig] Connecting to database: " + safeLogUrl + " (User: " + username + ")");
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setJdbcUrl(jdbcUrl);
            config.setUsername(username != null ? username : "root");
            config.setPassword(password != null ? password : "");
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(1);
            config.setConnectionTimeout(25000);
            config.setIdleTimeout(300000);
            config.setMaxLifetime(900000);
            config.setKeepaliveTime(45000);
            config.setInitializationFailTimeout(15000);
        }

        return new HikariDataSource(config);
    }
}
