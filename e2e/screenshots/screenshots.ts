import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { generatePath } from 'react-router';
import pt from '../../src/i18n/locales/pt-BR.json' with { type: 'json' };
import { APP_ROUTES } from '../../src/constants/routes';
import {
  createProfile, decodeTokenClaims, fetchProfileReferences, profileRequest, requestCoordinatorLogin, requestSignUp,
  type Role,
} from '../support/api';
import { DEFAULT_PASSWORD, MAILPIT_URL, TEST_EMAIL_DOMAIN } from '../support/env';
import { HTTP_STATUS } from '../support/http';
import { ensureOpenCohort } from '../support/mentorship';
import { deleteTestData } from '../support/testData';

// Screenshots of the main flow, in Portuguese, for presentations: npm run screenshots. They land in
// e2e/screenshots/output/. Fictional people walk the whole proposal flow: the coordinator proposes two mentors, the
// mentee picks one, the mentor accepts, and the introduction e-mail arrives. Needs the local stack and Mailpit.
// The people use the test domain, so the next e2e run deletes them; this run starts by deleting the last run's.

const OUTPUT_DIR = 'e2e/screenshots/output';
// Same account as mentor-mentee-auth db/dev/R__dev_users.sql (password "coordinator"), so the panel shows the dev data.
const DEV_COORDINATOR = { email: 'coordinator@test.com', password: 'coordinator' };
// The sender runs every 30 seconds (mentormentee.notifications.send-every in core).
const EMAIL_WAIT_MS = 90_000;
const EMAIL_POLL_MS = 3_000;
// Mailpit's message pane, without its inbox list (which shows other runs' addresses).
const EMAIL_PANE = { x: 355, y: 60, width: 1085, height: 640 };
const SETTLE_MS = 400;
const INTRODUCTION_SUBJECT = 'meet your pair';

const MENTEE_PROFESSION = 'Medicina de família e comunidade';
const MENTOR_A_PROFESSION = 'Médica de família';
const MENTOR_B_PROFESSION = 'Enfermeira';
const MENTOR_A_BACKGROUND = 'Medicina, residência em MFC';

/** Signs up and saves a full profile, read in Portuguese, with the given fields. */
async function person(request: APIRequestContext, role: Role, handle: string, fields: Record<string, unknown>) {
  const email = `${handle}@${TEST_EMAIL_DOMAIN}`;
  const signUp = await requestSignUp(request, email, role, DEFAULT_PASSWORD);
  expect(signUp.ok(), await signUp.text()).toBe(true);
  const token = (await signUp.json()).jwt as string;
  const references = await fetchProfileReferences(request, token);
  const response = await createProfile(request, token, profileRequest(references, {
    preferredMentorGenders: [],
    consentLanguage: 'pt_BR',
    professionalLink: `https://www.linkedin.com/in/${handle.replace('.', '-')}-exemplo`,
    languages: ['pt', 'en'],
    address: { city: 'Lençóis', region: 'Bahia', country: 'BR' },
    expectations: 'Conversas mensais por vídeo e troca de experiências.',
    goals: 'Ajudar a planejar a carreira na saúde rural.',
    motivation: 'Quero compartilhar o que aprendi no interior.',
    ...fields,
  }));
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.CREATED);
  return { email, userId: decodeTokenClaims(token).uid };
}

async function shot(page: Page, name: string, fullPage = false) {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(SETTLE_MS);
  await page.screenshot({ path: `${OUTPUT_DIR}/${name}.png`, fullPage });
}

async function login(page: Page, path: string, email: string, password: string) {
  await page.goto(path);
  await page.getByLabel(pt.auth.login.email).fill(email);
  await page.getByLabel(pt.auth.login.password).fill(password);
  await page.getByRole('button', { name: pt.auth.login.loginButton }).click();
  await page.waitForURL((url) => !url.pathname.endsWith('login'));
}

const logout = (page: Page) => page.getByRole('button', { name: pt.dashboard.logout }).click();

async function introductionEmailId(request: APIRequestContext, address: string): Promise<string | undefined> {
  const query = new URLSearchParams({ query: `to:"${address}"` });
  const response = await request.get(`${MAILPIT_URL}/api/v1/search?${query}`);
  const messages = (await response.json()).messages as { ID: string; Subject: string }[];
  return messages.find((message) => message.Subject.includes(INTRODUCTION_SUBJECT))?.ID;
}

test.use({ locale: 'pt-BR', viewport: { width: 1440, height: 900 } });

test('screenshots of the proposal flow', async ({ page, request }) => {
  test.setTimeout(4 * EMAIL_WAIT_MS);
  deleteTestData();
  const coordinatorLogin = await requestCoordinatorLogin(request, DEV_COORDINATOR.email, DEV_COORDINATOR.password);
  await ensureOpenCohort(request, (await coordinatorLogin.json()).jwt as string);

  const mentee = await person(request, 'MENTEE', 'bruna.costa', {
    name: 'Bruna Costa', gender: 'WOMAN', profession: MENTEE_PROFESSION, academicBackground: 'Medicina, 5º ano',
    graduationYear: 2027, preferredMentorGenders: ['WOMAN'],
    motivation: 'Quero trabalhar no interior depois de formada e preciso de orientação de quem já vive isso.',
    goals: 'Planejar a residência e conhecer a rotina da saúde rural.',
    expectations: 'Conversas mensais e indicações de leitura.',
  });
  const mentorA = await person(request, 'MENTOR', 'ana.lima', {
    name: 'Ana Lima', gender: 'WOMAN', profession: MENTOR_A_PROFESSION, academicBackground: MENTOR_A_BACKGROUND,
    graduationYear: 2009, hasMentoringExperience: true, hasMentoringTraining: true,
    motivation: 'Atuo há 15 anos em UBS rural e quero ajudar quem está começando.',
  });
  await person(request, 'MENTOR', 'carla.mendes', {
    name: 'Carla Mendes', gender: 'WOMAN', profession: MENTOR_B_PROFESSION,
    academicBackground: 'Enfermagem, especialização em saúde da família', graduationYear: 2012,
    address: { city: 'Mossoró', region: 'Rio Grande do Norte', country: 'BR' },
    motivation: 'Coordeno a atenção básica de um município pequeno e gosto de formar gente.',
  });
  // A man: the mentee accepts only women, so he never shows among her candidates.
  await person(request, 'MENTOR', 'pedro.alves', { name: 'Pedro Alves', gender: 'MAN', profession: 'Médico clínico' });

  // Public pages.
  await page.goto(APP_ROUTES.login);
  await shot(page, '01-login');
  await page.goto(APP_ROUTES.register);
  await shot(page, '02-register');
  await page.goto(APP_ROUTES.privacy);
  await shot(page, '03-privacy');
  await page.goto(APP_ROUTES.coordinatorLogin);
  await shot(page, '04-coord-login');

  // The mentee before any proposal.
  await login(page, APP_ROUTES.login, mentee.email, DEFAULT_PASSWORD);
  await shot(page, '05-mentee-dashboard');
  await page.goto(APP_ROUTES.profile);
  await shot(page, '06-mentee-profile');
  await logout(page);

  // The coordinator proposes two mentors from the mentee's matching page.
  await login(page, APP_ROUTES.coordinatorLogin, DEV_COORDINATOR.email, DEV_COORDINATOR.password);
  await shot(page, '07-coord-dashboard', true);
  await page.goto(generatePath(APP_ROUTES.menteeMatching, { userId: String(mentee.userId) }));
  await shot(page, '08-matching');
  for (const profession of [MENTOR_A_PROFESSION, MENTOR_B_PROFESSION]) {
    await page.locator('article').filter({ hasText: profession })
      .getByLabel(pt.coordination.matching.select).check();
  }
  await shot(page, '09-matching-selected');
  await page.getByRole('button', { name: pt.coordination.matching.propose_other.replace('{{count}}', '2') }).click();
  await expect(page.getByText(pt.coordination.matching.openPair)).toBeVisible();
  await shot(page, '10-matching-proposed');
  await page.goto(APP_ROUTES.coordination);
  await shot(page, '11-coord-pending', true);
  await logout(page);

  // The mentee compares the anonymous options and picks one.
  await login(page, APP_ROUTES.login, mentee.email, DEFAULT_PASSWORD);
  await shot(page, '12-mentee-dashboard-proposal');
  await page.goto(APP_ROUTES.mentorship);
  await shot(page, '13-mentee-options', true);
  await page.locator('article').filter({ hasText: MENTOR_A_BACKGROUND })
    .getByRole('button', { name: pt.mentorship.choose }).click();
  await expect(page.getByRole('button', { name: pt.mentorship.choose })).toHaveCount(0);
  await shot(page, '14-mentee-waiting-mentor');
  await page.goto(APP_ROUTES.notifications);
  await shot(page, '15-mentee-notifications');
  await logout(page);

  // The mentor accepts and sees who the mentee is.
  await login(page, APP_ROUTES.login, mentorA.email, DEFAULT_PASSWORD);
  await shot(page, '16-mentor-dashboard');
  await page.goto(APP_ROUTES.mentorship);
  await shot(page, '17-mentor-proposal', true);
  const accept = page.getByRole('button', { name: pt.mentorship.accept, exact: true });
  await accept.click();
  await expect(accept).toHaveCount(0);
  await shot(page, '18-mentor-introduction', true);
  await page.goto(APP_ROUTES.profile);
  await page.mouse.wheel(0, Number.MAX_SAFE_INTEGER);
  await shot(page, '19-mentor-profile-bottom');
  await logout(page);

  // The coordinator sees the pair in progress and the notices.
  await login(page, APP_ROUTES.coordinatorLogin, DEV_COORDINATOR.email, DEV_COORDINATOR.password);
  await shot(page, '20-coord-in-progress', true);
  await page.goto(APP_ROUTES.notifications);
  await shot(page, '21-coord-notifications');
  await logout(page);

  // The introduction e-mail, as Mailpit caught it.
  await expect.poll(() => introductionEmailId(request, mentee.email), {
    timeout: EMAIL_WAIT_MS, intervals: [EMAIL_POLL_MS],
  }).toBeTruthy();
  await page.goto(`${MAILPIT_URL}/view/${await introductionEmailId(request, mentee.email)}`);
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: `${OUTPUT_DIR}/22-email-introduction.png`, clip: EMAIL_PANE });
});
