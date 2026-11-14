import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  authHeaders, coordinatorToken, CORE, createProfile, decodeTokenClaims, errorCodeOf, fetchProfileReferences,
  profileRequest, registerParticipant, type Role,
} from '../support/api';
import { addDays, toIsoDate, today } from '../support/dates';
import { TEST_COHORT_PREFIX } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import { randomSuffix } from '../support/random';
import { MAX_PAIRS_PER_COHORT, MIN_PER_COHORT } from '../support/rules';

// REGRAS_DE_NEGOCIO.md section 7: the coordination proposes, the mentee answers first, then the mentor.
const PROPOSALS = `${CORE}/coordination/mentorships`;
const MINE = `${CORE}/mentorships/mine`;
const OPEN_COHORT_LENGTH_DAYS = 30;

interface Participant {
  token: string;
  userId: number;
}

interface PartyMentorship {
  id: number;
  status: string;
  awaiting: string | null;
  partner: Record<string, unknown>;
  introduction: { name: string; email: string } | null;
}

/** Proposals need a cohort open today. Uses the one the database has, or creates a test one. */
async function ensureOpenCohort(request: APIRequestContext, token: string) {
  const startsOn = today();
  await request.post(`${CORE}/coordination/cohorts`, {
    headers: authHeaders(token),
    data: {
      name: `${TEST_COHORT_PREFIX}open-${randomSuffix()}`,
      startsOn,
      endsOn: toIsoDate(addDays(new Date(), OPEN_COHORT_LENGTH_DAYS)),
      maxPairs: MAX_PAIRS_PER_COHORT,
      maxMenteesPerMentor: MIN_PER_COHORT,
    },
  });
  // 409 means another cohort already covers today: that one is open.
}

/** A participant with a complete profile that accepts the terms in force. */
async function participant(request: APIRequestContext, role: Role): Promise<Participant> {
  const { token } = await registerParticipant(request, role);
  const references = await fetchProfileReferences(request, token);
  const response = await createProfile(request, token, profileRequest(references, {
    name: `E2E ${role} ${randomSuffix()}`,
    preferredMentorGenders: [],
  }));
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.CREATED);
  return { token, userId: decodeTokenClaims(token).uid };
}

function propose(request: APIRequestContext, token: string, mentee: Participant, mentor: Participant) {
  return request.post(PROPOSALS, {
    headers: authHeaders(token),
    data: { menteeUserId: mentee.userId, mentorUserId: mentor.userId },
  });
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
    const proposed = await propose(request, token, mentee, mentor);
    expect(proposed.status(), await proposed.text()).toBe(HTTP_STATUS.CREATED);
    const { id } = await proposed.json();

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
    const { id } = await (await propose(request, token, mentee, mentor)).json();
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

  test('a mentee has one open pair; the coordinator withdraws only a proposal (7.3, 7.4)', async ({ request }) => {
    const { id } = await (await propose(request, token, mentee, mentor)).json();
    const other = await participant(request, 'MENTOR');

    const second = await propose(request, token, mentee, other);
    expect(second.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(second)).toBe(ERROR_CODES.core.menteeAlreadyPaired);

    const withdrawn = await request.delete(`${PROPOSALS}/${id}`, { headers: authHeaders(token) });
    expect(await withdrawn.json()).toMatchObject({ status: 'DECLINED', declinedBy: 'COORDINATOR' });
    const again = await request.delete(`${PROPOSALS}/${id}`, { headers: authHeaders(token) });
    expect(await errorCodeOf(again)).toBe(ERROR_CODES.core.mentorshipNotProposed);
    expect(await errorCodeOf(await answer(request, mentee, id, 'accept'))).toBe(ERROR_CODES.core.mentorshipNotFound);
  });

  test('a pair answers 404 to anyone outside it (2.9)', async ({ request }) => {
    const { id } = await (await propose(request, token, mentee, mentor)).json();
    const stranger = await participant(request, 'MENTEE');

    const response = await answer(request, stranger, id, 'accept');
    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.mentorshipNotFound);
  });
});
