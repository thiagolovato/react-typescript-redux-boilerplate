import { expect, test, type APIRequestContext } from '@playwright/test';
import { authHeaders, coordinatorToken, CORE, errorCodeOf } from '../support/api';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import { ensureOpenCohort, participant, propose, PROPOSALS, type Participant } from '../support/mentorship';

// REGRAS_DE_NEGOCIO.md section 7: the coordination proposes one or more mentors, the mentee chooses first, then the
// mentor answers.
const MINE = `${CORE}/mentorships/mine`;

interface PartyMentorship {
  id: number;
  status: string;
  awaiting: string | null;
  partner: Record<string, unknown>;
  introduction: { name: string; email: string } | null;
}

/** Ids of the options, in the order of the mentors. */
async function proposeIds(request: APIRequestContext, token: string, mentee: Participant, ...mentors: Participant[]) {
  const response = await propose(request, token, mentee, ...mentors);
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.CREATED);
  return ((await response.json()) as { id: number }[]).map((option) => option.id);
}

interface CoordinatorRow {
  id: number;
  awaiting: string | null;
  declinedBy: string | null;
  declineReason: string | null;
}

async function coordinatorRows(request: APIRequestContext, token: string, ids: number[]): Promise<CoordinatorRow[]> {
  const list: CoordinatorRow[] = await (await request.get(PROPOSALS, { headers: authHeaders(token) })).json();
  return ids.map((id) => list.find((row) => row.id === id) as CoordinatorRow);
}

async function mine(request: APIRequestContext, who: Participant): Promise<PartyMentorship[]> {
  return (await request.get(MINE, { headers: authHeaders(who.token) })).json();
}

const answer = (request: APIRequestContext, who: Participant, id: number, action: 'accept' | 'decline', reason?: string) =>
  request.post(`${CORE}/mentorships/${id}/${action}`, {
    headers: authHeaders(who.token),
    data: reason === undefined ? undefined : { reason },
  });

test.describe('mentorship API', () => {
  let token: string;
  let mentee: Participant;
  let mentor: Participant;

  test.beforeEach(async ({ request }) => {
    token = coordinatorToken();
    await ensureOpenCohort(request, token);
    mentee = await participant(request, 'MENTEE');
    mentor = await participant(request, 'MENTOR');
  });

  test('the mentee answers first, then the mentor; names show only after both accept (7.1, 7.5, 7.8)', async ({ request }) => {
    const [id] = await proposeIds(request, token, mentee, mentor);

    expect((await mine(request, mentor)).map((item) => item.id)).not.toContain(id);
    expect((await answer(request, mentor, id, 'accept')).status()).toBe(HTTP_STATUS.NOT_FOUND);

    const [proposal] = await mine(request, mentee);
    expect(proposal).toMatchObject({ id, status: 'PROPOSED', awaiting: 'MENTEE', introduction: null });
    expect(proposal.partner).toMatchObject({ role: 'MENTOR', profession: 'Nurse', country: 'BR' });
    for (const hidden of ['name', 'birthDate', 'contacts', 'professionalLink', 'city', 'additionalInfo']) {
      expect(proposal.partner).not.toHaveProperty(hidden);
    }

    const menteeAccepted = await answer(request, mentee, id, 'accept');
    expect(await menteeAccepted.json()).toMatchObject({ status: 'PROPOSED', awaiting: 'MENTOR', introduction: null });

    expect((await mine(request, mentor)).find((item) => item.id === id)?.awaiting).toBe('MENTOR');
    const mentorAccepted = await answer(request, mentor, id, 'accept');
    expect(await mentorAccepted.json()).toMatchObject({ status: 'ACCEPTED', awaiting: null });

    const [pair] = await mine(request, mentee);
    expect(pair.introduction?.name).toMatch(/^E2E MENTOR /);
    expect(pair.introduction?.email).toMatch(/@e2e\.test$/);
  });

  test('a declined proposal shows its reason only to the coordinator, and the mentee may get another (7.3)', async ({ request }) => {
    const [id] = await proposeIds(request, token, mentee, mentor);
    await answer(request, mentee, id, 'accept');

    const declined = await answer(request, mentor, id, 'decline', 'No time this year');
    expect(declined.status()).toBe(HTTP_STATUS.OK);
    const declinedBody = await declined.json();
    expect(declinedBody).not.toHaveProperty('declineReason');
    // 7.5: declining never reveals who the other party is.
    expect(declinedBody.introduction ?? null).toBeNull();

    const list: { id: number; declinedBy: string; declineReason: string }[] =
      await (await request.get(PROPOSALS, { headers: authHeaders(token) })).json();
    expect(list.find((item) => item.id === id)).toMatchObject({ declinedBy: 'MENTOR', declineReason: 'No time this year' });
    expect(await mine(request, mentee)).toEqual([]);

    const other = await participant(request, 'MENTOR');
    expect((await propose(request, token, mentee, other)).status()).toBe(HTTP_STATUS.CREATED);
  });

  test('a mentee has one open proposal; the coordinator withdraws only a proposal (7.3, 7.4)', async ({ request }) => {
    const [id] = await proposeIds(request, token, mentee, mentor);
    const other = await participant(request, 'MENTOR');

    const second = await propose(request, token, mentee, other);
    expect(second.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(second)).toBe(ERROR_CODES.core.menteeAlreadyPaired);

    const withdrawn = await request.delete(`${PROPOSALS}/${id}`, { headers: authHeaders(token) });
    expect(await withdrawn.json()).toMatchObject([{ id, status: 'DECLINED', declinedBy: 'COORDINATOR' }]);
    const again = await request.delete(`${PROPOSALS}/${id}`, { headers: authHeaders(token) });
    expect(await errorCodeOf(again)).toBe(ERROR_CODES.core.mentorshipNotProposed);
    expect(await errorCodeOf(await answer(request, mentee, id, 'accept'))).toBe(ERROR_CODES.core.mentorshipNotFound);
  });

  test('the mentee chooses one of several mentors; the others close unseen by their mentors (7.1)', async ({ request }) => {
    const other = await participant(request, 'MENTOR');
    const ids = await proposeIds(request, token, mentee, mentor, other);

    expect((await mine(request, mentee)).map((item) => item.awaiting)).toEqual(['MENTEE', 'MENTEE']);
    const chosen = await answer(request, mentee, ids[1], 'accept');
    expect(await chosen.json()).toMatchObject({ id: ids[1], awaiting: 'MENTOR' });

    expect((await mine(request, mentee)).map((item) => item.id)).toEqual([ids[1]]);
    expect((await mine(request, mentor)).map((item) => item.id)).not.toContain(ids[0]);
    expect((await mine(request, other)).map((item) => item.id)).toContain(ids[1]);
    expect(await coordinatorRows(request, token, ids)).toMatchObject([
      { declinedBy: 'SYSTEM', awaiting: null },
      { declinedBy: null, awaiting: 'MENTOR' },
    ]);
  });

  test('declining one option, the mentee declines them all; the coordination sees why (7.3)', async ({ request }) => {
    const other = await participant(request, 'MENTOR');
    const ids = await proposeIds(request, token, mentee, mentor, other);

    expect((await answer(request, mentee, ids[0], 'decline', 'Not this year')).status()).toBe(HTTP_STATUS.OK);

    expect(await mine(request, mentee)).toEqual([]);
    expect(await coordinatorRows(request, token, ids)).toMatchObject([
      { declinedBy: 'MENTEE', declineReason: 'Not this year' },
      { declinedBy: 'MENTEE', declineReason: 'Not this year' },
    ]);
  });

  test('a proposal takes distinct mentors, at most the limit (7.1)', async ({ request }) => {
    const repeated = await propose(request, token, mentee, mentor, mentor);
    expect(repeated.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(repeated)).toBe(ERROR_CODES.core.mentorshipDuplicateMentor);

    const matching = await (await request.get(`${CORE}/coordination/mentees/${mentee.userId}/candidates`,
        { headers: authHeaders(token) })).json();
    // Made-up ids past the first are fine: the size limit is checked before any mentor is looked up.
    const tooMany = await request.post(PROPOSALS, {
      headers: authHeaders(token),
      data: {
        menteeUserId: mentee.userId,
        mentorUserIds: Array.from({ length: matching.maxMentorOptions + 1 }, (_, index) => mentor.userId + index),
      },
    });
    expect(tooMany.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(tooMany)).toBe(ERROR_CODES.core.validationFailed);
  });

  test('a pair answers 404 to anyone outside it (2.9)', async ({ request }) => {
    const [id] = await proposeIds(request, token, mentee, mentor);
    const stranger = await participant(request, 'MENTEE');

    const response = await answer(request, stranger, id, 'accept');
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.mentorshipNotFound);
  });
});
