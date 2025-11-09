package auth_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Configuration
@Profile({"docker", "prod", "default"})
public class DbAutoMigration {
    private static final Logger log = LoggerFactory.getLogger(DbAutoMigration.class);

    @Bean
    public CommandLineRunner updateUsersRoleConstraint(DataSource dataSource) {
        return args -> {
            // Ensure users.role check constraint allows INVENTORY role
            final String drop = "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check";
            final String add = "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('ADMIN','HR','FINANCE','EMPLOYEE','INVENTORY'))";
            try (Connection conn = dataSource.getConnection(); Statement st = conn.createStatement()) {
                try {
                    st.execute(drop);
                } catch (SQLException e) {
                    log.warn("Failed dropping users_role_check: {}", e.getMessage());
                }
                st.execute(add);
                log.info("Ensured users_role_check includes INVENTORY");
            } catch (SQLException ex) {
                log.error("DB auto-migration failed: {}", ex.getMessage());
            }
        };
    }
}

