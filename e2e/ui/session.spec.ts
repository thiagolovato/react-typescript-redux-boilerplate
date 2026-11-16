import { expect, test } from '@playwright/test';
import { registerParticipant } from '../support/api';
import { DEFAULT_PASSWORD, WRONG_PASSWORD } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import { en, expectOnDashboard, LOGIN_PATH, loginViaParticipantPage, PROFILE_PATH, urlEndsWith } from '../support/ui';

// A session the server no longer accepts ends in the app with the reason, instead of an error on every page.
const CORE_CALLS = '**/mmc/**';

test.describe('session ended by the server', () => {
  for (const [code, text] of [
    [ERROR_CODES.auth.tokenExpired, en.apiErrors.problems.auth.token.expired],
    [ERROR_CODES.auth.tokenInvalid, en.apiErrors.problems.auth.token.invalid],
  ] as const) {
    test(`a 401 ${code} sends the participant to the login with its reason`, async ({ page, request }) => {
      const { email } = await registerParticipant(request, 'MENTEE');
      await loginViaParticipantPage(page, email, DEFAULT_PASSWORD);
      await expectOnDashboard(page);

      // What core answers to an expired or tampered token.
      await page.route(CORE_CALLS, (route) => route.fulfill({
        status: HTTP_STATUS.UNAUTHORIZED,
        contentType: 'application/problem+json',
        json: { status: HTTP_STATUS.UNAUTHORIZED, code },
      }));
      await page.goto(PROFILE_PATH);

      await expect(page).toHaveURL(urlEndsWith(LOGIN_PATH));
      await expect(page.getByRole('status')).toHaveText(text);

      // Shown once: a reload of the login page does not bring the message back.
      await page.reload();
      await expect(page.getByRole('status')).toHaveCount(0);

      // The session is gone: a reload stays on the login.
      await page.unroute(CORE_CALLS);
      await page.goto(PROFILE_PATH);
      await expect(page).toHaveURL(urlEndsWith(LOGIN_PATH));
    });
  }

  test('a wrong password on the login is not a session error', async ({ page, request }) => {
    const { email } = await registerParticipant(request, 'MENTOR');

    await loginViaParticipantPage(page, email, WRONG_PASSWORD);

    await expect(page.getByRole('alert')).toHaveText(en.apiErrors.problems.auth.credentials.invalid);
    await expect(page.getByRole('status')).toHaveCount(0);
  });
});
