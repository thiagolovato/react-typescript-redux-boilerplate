import { request } from '@playwright/test';
import { COORDINATOR_TOKEN_ENV, requestCoordinatorLogin } from './support/api';
import { COORDINATOR, GATEWAY_URL } from './support/env';
import { createTestCoordinator, deleteTestData } from './support/testData';

/**
 * Checks the backend is up, removes data left by a run with E2E_KEEP_DATA, creates the test coordinator
 * and logs it in once for every worker. Starting clean also keeps the far-future cohort years of this run free.
 */
export default async function globalSetup() {
  try {
    await fetch(`${GATEWAY_URL}/auth/users/login`, { method: 'POST' });
  } catch {
    throw new Error(`Gateway not reachable at ${GATEWAY_URL}. Start the backend first (see e2e/README.md).`);
  }

  deleteTestData();
  createTestCoordinator();

  const context = await request.newContext();
  const response = await requestCoordinatorLogin(context, COORDINATOR.email, COORDINATOR.password);
  if (!response.ok()) {
    throw new Error(`Coordinator login failed: ${response.status()} ${await response.text()}`);
  }
  // Workers inherit the environment the global setup leaves.
  process.env[COORDINATOR_TOKEN_ENV] = (await response.json()).jwt;
  await context.dispose();
}
