import { expect, type APIRequestContext } from '@playwright/test';
import {
  authHeaders, CORE, createProfile, decodeTokenClaims, fetchProfileReferences, profileRequest, registerParticipant,
  type Role,
} from './api';
import { addDays, toIsoDate, today } from './dates';
import { TEST_COHORT_PREFIX } from './env';
import { HTTP_STATUS } from './http';
import { randomSuffix } from './random';
import { MAX_PAIRS_PER_COHORT, MIN_PER_COHORT } from './rules';

// Shared steps of the mentorship and notification tests (REGRAS_DE_NEGOCIO.md 7 and 13).
export const PROPOSALS = `${CORE}/coordination/mentorships`;
const OPEN_COHORT_LENGTH_DAYS = 30;

export interface Participant {
  email: string;
  token: string;
  userId: number;
}

/** Proposals need a cohort open today. Uses the one the database has, or creates a test one. */
export async function ensureOpenCohort(request: APIRequestContext, token: string) {
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

/** A participant with a complete profile that accepts the terms in force. `overrides` replaces profile fields. */
export async function participant(
  request: APIRequestContext,
  role: Role,
  overrides: Record<string, unknown> = {},
): Promise<Participant> {
  const { email, token } = await registerParticipant(request, role);
  const references = await fetchProfileReferences(request, token);
  const response = await createProfile(request, token, profileRequest(references, {
    name: `E2E ${role} ${randomSuffix()}`,
    preferredMentorGenders: [],
    ...overrides,
  }));
  expect(response.status(), await response.text()).toBe(HTTP_STATUS.CREATED);
  return { email, token, userId: decodeTokenClaims(token).uid };
}

export function propose(request: APIRequestContext, token: string, mentee: Participant, ...mentors: Participant[]) {
  return request.post(PROPOSALS, {
    headers: authHeaders(token),
    data: { menteeUserId: mentee.userId, mentorUserIds: mentors.map((mentor) => mentor.userId) },
  });
}
