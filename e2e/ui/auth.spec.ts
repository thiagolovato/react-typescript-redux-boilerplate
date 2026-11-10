import { expect, test } from '@playwright/test';
import { registerParticipant, requestParticipantLogin, uniqueEmail } from '../support/api';
import { COORDINATOR, DEFAULT_PASSWORD, WRONG_PASSWORD } from '../support/env';
import { MAX_FAILED_LOGINS_PER_ACCOUNT, MIN_PASSWORD_LENGTH } from '../support/rules';
import {
  clickLogout,
  COORDINATOR_LOGIN_PATH,
  en,
  expectAlert,
  expectOnCoordinationPage,
  expectOnDashboard,
  LOGIN_PATH,
  loginViaCoordinatorPage,
  loginViaParticipantPage,
  PRIVACY_PATH,
  REGISTER_PATH,
  registerViaUi,
  translate,
  urlEndsWith,
} from '../support/ui';

const registerText = en.auth.register;
const problems = en.apiErrors.problems.auth;

// Sign-up and sign-in screens. REGRAS_DE_NEGOCIO.md 2.1, 2.2, 2.5, 2.6, 2.10, 2.11.
test.describe('sign-up', () => {
  test('sign-up offers only mentor and mentee (2.2)', async ({ page }) => {
    await page.goto(REGISTER_PATH);
    const roleValues = await page.getByRole('radio')
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value));
    expect(roleValues).toEqual(['MENTOR', 'MENTEE']);
  });

  test('a mentor signs up and lands on the mentor dashboard', async ({ page }) => {
    await registerViaUi(page, uniqueEmail('ui-mentor'), DEFAULT_PASSWORD, 'MENTOR');
    await expectOnDashboard(page);
    await expect(page.getByRole('heading', { name: en.dashboard.findMentees })).toBeVisible();
    await expect(page.getByRole('heading', { name: en.dashboard.findMentors })).toHaveCount(0);
  });

  test('a mentee signs up and lands on the mentee dashboard', async ({ page }) => {
    await registerViaUi(page, uniqueEmail('ui-mentee'), DEFAULT_PASSWORD, 'MENTEE');
    await expectOnDashboard(page);
    await expect(page.getByRole('heading', { name: en.dashboard.findMentors })).toBeVisible();
    await expect(page.getByRole('heading', { name: en.dashboard.findMentees })).toHaveCount(0);
  });

  test('checks the form before sending', async ({ page }) => {
    await page.goto(REGISTER_PATH);
    await page.getByRole('button', { name: registerText.registerButton }).click();
    await expect(page.getByText(registerText.errors.userTypeRequired)).toBeVisible();
    // E-mail, password, confirmation and terms.
    const requiredFieldsWithoutRole = 4;
    await expect(page.getByText(en.validation.required)).toHaveCount(requiredFieldsWithoutRole);

    await page.getByLabel(registerText.email).fill('not-an-email');
    await page.getByLabel(registerText.password, { exact: true }).fill('a'.repeat(MIN_PASSWORD_LENGTH - 1));
    await page.getByLabel(registerText.confirmPassword).fill('different');
    await page.getByRole('button', { name: registerText.registerButton }).click();
    await expect(page.getByText(registerText.errors.emailInvalid)).toBeVisible();
    await expect(page.getByText(translate(registerText.errors.passwordMinLength, { min: MIN_PASSWORD_LENGTH })))
      .toBeVisible();
    await expect(page.getByText(registerText.errors.passwordsNotMatch)).toBeVisible();
    await expect(page).toHaveURL(urlEndsWith(REGISTER_PATH));
  });

  test('shows the server error for an e-mail already in use, in any case (2.11)', async ({ page, request }) => {
    const { email } = await registerParticipant(request, 'MENTOR');
    await registerViaUi(page, email.toUpperCase(), DEFAULT_PASSWORD, 'MENTEE');
    await expectAlert(page, problems.user.alreadyExists);
    await expect(page).toHaveURL(urlEndsWith(REGISTER_PATH));
  });
});

test.describe('sign-in', () => {
  test('participant signs in, signs out and signs in again with another case (2.11)', async ({ page }) => {
    const email = uniqueEmail('ui-login');
    await registerViaUi(page, email, DEFAULT_PASSWORD, 'MENTEE');
    await expectOnDashboard(page);
    await clickLogout(page);
    await expect(page).toHaveURL(urlEndsWith(LOGIN_PATH));

    await loginViaParticipantPage(page, email.toUpperCase(), DEFAULT_PASSWORD);
    await expectOnDashboard(page);
  });

  test('wrong password shows the credentials error', async ({ page, request }) => {
    const { email } = await registerParticipant(request, 'MENTOR');
    await loginViaParticipantPage(page, email, WRONG_PASSWORD);
    await expectAlert(page, problems.credentials.invalid);
    await expect(page).toHaveURL(urlEndsWith(LOGIN_PATH));
  });

  test('locked account shows the lock message (2.10)', async ({ page, request }) => {
    const { email } = await registerParticipant(request, 'MENTEE');
    for (let attempt = 1; attempt <= MAX_FAILED_LOGINS_PER_ACCOUNT; attempt++) {
      await requestParticipantLogin(request, email, WRONG_PASSWORD);
    }
    await loginViaParticipantPage(page, email, DEFAULT_PASSWORD);
    await expectAlert(page, problems.account.locked);
  });

  test('participant login page links to sign-up, never to the coordinator login (2.6)', async ({ page }) => {
    for (const path of [LOGIN_PATH, REGISTER_PATH, PRIVACY_PATH]) {
      await page.goto(path);
      await expect(page.locator(`a[href*="${COORDINATOR_LOGIN_PATH}"]`)).toHaveCount(0);
    }
    await page.goto(LOGIN_PATH);
    await expect(page.getByRole('link', { name: en.auth.login.createAccount })).toHaveAttribute('href', REGISTER_PATH);
  });

  test('coordinator page has its own texts and no sign-up link (2.6)', async ({ page }) => {
    await page.goto(COORDINATOR_LOGIN_PATH);
    await expect(page.getByRole('heading', { name: en.auth.coordinatorLogin.title })).toBeVisible();
    await expect(page.getByRole('link', { name: en.auth.login.createAccount })).toHaveCount(0);
  });

  test('coordinator cannot sign in on the participant page; same message as a wrong password (2.5)', async ({ page }) => {
    await loginViaParticipantPage(page, COORDINATOR.email, COORDINATOR.password);
    await expectAlert(page, problems.credentials.invalid);
    await expect(page).toHaveURL(urlEndsWith(LOGIN_PATH));
  });

  test('participant cannot sign in on the coordinator page (2.5)', async ({ page, request }) => {
    const { email } = await registerParticipant(request, 'MENTOR');
    await loginViaCoordinatorPage(page, email, DEFAULT_PASSWORD);
    await expectAlert(page, problems.credentials.invalid);
    await expect(page).toHaveURL(urlEndsWith(COORDINATOR_LOGIN_PATH));
  });

  test('coordinator signs in, sees only the coordination menu and signs out to their own login (2.6)', async ({ page }) => {
    await loginViaCoordinatorPage(page, COORDINATOR.email, COORDINATOR.password);
    await expectOnCoordinationPage(page);

    const menu = page.getByRole('navigation', { name: en.navigation.mainMenu });
    await expect(menu.getByRole('link')).toHaveText([en.navigation.coordination]);

    await clickLogout(page);
    await expect(page).toHaveURL(urlEndsWith(COORDINATOR_LOGIN_PATH));
  });
});
