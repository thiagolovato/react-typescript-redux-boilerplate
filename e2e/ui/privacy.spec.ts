import { expect, test } from '@playwright/test';
import { fetchCurrentConsents } from '../support/api';
import { CONSENT_HEADING_PREFIX, CONSENT_LANGUAGE_BY_UI_LANGUAGE } from '../../src/constants/legal';
import { en, PRIVACY_PATH, translate } from '../support/ui';

// The terms page shows the document in force from the server. REGRAS_DE_NEGOCIO.md 4.1.
const PORTUGUESE_UI = 'pt-BR';

test.describe('terms page', () => {
  test('shows the terms in force, with their version and headings, without signing in', async ({ page }) => {
    const { terms } = await fetchCurrentConsents(page.request);
    await page.goto(PRIVACY_PATH);

    await expect(page.getByRole('heading', { level: 1, name: terms.title })).toBeVisible();
    await expect(page.getByText(translate(en.privacy.version, { version: terms.version }))).toBeVisible();
    const firstHeading = terms.body.split('\n').find((line) => line.startsWith(CONSENT_HEADING_PREFIX)) ?? '';
    await expect(page.getByRole('heading', { level: 2, name: firstHeading.slice(CONSENT_HEADING_PREFIX.length) }))
      .toBeVisible();
  });

  test('switching the interface language shows the same version in that language', async ({ page }) => {
    const { terms: portuguese } = await fetchCurrentConsents(page.request, CONSENT_LANGUAGE_BY_UI_LANGUAGE[PORTUGUESE_UI]);
    await page.goto(PRIVACY_PATH);

    await page.getByRole('combobox', { name: en.common.language }).selectOption(PORTUGUESE_UI);

    await expect(page.getByRole('heading', { level: 1, name: portuguese.title })).toBeVisible();
  });
});
