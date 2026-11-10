import { expect, type APIRequestContext } from '@playwright/test';
import { DEFAULT_PASSWORD, GATEWAY_URL, TEST_EMAIL_DOMAIN, TEST_LOCALE } from './env';
import { CONSENT_LANGUAGE_BY_UI_LANGUAGE } from '../../src/constants/legal';
import type { ConsentDocument } from '../../src/types/consent';
import { HTTP_STATUS } from './http';
import { ADULT_AGE, birthDateForAge } from './dates';
import { randomSuffix } from './random';

export const PARTICIPANT_ROLES = ['MENTOR', 'MENTEE'] as const;
export type Role = typeof PARTICIPANT_ROLES[number];

export const AUTH = `${GATEWAY_URL}/auth`;
export const CORE = `${GATEWAY_URL}/mmc`;

/** A fresh address under the test domain, so accounts never clash between tests or runs. */
export function uniqueEmail(label = 'user'): string {
  return `${label}-${Date.now()}-${randomSuffix()}@${TEST_EMAIL_DOMAIN}`;
}

export const authHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

/** Token claims, read without checking the signature. */
export function decodeTokenClaims(jwt: string): { type: string; authorities: string[] } {
  const [, payload] = jwt.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString());
}

/** Calls sign-up and returns the raw response. `customerType` is a string so tests can send invalid roles. */
export function requestSignUp(request: APIRequestContext, email: string, customerType: string, password = DEFAULT_PASSWORD) {
  return request.post(`${AUTH}/users/register`, { data: { email, password, customerType } });
}

/** Calls the mentor and mentee login and returns the raw response. */
export function requestParticipantLogin(request: APIRequestContext, email: string, password: string) {
  return request.post(`${AUTH}/users/login`, { data: { email, password } });
}

/** Calls the coordinator login and returns the raw response. */
export function requestCoordinatorLogin(request: APIRequestContext, email: string, password: string) {
  return request.post(`${AUTH}/users/coordinator/login`, { data: { email, password } });
}

/** Signs up a new participant and returns their e-mail and token. */
export async function registerParticipant(request: APIRequestContext, role: Role) {
  const email = uniqueEmail(role.toLowerCase());
  const response = await requestSignUp(request, email, role);
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.OK);
  const { jwt } = await response.json();
  return { email, token: jwt as string };
}

// The global setup logs the coordinator in once and passes the token to the workers here.
// Logging in from every test would run many logins of one account at once, and the server counts
// logins still in progress against the account limit (2.10), so it would lock the account.
export const COORDINATOR_TOKEN_ENV = 'E2E_COORDINATOR_TOKEN';

/** Token of the test coordinator, from the global setup. */
export function coordinatorToken(): string {
  const token = process.env[COORDINATOR_TOKEN_ENV];
  if (!token) {
    throw new Error(`${COORDINATOR_TOKEN_ENV} is not set. The global setup logs the coordinator in.`);
  }
  return token;
}

const DEFAULT_INTEREST_AREA_COUNT = 2;

/** Fetches the reference data and returns the ids of its first interest areas. */
export async function fetchInterestAreaIds(
  request: APIRequestContext,
  token: string,
  count = DEFAULT_INTEREST_AREA_COUNT,
): Promise<number[]> {
  const response = await request.get(`${CORE}/interest-groups`, { headers: authHeaders(token) });
  expect(response.ok()).toBeTruthy();
  const groups: { areas: { id: number }[] }[] = await response.json();
  return groups.flatMap((group) => group.areas.map((area) => area.id)).slice(0, count);
}

/** Core language code of the consent texts the tests read (the English interface). */
export const CONSENT_LANGUAGE = CONSENT_LANGUAGE_BY_UI_LANGUAGE[TEST_LOCALE];

/** Calls the public endpoint for the consent documents in force and returns the raw response. */
export function requestCurrentConsents(request: APIRequestContext, language: string) {
  return request.get(`${CORE}/consents/current`, { params: { language } });
}

/** Fetches the terms and research consent documents in force, by kind. */
export async function fetchCurrentConsents(request: APIRequestContext, language = CONSENT_LANGUAGE) {
  const response = await requestCurrentConsents(request, language);
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.OK);
  const documents: ConsentDocument[] = await response.json();
  const byKind = (kind: ConsentDocument['kind']) => {
    const document = documents.find((candidate) => candidate.kind === kind);
    if (!document) throw new Error(`No ${kind} document in force`);
    return document;
  };
  return { terms: byKind('TERMS'), research: byKind('RESEARCH') };
}

/** What every valid profile request needs from the server: interest area ids and the consent documents in force. */
export interface ProfileReferences {
  areaIds: number[];
  termsDocumentId: number;
  researchDocumentId: number;
}

export async function fetchProfileReferences(request: APIRequestContext, token: string): Promise<ProfileReferences> {
  const { terms, research } = await fetchCurrentConsents(request);
  return {
    areaIds: await fetchInterestAreaIds(request, token),
    termsDocumentId: terms.id,
    researchDocumentId: research.id,
  };
}

/**
 * A complete, valid profile request that accepts the terms in force, read in English.
 * Override fields to break one rule at a time.
 */
export function profileRequest(references: ProfileReferences, overrides: Record<string, unknown> = {}) {
  return {
    name: 'E2E Participant',
    birthDate: birthDateForAge(ADULT_AGE),
    gender: 'WOMAN',
    languages: ['en', 'pt'],
    profession: 'Nurse',
    graduationYear: 2018,
    academicBackground: 'Nursing degree',
    professionalLink: 'https://example.org/e2e',
    contacts: [{ contactType: 'PHONE', contactValue: '+55 11 99999-0000', isPreferentialContact: true }],
    address: { city: 'Small Village', region: 'Region', country: 'BR' },
    hasRuralTraining: true,
    motivation: 'Help rural health',
    expectations: 'Guidance',
    goals: 'Grow',
    contactPreference: 'VIDEO_CALL',
    interestAreaIds: references.areaIds,
    acceptedTermsDocumentId: references.termsDocumentId,
    researchDocumentId: references.researchDocumentId,
    consentLanguage: CONSENT_LANGUAGE,
    ...overrides,
  };
}

export function createProfile(request: APIRequestContext, token: string, body: object) {
  return request.post(`${CORE}/customers`, { headers: authHeaders(token), data: body });
}

export function updateProfile(request: APIRequestContext, token: string, body: object) {
  return request.put(`${CORE}/customers/me`, { headers: authHeaders(token), data: body });
}

export function getMyProfile(request: APIRequestContext, token: string) {
  return request.get(`${CORE}/customers/me`, { headers: authHeaders(token) });
}

type FieldError = { field?: string };

/** Names of the fields a problem detail reports as invalid. */
export async function invalidFieldNames(response: { json: () => Promise<{ errors?: FieldError[] }> }): Promise<string[]> {
  const body = await response.json();
  return (body.errors ?? []).map((error) => error.field ?? '');
}

/** The `code` of a problem detail. */
export async function errorCodeOf(response: { json: () => Promise<{ code?: string }> }): Promise<string | undefined> {
  return (await response.json()).code;
}
