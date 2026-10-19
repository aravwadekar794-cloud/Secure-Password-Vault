package com.PasswordManager.Backend.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url:jdbc:postgresql://localhost:5432/passwordmanagerdb}")
    private String datasourceUrl;

    @Value("${spring.datasource.username:admin}")
    private String datasourceUsername;

    @Value("${spring.datasource.password:admin123}")
    private String datasourcePassword;

    @Value("${spring.datasource.driverClassName:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    @Primary
    public DataSource dataSource() {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = datasourceUrl;
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName(driverClassName);

        // Render provides DATABASE_URL in the format:
        // postgresql://username:password@hostname:port/database or postgres://...
        if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
            try {
                String normalizedUrl = dbUrl
                        .replaceFirst("^postgres://", "http://")
                        .replaceFirst("^postgresql://", "http://");

                URI uri = new URI(normalizedUrl);
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath(); // includes leading '/'
                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;

                config.setJdbcUrl(jdbcUrl);

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    config.setUsername(userInfo[0]);
                    if (userInfo.length > 1) {
                        config.setPassword(userInfo[1]);
                    }
                } else {
                    config.setUsername(datasourceUsername);
                    config.setPassword(datasourcePassword);
                }
            } catch (Exception e) {
                String fallbackJdbc = dbUrl.startsWith("jdbc:") ? dbUrl : "jdbc:" + dbUrl;
                config.setJdbcUrl(fallbackJdbc);
                config.setUsername(datasourceUsername);
                config.setPassword(datasourcePassword);
            }
        } else {
            config.setJdbcUrl(dbUrl);
            config.setUsername(datasourceUsername);
            config.setPassword(datasourcePassword);
        }

        return new HikariDataSource(config);
    }
}
