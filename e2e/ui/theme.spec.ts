import { expect, test } from '@playwright/test';
import { en, LOGIN_PATH } from '../support/ui';

const html = (page: import('@playwright/test').Page) => page.locator('html');

// Light, dark or the system setting, chosen on any page and kept across reloads and tabs.
test.describe('theme', () => {
  test('a saved dark theme is on the page before the app starts', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    // Block the app bundle: only the inline script in index.html runs, as before the first paint.
    await page.route('**/*', (route) =>
      route.request().resourceType() === 'script' ? route.abort() : route.continue());
    await page.goto(LOGIN_PATH);

    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#131e26');
  });

  test('system follows the operating system, and choosing it forgets the saved theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto(LOGIN_PATH);
    const toggle = page.getByRole('radiogroup', { name: en.theme.label });

    await toggle.getByRole('radio', { name: en.theme.light }).check();
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');

    await toggle.getByRole('radio', { name: en.theme.system }).check();
    await expect(html(page)).toHaveAttribute('data-theme', 'dark');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();

    await page.emulateMedia({ colorScheme: 'light' });
    await expect(html(page)).toHaveAttribute('data-theme', 'light');
  });

  test('a theme chosen in one tab applies in the other tabs', async ({ context }) => {
    const first = await context.newPage();
    const second = await context.newPage();
    await first.goto(LOGIN_PATH);
    await second.goto(LOGIN_PATH);

    await first.getByRole('radio', { name: en.theme.dark }).check();

    await expect(html(second)).toHaveAttribute('data-theme', 'dark');
    await expect(second.getByRole('radio', { name: en.theme.dark })).toBeChecked();
  });
});
