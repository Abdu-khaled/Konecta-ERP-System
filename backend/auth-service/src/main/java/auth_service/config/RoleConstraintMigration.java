package auth_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Ensures users.role constraint allows all current roles, running late so it overrides older migrations.
 */
@Component
@Order(9999)
public class RoleConstraintMigration implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(RoleConstraintMigration.class);
    private final DataSource dataSource;

    public RoleConstraintMigration(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Use simple constants to avoid escaping issues in different shells
        final String drop = "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check";
        final String roles = "'ADMIN','HR','FINANCE','EMPLOYEE','INVENTORY','IT_OPERATION','OPERATIONS','SALES_ONLY'";
        final String add = "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (" + roles + "))";
        try (Connection conn = dataSource.getConnection(); Statement st = conn.createStatement()) {
            try { st.execute(drop); } catch (Exception e) { log.warn("RoleConstraintMigration drop: {}", e.getMessage()); }
            st.execute(add);
            log.info("RoleConstraintMigration: ensured users_role_check includes all roles");
        } catch (Exception ex) {
            log.warn("RoleConstraintMigration skipped: {}", ex.getMessage());
        }
    }
}

