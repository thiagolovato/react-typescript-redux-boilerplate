import { defineConfig, devices } from '@playwright/test';
import { APP_URL } from '../support/env';

// Runs only the screenshot script (npm run screenshots); starts the app if it is not running. No test cleanup:
// the people it creates stay until the next e2e run, so the app can be opened on the same state.
export default defineConfig({
  testDir: '.',
  testMatch: 'screenshots.ts',
  workers: 1,
  reporter: 'list',
  outputDir: '../../test-results/screenshots',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: APP_URL,
    actionTimeout: 15_000,
  },
  webServer: {
    command: 'npm run dev',
    url: APP_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
