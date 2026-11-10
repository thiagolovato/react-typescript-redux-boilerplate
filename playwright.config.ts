import { defineConfig, devices } from '@playwright/test';
import { APP_URL, TEST_LOCALE } from './e2e/support/env';

// End-to-end tests against the local stack: the app (started here if not running) and the
// backend behind the gateway (registry, gateway, auth, core, databases, Redis). See e2e/README.md.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // The device preset sets its own locale, so the test locale goes after it.
    { name: 'chromium', use: { ...devices['Desktop Chrome'], locale: TEST_LOCALE } },
  ],
  webServer: {
    command: 'npm run dev',
    url: APP_URL,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
