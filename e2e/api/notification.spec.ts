import { expect, test, type APIRequestContext } from '@playwright/test';
import { authHeaders, coordinatorToken, CORE } from '../support/api';
import { MAILPIT_URL } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import { ensureOpenCohort, participant, propose, type Participant } from '../support/mentorship';

// REGRAS_DE_NEGOCIO.md section 13: in-app notices, e-mails through the outbox, and the app-only choice.
const NOTIFICATIONS = `${CORE}/notifications`;
// The sender runs every 30 seconds (mentormentee.notifications.send-every in core).
const EMAIL_WAIT_MS = 45_000;
const NO_EMAIL_WAIT_MS = 35_000;

interface Notice {
  id: number;
  type: string;
  mentorshipId: number | null;
  subjectUserId: number | null;
  read: boolean;
}

async function notices(request: APIRequestContext, token: string): Promise<Notice[]> {
  const response = await request.get(NOTIFICATIONS, { headers: authHeaders(token) });
  expect(response.status()).toBe(HTTP_STATUS.OK);
  return ((await response.json()) as { items: Notice[] }).items;
}

async function unread(request: APIRequestContext, token: string): Promise<number> {
  return ((await (await request.get(`${NOTIFICATIONS}/unread-count`, { headers: authHeaders(token) })).json()) as {
    count: number;
  }).count;
}

/** Subjects of the e-mails Mailpit caught for `address`. */
async function emailSubjects(request: APIRequestContext, address: string): Promise<string[]> {
  const query = new URLSearchParams({ query: `to:"${address}"` });
  const response = await request.get(`${MAILPIT_URL}/api/v1/search?${query}`);
  expect(response.ok(), 'Mailpit must run (mentor-mentee-core docker-compose)').toBe(true);
  return ((await response.json()) as { messages: { Subject: string }[] }).messages.map((message) => message.Subject);
}

async function proposeOne(request: APIRequestContext, token: string, mentee: Participant, mentor: Participant) {
  const response = await propose(request, token, mentee, mentor);
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.CREATED);
  return ((await response.json()) as { id: number }[])[0].id;
}

test.describe('notifications API', () => {
  let token: string;

  test.beforeEach(async ({ request }) => {
    token = coordinatorToken();
    await ensureOpenCohort(request, token);
  });

  test('a new profile reaches the coordination naming the person, not a pair (13.5)', async ({ request }) => {
    const mentee = await participant(request, 'MENTEE');

    expect(await notices(request, token)).toContainEqual(
      expect.objectContaining({ type: 'NEW_MENTEE', subjectUserId: mentee.userId, mentorshipId: null }));
  });

  test('a proposal reaches the mentee in the app and by e-mail, and the pair is introduced (13.1, 13.3, 13.6)', async ({ request }) => {
    test.setTimeout(2 * EMAIL_WAIT_MS);
    const mentee = await participant(request, 'MENTEE');
    const mentor = await participant(request, 'MENTOR');

    const id = await proposeOne(request, token, mentee, mentor);

    expect(await notices(request, mentee.token)).toContainEqual(
      expect.objectContaining({ type: 'PROPOSAL_RECEIVED', mentorshipId: id, read: false }));
    expect(await notices(request, mentor.token)).toEqual([]);

    await request.post(`${CORE}/mentorships/${id}/accept`, { headers: authHeaders(mentee.token) });
    await request.post(`${CORE}/mentorships/${id}/accept`, { headers: authHeaders(mentor.token) });

    expect((await notices(request, mentor.token)).map((notice) => notice.type))
      .toEqual(['PAIR_ACCEPTED', 'PROPOSAL_RECEIVED']);
    await expect.poll(() => emailSubjects(request, mentee.email), { timeout: EMAIL_WAIT_MS })
      .toEqual(expect.arrayContaining([expect.stringContaining('new mentorship proposal'),
        expect.stringContaining('meet your pair')]));
  });

  test('someone who chose the app only gets notices in the app, never e-mail (13.6)', async ({ request }) => {
    test.setTimeout(2 * NO_EMAIL_WAIT_MS);
    const mentee = await participant(request, 'MENTEE', { notificationChannel: 'APP_ONLY' });
    const mentor = await participant(request, 'MENTOR');

    await proposeOne(request, token, mentee, mentor);

    expect(await unread(request, mentee.token)).toBe(1);
    // Give the sender one full run before checking nothing was sent.
    await new Promise((resolve) => setTimeout(resolve, NO_EMAIL_WAIT_MS));
    expect(await emailSubjects(request, mentee.email)).toEqual([]);
  });

  test('notices are read one by one or all at once, only in their own inbox (2.9)', async ({ request }) => {
    const mentee = await participant(request, 'MENTEE');
    const mentor = await participant(request, 'MENTOR');
    await proposeOne(request, token, mentee, mentor);
    const [notice] = await notices(request, mentee.token);

    const foreign = await request.post(`${NOTIFICATIONS}/${notice.id}/read`, { headers: authHeaders(mentor.token) });
    expect(foreign.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect((await foreign.json()).code).toBe(ERROR_CODES.core.notificationNotFound);

    const own = await request.post(`${NOTIFICATIONS}/${notice.id}/read`, { headers: authHeaders(mentee.token) });
    expect(await own.json()).toMatchObject({ id: notice.id, read: true });
    expect(await unread(request, mentee.token)).toBe(0);

    // Other tests add to the coordinators' shared inbox at the same time, so only the answer is checked here.
    const all = await request.post(`${NOTIFICATIONS}/read-all`, { headers: authHeaders(token) });
    expect(all.status()).toBe(HTTP_STATUS.NO_CONTENT);
  });
});
