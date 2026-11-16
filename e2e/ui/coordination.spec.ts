import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { generatePath } from 'react-router';
import { coordinatorToken } from '../support/api';
import { COORDINATOR, DEFAULT_PASSWORD, MAILPIT_URL, TEST_COHORT_PREFIX } from '../support/env';
import { ensureOpenCohort, participant } from '../support/mentorship';
import { randomSuffix } from '../support/random';
import {
  en,
  expectOnCoordinationPage,
  expectOnDashboard,
  loginViaCoordinatorPage,
  loginViaParticipantPage,
  translate,
} from '../support/ui';
import { APP_ROUTES } from '../../src/constants/routes';

// The sender runs every 30 seconds (mentormentee.notifications.send-every in core).
const EMAIL_WAIT_MS = 45_000;
// Far enough ahead to overlap no real cohort; the teardown deletes cohorts named with the test prefix.
const FUTURE_YEAR_BASE = 2090;
const FUTURE_YEAR_SPREAD = 10;

/** Subjects of the e-mails Mailpit caught for `address`. */
async function emailSubjects(request: APIRequestContext, address: string): Promise<string[]> {
  const query = new URLSearchParams({ query: `to:"${address}"` });
  const response = await request.get(`${MAILPIT_URL}/api/v1/search?${query}`);
  expect(response.ok(), 'Mailpit must run (mentor-mentee-core docker-compose)').toBe(true);
  return ((await response.json()) as { messages: { Subject: string }[] }).messages.map((message) => message.Subject);
}

const section = (page: Page, title: string) => page.locator('section').filter({ has: page.getByRole('heading', { name: title }) });

async function acceptOnMyMentorship(page: Page, email: string) {
  await loginViaParticipantPage(page, email, DEFAULT_PASSWORD);
  await expectOnDashboard(page);
  await page.goto(APP_ROUTES.mentorship);
  const accept = page.getByRole('button', { name: en.mentorship.accept, exact: true });
  await accept.click();
  await expect(accept).toHaveCount(0);
  await page.getByRole('button', { name: en.dashboard.logout }).click();
}

// Phase 2 done criterion (PLANO.md 2.8): the coordinator manages cohorts, proposes from the matching page, both parties
// accept on their page, the pair shows in progress and both get the introduction e-mail. REGRAS_DE_NEGOCIO.md 6, 7, 13.
test.describe('coordination dashboard', () => {
  test('cohort, proposal, both accept, pair in progress, introduction e-mail', async ({ page, request }) => {
    test.setTimeout(2 * EMAIL_WAIT_MS);
    await ensureOpenCohort(request, coordinatorToken());
    const profession = `E2E profession ${randomSuffix()}`;
    const menteeName = `E2E mentee ${randomSuffix()}`;
    const mentee = await participant(request, 'MENTEE', { name: menteeName });
    const mentor = await participant(request, 'MENTOR', { profession });

    await loginViaCoordinatorPage(page, COORDINATOR.email, COORDINATOR.password);
    await expectOnCoordinationPage(page);

    // Cohorts: create one ahead, it shows in the list.
    const cohortName = `${TEST_COHORT_PREFIX}ui-${randomSuffix()}`;
    const year = FUTURE_YEAR_BASE + Math.floor(Math.random() * FUTURE_YEAR_SPREAD);
    const cohorts = section(page, en.coordination.cohorts.title);
    await cohorts.getByRole('button', { name: en.coordination.cohorts.create }).click();
    await cohorts.getByLabel(en.coordination.cohorts.name).fill(cohortName);
    await cohorts.getByLabel(en.coordination.cohorts.startsOn).fill(`${year}-01-01`);
    await cohorts.getByLabel(en.coordination.cohorts.endsOn).fill(`${year}-12-31`);
    await cohorts.getByRole('button', { name: en.coordination.cohorts.save }).click();
    await expect(cohorts.getByText(cohortName)).toBeVisible();

    // Matching: propose the mentor from the mentee's page. Opened by address: the list of mentees without a mentor is
    // paged longest waiting first, so in a full run a new mentee is past the first page.
    await page.goto(generatePath(APP_ROUTES.menteeMatching, { userId: String(mentee.userId) }));
    const card = page.locator('article').filter({ hasText: profession });
    await card.getByLabel(en.coordination.matching.select).check();
    await page.getByRole('button', { name: translate(en.coordination.matching.propose_one, {}) }).click();
    await expect(page.getByText(en.coordination.matching.openPair)).toBeVisible();

    await page.goto(APP_ROUTES.coordination);
    await expect(section(page, en.coordination.mentorships.pending.title).getByText(menteeName)).toBeVisible();
    await page.getByRole('button', { name: en.dashboard.logout }).click();

    // The mentee chooses, then the mentor accepts.
    await acceptOnMyMentorship(page, mentee.email);
    await acceptOnMyMentorship(page, mentor.email);

    await loginViaCoordinatorPage(page, COORDINATOR.email, COORDINATOR.password);
    await expectOnCoordinationPage(page);
    const inProgress = section(page, en.coordination.mentorships.inProgress.title);
    // Other tests' pairs share the open cohort: check this pair's row only.
    const pair = inProgress.locator('article').filter({ hasText: menteeName });
    await expect(pair.getByText(en.mentorship.coordinatorStage.accepted)).toBeVisible();
    await expect(section(page, en.coordination.mentorships.pending.title).getByText(menteeName)).toHaveCount(0);

    for (const address of [mentee.email, mentor.email]) {
      await expect.poll(() => emailSubjects(request, address), { timeout: EMAIL_WAIT_MS })
        .toContainEqual(expect.stringContaining('meet your pair'));
    }
  });

  test('a new mentee notice opens their matching page', async ({ page, request }) => {
    await participant(request, 'MENTEE');

    await loginViaCoordinatorPage(page, COORDINATOR.email, COORDINATOR.password);
    await expectOnCoordinationPage(page);
    await page.goto(APP_ROUTES.notifications);
    await page.getByRole('button', { name: en.notifications.types.NEW_MENTEE }).first().click();

    // Tests run in parallel, so the newest notice may be another worker's mentee: e2e/api/notification.spec.ts checks
    // that the notice names the right person.
    await expect(page).toHaveURL(/\/coordination\/mentees\/\d+$/);
  });
});
