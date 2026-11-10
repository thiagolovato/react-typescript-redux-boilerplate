import { expect, type Page } from '@playwright/test';
import en from '../../src/i18n/locales/en-US.json' with { type: 'json' };
import { COORDINATOR_LOGIN_PATH, homePathFor, LOGIN_PATH } from '../../src/constants/auth';
import type { Role } from './api';

// The tests read texts from the English locale, so a copy change does not break them.
export { en };

// App routes. The login paths and home pages come from the app; the others have no constant there.
export { COORDINATOR_LOGIN_PATH, LOGIN_PATH };
export const DASHBOARD_PATH = homePathFor('MENTOR');
export const COORDINATION_PATH = homePathFor('COORDINATOR');
export const REGISTER_PATH = '/register';
export const PROFILE_PATH = '/profile';
export const PRIVACY_PATH = '/privacy';

/** Matches a URL whose path ends with `path`. */
export function urlEndsWith(path: string): RegExp {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}$`);
}

/** Fills the `{{name}}` placeholders of a locale text, as i18next does. */
export function translate(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(params[name]));
}

async function submitLoginForm(page: Page, path: string, email: string, password: string) {
  await page.goto(path);
  await page.getByLabel(en.auth.login.email).fill(email);
  await page.getByLabel(en.auth.login.password).fill(password);
  await page.getByRole('button', { name: en.auth.login.loginButton }).click();
}

export const loginViaParticipantPage = (page: Page, email: string, password: string) =>
  submitLoginForm(page, LOGIN_PATH, email, password);

export const loginViaCoordinatorPage = (page: Page, email: string, password: string) =>
  submitLoginForm(page, COORDINATOR_LOGIN_PATH, email, password);

/** Fills and sends the sign-up form, with the terms accepted. */
export async function registerViaUi(page: Page, email: string, password: string, role: Role) {
  await page.goto(REGISTER_PATH);
  await page.getByLabel(en.auth.register.email).fill(email);
  await page.getByLabel(en.auth.register.password, { exact: true }).fill(password);
  await page.getByLabel(en.auth.register.confirmPassword).fill(password);
  await page.getByText(role === 'MENTOR' ? en.auth.register.mentor : en.auth.register.mentee).click();
  await page.getByLabel(en.auth.register.termsOfUse).check();
  await page.getByRole('button', { name: en.auth.register.registerButton }).click();
}

export async function clickLogout(page: Page) {
  await page.getByRole('button', { name: en.dashboard.logout }).click();
}

export async function expectOnDashboard(page: Page) {
  await expect(page).toHaveURL(urlEndsWith(DASHBOARD_PATH));
  await expect(page.getByRole('heading', { name: en.dashboard.welcome })).toBeVisible();
}

export async function expectOnCoordinationPage(page: Page) {
  await expect(page).toHaveURL(urlEndsWith(COORDINATION_PATH));
  await expect(page.getByRole('heading', { name: en.coordination.title })).toBeVisible();
}

/** The alert under a form shows exactly this text. */
export async function expectAlert(page: Page, text: string) {
  await expect(page.getByRole('alert')).toHaveText(text);
}
