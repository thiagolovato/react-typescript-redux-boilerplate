import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  AUTH, authHeaders, coordinatorToken, CORE, createProfile, decodeTokenClaims, errorCodeOf, fetchProfileReferences,
  getMyProfile, profileRequest, registerParticipant, type Role,
} from '../support/api';
import { DEFAULT_PASSWORD } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import { ensureOpenCohort, participant, propose, type Participant } from '../support/mentorship';

// One account, mentor and mentee (PLANO.md, "Mentor que também é mentee"; REGRAS_DE_NEGOCIO.md 2.15).
const UNMATCHED_PAGE_SIZE = 50;

function addRole(request: APIRequestContext, token: string, role: string) {
  return request.post(`${AUTH}/users/roles`, { headers: authHeaders(token), data: { role } });
}

function switchRole(request: APIRequestContext, token: string, role: string) {
  return request.post(`${AUTH}/users/role-switch`, { headers: authHeaders(token), data: { role } });
}

/** Adds `role` to the account and returns the token active in it. */
async function addRoleAndGetToken(request: APIRequestContext, token: string, role: Role): Promise<string> {
  const response = await addRole(request, token, role);
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.OK);
  return (await response.json()).jwt;
}

/** The coordinator's entry for `userId` among the mentees without a pair, read page by page. */
async function findUnmatched(request: APIRequestContext, userId: number) {
  for (let page = 0; ; page += 1) {
    const response = await request.get(`${CORE}/coordination/mentees/unmatched`, {
      headers: authHeaders(coordinatorToken()),
      params: { page, size: UNMATCHED_PAGE_SIZE },
    });
    expect(response.ok()).toBeTruthy();
    const body: { items: { userId: number; alsoMentor: boolean }[]; hasNext: boolean } = await response.json();
    const found = body.items.find((item) => item.userId === userId);
    if (found || !body.hasNext) return found;
  }
}

test.describe('a mentor who is also a mentee', () => {
  test('adds the role, gets a token active in it and cannot add it twice', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');

    const response = await addRole(request, token, 'MENTEE');

    expect(response.status()).toBe(HTTP_STATUS.OK);
    const body = await response.json();
    expect(body.type).toBe('MENTEE');
    expect(body.roles).toEqual(['MENTOR', 'MENTEE']);
    expect(decodeTokenClaims(body.jwt).authorities).toEqual(['ROLE_MENTEE']);
    const again = await addRole(request, token, 'MENTEE');
    expect(again.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(again)).toBe(ERROR_CODES.auth.roleAlreadyAdded);
  });

  test('login stays in the old role after adding one, until the account switches to it', async ({ request }) => {
    const { email, token } = await registerParticipant(request, 'MENTOR');
    await addRoleAndGetToken(request, token, 'MENTEE');

    const login = await request.post(`${AUTH}/users/login`, { data: { email, password: DEFAULT_PASSWORD } });

    expect((await login.json()).type).toBe('MENTOR');
  });

  test('switches only to a role the account has', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');

    const refused = await switchRole(request, token, 'MENTOR');

    expect(refused.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await errorCodeOf(refused)).toBe(ERROR_CODES.auth.roleNotGranted);
  });

  test('a coordinator cannot take a participant role', async ({ request }) => {
    const response = await addRole(request, coordinatorToken(), 'MENTOR');

    expect(response.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.auth.roleNotAllowed);
  });

  test('fills the new profile from the other, keeps both, and is never paired with themself', async ({ request }) => {
    const coordinator = coordinatorToken();
    await ensureOpenCohort(request, coordinator);
    const mentor: Participant = await participant(request, 'MENTOR', { name: 'E2E Both Roles' });
    const menteeToken = await addRoleAndGetToken(request, mentor.token, 'MENTEE');

    const shared = await request.get(`${CORE}/customers/me/shared`, { headers: authHeaders(menteeToken) });
    expect(shared.status()).toBe(HTTP_STATUS.OK);
    const sharedBody = await shared.json();
    expect(sharedBody.name).toBe('E2E Both Roles');
    expect(sharedBody.motivation).toBeUndefined();
    expect((await getMyProfile(request, menteeToken)).status()).toBe(HTTP_STATUS.NOT_FOUND);

    const references = await fetchProfileReferences(request, menteeToken);
    const created = await createProfile(request, menteeToken, profileRequest(references, {
      ...sharedBody, profession: 'Public health', preferredMentorGenders: [],
    }));
    expect(created.status(), await created.text()).toBe(HTTP_STATUS.CREATED);
    expect((await (await getMyProfile(request, menteeToken)).json()).type).toBe('MENTEE');
    expect((await (await getMyProfile(request, mentor.token)).json()).type).toBe('MENTOR');

    const entry = await findUnmatched(request, mentor.userId);
    expect(entry?.alsoMentor).toBe(true);
    const candidates = await request.get(`${CORE}/coordination/mentees/${mentor.userId}/candidates`, {
      headers: authHeaders(coordinator),
    });
    const candidateIds = (await candidates.json()).candidates.map((candidate: { userId: number }) => candidate.userId);
    expect(candidateIds).not.toContain(mentor.userId);
    const selfPair = await propose(request, coordinator, mentor, mentor);
    expect(selfPair.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(selfPair)).toBe(ERROR_CODES.core.mentorshipSelfPair);
  });

  test('a mentee without a mentor profile has nothing to share', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');

    const response = await request.get(`${CORE}/customers/me/shared`, { headers: authHeaders(token) });

    expect(response.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.profileNotFound);
  });
});
