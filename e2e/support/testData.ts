import { clearLoginAttempts, runAuthSql, runCoreSql } from './db';
import { COORDINATOR, TEST_COHORT_PREFIX, TEST_EMAIL_DOMAIN } from './env';

/**
 * Creates the coordinator account the tests use. Coordinators have no sign-up endpoint
 * (REGRAS_DE_NEGOCIO.md 2.3), so it goes straight into the auth database, like scripts/create-coordinator.sh.
 */
export function createTestCoordinator(): void {
  runAuthSql(
    `INSERT INTO auth.users (username, password, customer_type)
     VALUES (:'email', :'hash', 'COORDINATOR')
     ON CONFLICT (username) DO NOTHING;`,
    { email: COORDINATOR.email, hash: COORDINATOR.passwordHash },
  );
}

/**
 * Deletes what the tests create: accounts and profiles under the test e-mail domain (the test coordinator too),
 * cohorts named with the test prefix, and every login-attempt counter.
 */
export function deleteTestData(): void {
  const emailPattern = `%@${TEST_EMAIL_DOMAIN}`;

  // Profiles are matched by user id: a profile keeps the e-mail only after a save.
  const userIds = runAuthSql(`SELECT id FROM auth.users WHERE username LIKE :'pattern';`, { pattern: emailPattern })
    .map(([id]) => id);

  if (userIds.length > 0) {
    runCoreSql(
      `CREATE TEMP TABLE gone AS
         SELECT id, address_id FROM core.customer WHERE user_id = ANY (string_to_array(:'ids', ',')::bigint[]);
       DELETE FROM core.customer_contacts WHERE customer_id IN (SELECT id FROM gone);
       DELETE FROM core.customer_languages WHERE customer_id IN (SELECT id FROM gone);
       DELETE FROM core.customer_interest_areas WHERE customer_id IN (SELECT id FROM gone);
       DELETE FROM core.customer_preferred_mentor_gender WHERE customer_id IN (SELECT id FROM gone);
       DELETE FROM core.customer_consent WHERE customer_id IN (SELECT id FROM gone);
       DELETE FROM core.customer WHERE id IN (SELECT id FROM gone);
       DELETE FROM core.customer_address WHERE id IN (SELECT address_id FROM gone);`,
      { ids: userIds.join(',') },
    );
  }

  runAuthSql(`DELETE FROM auth.users WHERE username LIKE :'pattern';`, { pattern: emailPattern });
  runCoreSql(`DELETE FROM core.cohort WHERE name LIKE :'pattern';`, { pattern: `${TEST_COHORT_PREFIX}%` });
  clearLoginAttempts();
}
