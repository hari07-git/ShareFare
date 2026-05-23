package com.sharefare.startup;

import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * One-time startup migration: fixes legacy role values stored in the DB
 * (STUDENT, DRIVER → USER) and widens columns for long place names.
 *
 * Each SQL statement runs in its OWN transaction so a failure in one
 * doesn't roll back the others (H2 marks the transaction rollback-only
 * if any SQL fails, even when caught).
 */
@Component
@Order(1)
public class RoleMigrationRunner implements ApplicationRunner {

  private static final Logger log = LoggerFactory.getLogger(RoleMigrationRunner.class);
  private final EntityManager em;
  private final PlatformTransactionManager txManager;

  public RoleMigrationRunner(EntityManager em, PlatformTransactionManager txManager) {
    this.em = em;
    this.txManager = txManager;
  }

  @Override
  public void run(ApplicationArguments args) {
    boolean isPostgres = false;
    try {
      isPostgres = em.unwrap(org.hibernate.Session.class).doReturningWork(conn -> {
        String dbName = conn.getMetaData().getDatabaseProductName();
        return dbName != null && dbName.toLowerCase().contains("postgres");
      });
    } catch (Exception e) {
      log.warn("RoleMigrationRunner: failed to detect database product: {}", e.getMessage());
    }

    if (isPostgres) {
      runSilently("Widen role column (Postgres)",
          "ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50)");
      runSilently("Widen rides.origin column (Postgres)",
          "ALTER TABLE rides ALTER COLUMN origin TYPE VARCHAR(500)");
      runSilently("Widen rides.destination column (Postgres)",
          "ALTER TABLE rides ALTER COLUMN destination TYPE VARCHAR(500)");
      runSilently("Widen ride.origin column (Postgres)",
          "ALTER TABLE ride ALTER COLUMN origin TYPE VARCHAR(500)");
      runSilently("Widen ride.destination column (Postgres)",
          "ALTER TABLE ride ALTER COLUMN destination TYPE VARCHAR(500)");
    } else {
      runSilently("Widen role column (H2)",
          "ALTER TABLE users ALTER COLUMN role VARCHAR(50)");
      runSilently("Widen rides.origin column (H2)",
          "ALTER TABLE rides ALTER COLUMN origin VARCHAR(500)");
      runSilently("Widen rides.destination column (H2)",
          "ALTER TABLE rides ALTER COLUMN destination VARCHAR(500)");
      runSilently("Widen ride.origin column (H2)",
          "ALTER TABLE ride ALTER COLUMN origin VARCHAR(500)");
      runSilently("Widen ride.destination column (H2)",
          "ALTER TABLE ride ALTER COLUMN destination VARCHAR(500)");
    }

    runSilently("Drop old role check constraint (variant 1)",
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS constraint_role");
    runSilently("Drop old role check constraint (variant 2)",
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");

    int studentFixed = runUpdate("Migrate STUDENT/DRIVER → USER",
        "UPDATE users SET role = 'USER' WHERE role IN ('STUDENT', 'DRIVER')");
    int nullFixed = runUpdate("Migrate NULL → USER",
        "UPDATE users SET role = 'USER' WHERE role IS NULL");

    if (studentFixed > 0 || nullFixed > 0) {
      log.info("RoleMigrationRunner: migrated {} STUDENT/DRIVER \u2192 USER, {} NULL \u2192 USER accounts",
          studentFixed, nullFixed);
    }
  }

  private void runSilently(String description, String sql) {
    TransactionTemplate tt = new TransactionTemplate(txManager);
    tt.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    try {
      tt.execute(status -> em.createNativeQuery(sql).executeUpdate());
    } catch (Exception e) {
      log.debug("RoleMigrationRunner [{}] skipped: {}", description, e.getMessage());
    }
  }

  private int runUpdate(String description, String sql) {
    TransactionTemplate tt = new TransactionTemplate(txManager);
    tt.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    try {
      Integer result = tt.execute(status -> em.createNativeQuery(sql).executeUpdate());
      return result != null ? result : 0;
    } catch (Exception e) {
      log.warn("RoleMigrationRunner [{}] failed: {}", description, e.getMessage());
      return 0;
    }
  }
}
