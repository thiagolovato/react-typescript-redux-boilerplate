import { defineConfig } from '@playwright/test';

// Runs only the dev seed (npm run seed:dev). No browser, no app server, no test cleanup.
export default defineConfig({
  testDir: '.',
  testMatch: 'dev-seed.ts',
  workers: 1,
  reporter: 'list',
});
