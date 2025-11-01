package auth_service.startup;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataMigrationRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DataMigrationRunner.class);

    @PersistenceContext
    private EntityManager em;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        try {
            int updated = em.createNativeQuery(
                    "update users set status='ACTIVE', otp_verified=true where status is null")
                    .executeUpdate();
            if (updated > 0) {
                log.info("DataMigration: initialized {} users with ACTIVE status + otp_verified=true", updated);
            }
        } catch (Exception e) {
            log.warn("DataMigration: skipped (likely table/schema not ready yet): {}", e.getMessage());
        }
    }
}

