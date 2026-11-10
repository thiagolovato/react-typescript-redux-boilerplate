import { expect, test } from '@playwright/test';
import { PARTICIPANT_ROLES, registerParticipant } from '../support/api';
import { COORDINATOR, DEFAULT_PASSWORD } from '../support/env';
import {
  COORDINATION_PATH,
  COORDINATOR_LOGIN_PATH,
  DASHBOARD_PATH,
  expectOnCoordinationPage,
  expectOnDashboard,
  LOGIN_PATH,
  loginViaCoordinatorPage,
  loginViaParticipantPage,
  PROFILE_PATH,
  urlEndsWith,
} from '../support/ui';

const PARTICIPANT_PAGES = [DASHBOARD_PATH, PROFILE_PATH];

// Each role sees only its own pages; anyone else is sent to their own home. REGRAS_DE_NEGOCIO.md 2.6.
test.describe('page access by role', () => {
  test('signed out: participant pages go to the login, coordination pages to the coordinator login', async ({ page }) => {
    for (const path of PARTICIPANT_PAGES) {
      await page.goto(path);
      await expect(page).toHaveURL(urlEndsWith(LOGIN_PATH));
    }
    await page.goto(COORDINATION_PATH);
    await expect(page).toHaveURL(urlEndsWith(COORDINATOR_LOGIN_PATH));
  });

  for (const role of PARTICIPANT_ROLES) {
    test(`${role.toLowerCase()} opening the coordination page goes to the dashboard`, async ({ page, request }) => {
      const { email } = await registerParticipant(request, role);
      await loginViaParticipantPage(page, email, DEFAULT_PASSWORD);
      await expectOnDashboard(page);

      await page.goto(COORDINATION_PATH);
      await expectOnDashboard(page);
    });
  }

  test('coordinator opening participant pages goes to the coordination page', async ({ page }) => {
    await loginViaCoordinatorPage(page, COORDINATOR.email, COORDINATOR.password);
    await expectOnCoordinationPage(page);

    for (const path of PARTICIPANT_PAGES) {
      await page.goto(path);
      await expectOnCoordinationPage(page);
    }
  });

  test('signed-in user opening a login page goes to their home', async ({ page, request }) => {
    const { email } = await registerParticipant(request, 'MENTEE');
    await loginViaParticipantPage(page, email, DEFAULT_PASSWORD);
    await expectOnDashboard(page);
    await page.goto(LOGIN_PATH);
    await expectOnDashboard(page);
  });
});
