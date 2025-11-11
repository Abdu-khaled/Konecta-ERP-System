package auth_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Re-applies the users.role check constraint after the application is fully started.
 * This ensures any earlier migrations do not revert the allowed role list.
 */
@Component
public class RoleConstraintReadyListener {
    private static final Logger log = LoggerFactory.getLogger(RoleConstraintReadyListener.class);
    private final DataSource dataSource;

    public RoleConstraintReadyListener(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onReady() {
        final String drop = "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check";
        final String roles = "'ADMIN','HR','FINANCE','EMPLOYEE','INVENTORY','IT_OPERATION','OPERATIONS','SALES_ONLY'";
        final String add = "ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN (" + roles + "))";
        try (Connection conn = dataSource.getConnection(); Statement st = conn.createStatement()) {
            try { st.execute(drop); } catch (Exception e) { log.warn("RoleConstraintReady drop: {}", e.getMessage()); }
            st.execute(add);
            log.info("RoleConstraintReady: ensured users_role_check includes all roles (post-start)");
        } catch (Exception ex) {
            log.warn("RoleConstraintReady skipped: {}", ex.getMessage());
        }
    }
}

