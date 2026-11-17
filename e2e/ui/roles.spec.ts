import { expect, test } from '@playwright/test';
import { DEFAULT_PASSWORD } from '../support/env';
import { participant } from '../support/mentorship';
import { clickLogout, en, expectOnDashboard, loginViaParticipantPage, PROFILE_PATH } from '../support/ui';

// One account, mentor and mentee (PLANO.md, "Mentor que também é mentee"; REGRAS_DE_NEGOCIO.md 2.15).
const NAME = 'E2E Mentor And Student';

test('a mentor becomes a student too, sees the form filled in and switches back', async ({ page }) => {
  const mentor = await participant(page.request, 'MENTOR', { name: NAME });
  await loginViaParticipantPage(page, mentor.email, DEFAULT_PASSWORD);
  await expectOnDashboard(page);
  const sidebar = page.getByRole('complementary');
  await expect(sidebar.getByText(en.roles.MENTOR, { exact: true })).toBeVisible();

  await page.goto(PROFILE_PATH);
  await page.getByRole('button', { name: en.profile.addRole.action.MENTEE }).click();

  await expect(page.getByRole('status').filter({ hasText: en.profile.addRole.prefilled.MENTEE })).toBeVisible();
  await expect(page.getByRole('textbox', { name: en.profile.name, exact: true })).toHaveValue(NAME);
  await expect(sidebar.getByText(en.roles.MENTEE, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: en.profile.addRole.action.MENTOR })).toHaveCount(0);

  await sidebar.getByRole('button', { name: en.navigation.switchRole.MENTOR }).click();

  await expectOnDashboard(page);
  await expect(sidebar.getByText(en.roles.MENTOR, { exact: true })).toBeVisible();
  await expect(sidebar.getByRole('button', { name: en.navigation.switchRole.MENTEE })).toBeVisible();
});

test('the new role becomes where login starts only once its profile is saved', async ({ page }) => {
  const mentor = await participant(page.request, 'MENTOR', { name: NAME });
  await loginViaParticipantPage(page, mentor.email, DEFAULT_PASSWORD);
  await expectOnDashboard(page);
  await page.goto(PROFILE_PATH);
  await page.getByRole('button', { name: en.profile.addRole.action.MENTEE }).click();
  await expect(page.getByRole('status').filter({ hasText: en.profile.addRole.prefilled.MENTEE })).toBeVisible();

  const textbox = (name: string) => page.getByRole('textbox', { name, exact: true });
  await textbox(en.profile.profession.MENTEE).fill('Public health');
  await textbox(en.profile.motivation.MENTEE).fill('Learn from rural practice');
  await textbox(en.profile.expectations.MENTEE).fill('Guidance');
  await textbox(en.profile.goals.MENTEE).fill('Grow');
  const group = page.locator('details').first();
  await group.locator('summary').click();
  await group.getByRole('checkbox').first().check();
  await page.getByLabel(en.profile.consent.acceptTerms).check();
  await page.getByRole('button', { name: en.common.save }).click();
  await expectOnDashboard(page);

  await clickLogout(page);
  await loginViaParticipantPage(page, mentor.email, DEFAULT_PASSWORD);
  await expectOnDashboard(page);
  await expect(page.getByRole('complementary').getByText(en.roles.MENTEE, { exact: true })).toBeVisible();
});

const OTHER_ROLE = { MENTOR: 'MENTEE', MENTEE: 'MENTOR' } as const;

for (const role of ['MENTOR', 'MENTEE'] as const) {
  const added = OTHER_ROLE[role];

  test(`a ${role.toLowerCase()} who adds the other role and leaves the form unsaved logs in again as ${role.toLowerCase()}`, async ({ page }) => {
    const person = await participant(page.request, role, { name: NAME });
    await loginViaParticipantPage(page, person.email, DEFAULT_PASSWORD);
    await expectOnDashboard(page);
    await page.goto(PROFILE_PATH);
    await page.getByRole('button', { name: en.profile.addRole.action[added] }).click();
    await expect(page.getByRole('status').filter({ hasText: en.profile.addRole.prefilled[added] })).toBeVisible();
    // Started, not saved.
    await page.getByRole('textbox', { name: en.profile.profession[added], exact: true }).fill('Half done');

    await clickLogout(page);
    await loginViaParticipantPage(page, person.email, DEFAULT_PASSWORD);

    await expectOnDashboard(page);
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByText(en.roles[role], { exact: true })).toBeVisible();
    // The role is still there, and its profile is still unsaved.
    await sidebar.getByRole('button', { name: en.navigation.switchRole[added] }).click();
    await expectOnDashboard(page);
    await page.goto(PROFILE_PATH);
    await expect(page.getByRole('status').filter({ hasText: en.profile.addRole.prefilled[added] })).toBeVisible();
    await expect(page.getByRole('textbox', { name: en.profile.profession[added], exact: true })).toHaveValue('');
  });
}
