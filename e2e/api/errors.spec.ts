import { expect, test, type APIResponse } from '@playwright/test';
import { AUTH, authHeaders, coordinatorToken, CORE } from '../support/api';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';

// Errors the framework raises, not a business rule: through the gateway, every one is a problem detail with a code
// the app translates and a text that names no internals.
const INVALID_FORMAT = 'InvalidFormat';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function problemOf(response: APIResponse) {
  expect(response.headers()['content-type']).toContain('application/problem+json');
  return (await response.json()) as { code: string; detail: string; errors?: { field: string; code: string }[] };
}

test.describe('error responses', () => {
  test('a body that is not JSON answers request.invalid in core and auth', async ({ request }) => {
    const core = await request.post(`${CORE}/coordination/cohorts`, {
      headers: { ...authHeaders(coordinatorToken()), ...JSON_HEADERS },
      data: '{"name": ',
    });
    expect(core.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((await problemOf(core)).code).toBe(ERROR_CODES.core.requestInvalid);

    const auth = await request.post(`${AUTH}/users/login`, { headers: JSON_HEADERS, data: '{"email": ' });
    expect(auth.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((await problemOf(auth)).code).toBe(ERROR_CODES.auth.requestInvalid);
  });

  test('a value of the wrong type answers next to its field', async ({ request }) => {
    const proposal = await request.post(`${CORE}/coordination/mentorships`, {
      headers: authHeaders(coordinatorToken()),
      data: { menteeUserId: 'abc', mentorUserIds: [1] },
    });
    expect(proposal.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    const problem = await problemOf(proposal);
    expect(problem.code).toBe(ERROR_CODES.core.validationFailed);
    expect(problem.errors).toEqual([expect.objectContaining({ field: 'menteeUserId', code: INVALID_FORMAT })]);

    // 2.2: sign-up offers only mentor and mentee.
    const signUp = await request.post(`${AUTH}/users/register`, {
      data: { email: 'nobody@e2e.test', password: 'password123', customerType: 'COORDINATOR' },
    });
    expect(signUp.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect((await problemOf(signUp)).errors).toEqual([
      expect.objectContaining({ field: 'customerType', code: INVALID_FORMAT })]);
  });

  test('a request without a session says why: no token or an invalid one (2.9)', async ({ request }) => {
    const missing = await request.get(`${CORE}/notifications`);
    expect(missing.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect((await problemOf(missing)).code).toBe(ERROR_CODES.auth.tokenMissing);

    const invalid = await request.get(`${CORE}/notifications`, { headers: authHeaders(`${coordinatorToken()}x`) });
    expect(invalid.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect((await problemOf(invalid)).code).toBe(ERROR_CODES.auth.tokenInvalid);

    const authenticate = await request.get(`${AUTH}/users/authenticate`);
    expect(authenticate.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect((await problemOf(authenticate)).code).toBe(ERROR_CODES.auth.tokenMissing);
  });

  test('an unknown path or method answers with a code and no internals', async ({ request }) => {
    const headers = authHeaders(coordinatorToken());

    const unknown = await request.get(`${CORE}/nothing-here`, { headers });
    expect(unknown.status()).toBe(HTTP_STATUS.NOT_FOUND);
    const unknownProblem = await problemOf(unknown);
    expect(unknownProblem.code).toBe(ERROR_CODES.core.requestNotFound);
    expect(unknownProblem.detail).not.toContain('static resource');

    const wrongMethod = await request.delete(`${CORE}/notifications`, { headers });
    expect(wrongMethod.status()).toBe(HTTP_STATUS.METHOD_NOT_ALLOWED);
    expect((await problemOf(wrongMethod)).code).toBe(ERROR_CODES.core.methodNotAllowed);

    const unknownAuth = await request.get(`${AUTH}/users/nothing-here`);
    expect(unknownAuth.status()).toBe(HTTP_STATUS.NOT_FOUND);
    expect((await problemOf(unknownAuth)).code).toBe(ERROR_CODES.auth.requestNotFound);
  });
});
