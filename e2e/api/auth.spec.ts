import { expect, test, type APIResponse } from '@playwright/test';
import {
  AUTH,
  authHeaders,
  CORE,
  decodeTokenClaims,
  errorCodeOf,
  PARTICIPANT_ROLES,
  registerParticipant,
  requestCoordinatorLogin,
  requestParticipantLogin,
  requestSignUp,
  uniqueEmail,
} from '../support/api';
import { COORDINATOR, DEFAULT_PASSWORD, WRONG_PASSWORD } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import {
  MAX_FAILED_LOGINS_PER_ACCOUNT,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  TWO_BYTE_CHAR,
} from '../support/rules';

const passwordOfLength = (length: number) => 'a'.repeat(length);

// REGRAS_DE_NEGOCIO.md section 2: roles, sign-up, separate logins, login limits, e-mail and password rules.
test.describe('auth API', () => {
  test('sign-up accepts mentor and mentee and puts the role in the token', async ({ request }) => {
    for (const role of PARTICIPANT_ROLES) {
      const response = await requestSignUp(request, uniqueEmail(role.toLowerCase()), role);
      expect(response.status()).toBe(HTTP_STATUS.OK);
      const claims = decodeTokenClaims((await response.json()).jwt);
      expect(claims.type).toBe(role);
      expect(claims.authorities).toEqual([`ROLE_${role}`]);
    }
  });

  test('sign-up refuses the coordinator role (2.2)', async ({ request }) => {
    const response = await requestSignUp(request, uniqueEmail('fake-coordinator'), 'COORDINATOR');
    expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
  });

  test('password must have 8 to 72 characters and at most 72 bytes (2.12)', async ({ request }) => {
    const signUpStatus = async (password: string) =>
      (await requestSignUp(request, uniqueEmail(), 'MENTOR', password)).status();

    expect(await signUpStatus(passwordOfLength(MIN_PASSWORD_LENGTH - 1))).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await signUpStatus(passwordOfLength(MAX_PASSWORD_LENGTH + 1))).toBe(HTTP_STATUS.BAD_REQUEST);

    // Fewer characters than the limit, but more bytes.
    const tooManyBytes = TWO_BYTE_CHAR.repeat(Math.floor(MAX_PASSWORD_LENGTH / 2) + 1);
    const tooManyBytesResponse = await requestSignUp(request, uniqueEmail(), 'MENTOR', tooManyBytes);
    expect(tooManyBytesResponse.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(tooManyBytesResponse)).toBe(ERROR_CODES.auth.passwordTooLong);

    expect(await signUpStatus(passwordOfLength(MIN_PASSWORD_LENGTH))).toBe(HTTP_STATUS.OK);
    expect(await signUpStatus(passwordOfLength(MAX_PASSWORD_LENGTH))).toBe(HTTP_STATUS.OK);
  });

  test('e-mail is trimmed and lower-cased: case variants are the same account (2.11)', async ({ request }) => {
    const email = uniqueEmail('mixed');
    const response = await requestSignUp(request, `  ${email.toUpperCase()}  `, 'MENTEE');
    expect(response.status()).toBe(HTTP_STATUS.OK);

    expect((await requestParticipantLogin(request, email, DEFAULT_PASSWORD)).status()).toBe(HTTP_STATUS.OK);
    expect((await requestParticipantLogin(request, email.toUpperCase(), DEFAULT_PASSWORD)).status()).toBe(HTTP_STATUS.OK);

    const duplicate = await requestSignUp(request, email, 'MENTOR');
    expect(duplicate.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(duplicate)).toBe(ERROR_CODES.auth.userAlreadyExists);
  });

  test('coordinator logs in only at the coordinator login (2.5)', async ({ request }) => {
    const coordinatorLogin = await requestCoordinatorLogin(request, COORDINATOR.email, COORDINATOR.password);
    expect(coordinatorLogin.status()).toBe(HTTP_STATUS.OK);
    const claims = decodeTokenClaims((await coordinatorLogin.json()).jwt);
    expect(claims.type).toBe('COORDINATOR');
    expect(claims.authorities).toEqual(['ROLE_COORDINATOR']);

    // Wrong role answers exactly like a wrong password, so the role stays hidden.
    const wrongRole = await requestParticipantLogin(request, COORDINATOR.email, COORDINATOR.password);
    const wrongPassword = await requestCoordinatorLogin(request, COORDINATOR.email, WRONG_PASSWORD);
    expect(wrongRole.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    expect(wrongPassword.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    // `instance` (the request path) is the only part allowed to differ.
    const bodyWithoutPath = async (response: APIResponse) => ({ ...(await response.json()), instance: undefined });
    const wrongRoleBody = await bodyWithoutPath(wrongRole);
    expect(wrongRoleBody).toEqual(await bodyWithoutPath(wrongPassword));
    expect(wrongRoleBody.code).toBe(ERROR_CODES.auth.invalidCredentials);

    // A good login gives the failed attempts back (2.10).
    expect((await requestCoordinatorLogin(request, COORDINATOR.email, COORDINATOR.password)).status())
      .toBe(HTTP_STATUS.OK);
  });

  test('mentor and mentee cannot use the coordinator login (2.5)', async ({ request }) => {
    for (const role of PARTICIPANT_ROLES) {
      const { email } = await registerParticipant(request, role);
      const response = await requestCoordinatorLogin(request, email, DEFAULT_PASSWORD);
      expect(response.status()).toBe(HTTP_STATUS.UNAUTHORIZED);
      expect(await errorCodeOf(response)).toBe(ERROR_CODES.auth.invalidCredentials);
      expect((await requestParticipantLogin(request, email, DEFAULT_PASSWORD)).status()).toBe(HTTP_STATUS.OK);
    }
  });

  test('locks the account after 5 failed logins, even with the right password (2.10)', async ({ request }) => {
    const { email } = await registerParticipant(request, 'MENTEE');
    for (let attempt = 1; attempt <= MAX_FAILED_LOGINS_PER_ACCOUNT; attempt++) {
      expect((await requestParticipantLogin(request, email, WRONG_PASSWORD)).status()).toBe(HTTP_STATUS.UNAUTHORIZED);
    }
    const locked = await requestParticipantLogin(request, email, DEFAULT_PASSWORD);
    expect(locked.status()).toBe(HTTP_STATUS.LOCKED);
    expect(await errorCodeOf(locked)).toBe(ERROR_CODES.auth.accountLocked);
  });

  test('a good login gives the failed attempts back (2.10)', async ({ request }) => {
    const { email } = await registerParticipant(request, 'MENTOR');
    // Twice the limit in failures, split by a good login: never locked.
    const rounds = 2;
    for (let round = 1; round <= rounds; round++) {
      for (let attempt = 1; attempt < MAX_FAILED_LOGINS_PER_ACCOUNT; attempt++) {
        expect((await requestParticipantLogin(request, email, WRONG_PASSWORD)).status()).toBe(HTTP_STATUS.UNAUTHORIZED);
      }
      expect((await requestParticipantLogin(request, email, DEFAULT_PASSWORD)).status()).toBe(HTTP_STATUS.OK);
    }
  });

  test('the token authenticates', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    expect((await request.get(`${AUTH}/users/authenticate`, { headers: authHeaders(token) })).ok()).toBeTruthy();
  });

  test('participants cannot list or read other profiles (2.8)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const anyProfileId = 1;
    expect((await request.get(`${CORE}/matches`, { headers: authHeaders(token) })).status())
      .toBe(HTTP_STATUS.NOT_FOUND);
    expect((await request.get(`${CORE}/customers/${anyProfileId}`, { headers: authHeaders(token) })).status())
      .toBe(HTTP_STATUS.NOT_FOUND);
  });
});
