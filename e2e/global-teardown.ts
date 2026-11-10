import { deleteTestData } from './support/testData';

/** Deletes what the tests created. Set E2E_KEEP_DATA=1 to keep it for debugging; the next run's setup removes it. */
export default async function globalTeardown() {
  if (process.env.E2E_KEEP_DATA) return;
  deleteTestData();
}
