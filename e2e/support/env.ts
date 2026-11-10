// Local stack addresses and containers. Override with environment variables to point elsewhere.
export const APP_URL = process.env.E2E_APP_URL ?? 'http://localhost:8080';
export const GATEWAY_URL = process.env.E2E_GATEWAY_URL ?? 'http://localhost:8765';

// Texts in the tests come from en-US.json, so the app must pick English.
export const TEST_LOCALE = 'en-US';

export const AUTH_DB = {
  container: process.env.E2E_AUTH_DB_CONTAINER ?? 'mentor-mentee-auth-db',
  user: 'mentor-mentee-auth',
  database: 'mentor-mentee-auth',
};

export const CORE_DB = {
  container: process.env.E2E_CORE_DB_CONTAINER ?? 'mentor-mentee-core-db',
  user: 'mentor-mentee-core',
  database: 'mentor-mentee-core',
};

export const REDIS_CONTAINER = process.env.E2E_REDIS_CONTAINER ?? 'mentor-mentee-redis';

// Every account the tests create uses this domain, so the cleanup can delete them.
export const TEST_EMAIL_DOMAIN = 'e2e.test';
// Cohorts the tests create start with this name, for the same reason.
export const TEST_COHORT_PREFIX = 'e2e-';

// Coordinator account the global setup creates. Same password hash as the dev seed
// (mentor-mentee-auth R__dev_users.sql): password "coordinator".
export const COORDINATOR = {
  email: `coordinator@${TEST_EMAIL_DOMAIN}`,
  password: 'coordinator',
  passwordHash: '$2a$10$TZNKcPHB/l/Y09o1qYSvKunJGbJQV5Vm5mA4rT0vGJFgvcaoHUdJS',
};

export const DEFAULT_PASSWORD = 'password123';
export const WRONG_PASSWORD = 'wrong-password';
