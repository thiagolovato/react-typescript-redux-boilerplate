import { expect, test, type APIRequestContext } from '@playwright/test';
import {
  createProfile,
  fetchCurrentConsents,
  fetchInterestAreaIds,
  getMyProfile,
  profileRequest,
  requestParticipantLogin,
  requestSignUp,
  updateProfile,
} from '../support/api';
import { runAuthSql } from '../support/db';
import { COORDINATOR, GATEWAY_URL } from '../support/env';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS } from '../support/http';
import { SEED_EMAIL_DOMAIN, SEED_PASSWORD, SEED_PARTICIPANTS, type SeedParticipant } from './participants';

// Dev seed: mentors and mentees in different situations, created through the API so every business rule
// applies. Safe to run again: existing accounts log in, existing profiles stay as they are.
// Run with `npm run seed:dev`; set E2E_GATEWAY_URL to seed another environment.

// Same account as mentor-mentee-auth db/dev/R__dev_users.sql (password "coordinator").
const DEV_COORDINATOR_EMAIL = 'coordinator@test.com';
const LOCAL_HOSTS = ['localhost', '127.0.0.1'];
const ALL_INTEREST_AREAS = Number.MAX_SAFE_INTEGER;
// The base profile carries a test link; seeded people have none unless their data gives one.
const NO_LINK = '';

type Outcome = 'created' | 'profile created' | 'already seeded' | 'signed up, no profile';

const seedEmail = (participant: SeedParticipant) => `${participant.handle}@${SEED_EMAIL_DOMAIN}`;

/** Signs up, or logs in when the account already exists. Returns the token and whether the account is new. */
async function tokenFor(request: APIRequestContext, participant: SeedParticipant) {
  const email = seedEmail(participant);
  const signUp = await requestSignUp(request, email, participant.role, SEED_PASSWORD);
  if (signUp.ok()) {
    return { token: (await signUp.json()).jwt as string, isNew: true };
  }
  expect((await signUp.json()).code, `sign-up of ${email}`).toBe(ERROR_CODES.auth.userAlreadyExists);
  const login = await requestParticipantLogin(request, email, SEED_PASSWORD);
  expect(login.status(), `login of ${email}: ${await login.text()}`).toBe(HTTP_STATUS.OK);
  return { token: (await login.json()).jwt as string, isNew: false };
}

async function seed(request: APIRequestContext, participant: SeedParticipant): Promise<Outcome> {
  const { token, isNew } = await tokenFor(request, participant);
  const { profile } = participant;
  if (!profile) {
    return 'signed up, no profile';
  }
  if ((await getMyProfile(request, token)).ok()) {
    return 'already seeded';
  }

  const allAreaIds = await fetchInterestAreaIds(request, token, ALL_INTEREST_AREAS);
  const { terms, research } = await fetchCurrentConsents(request, profile.consentLanguage);
  const references = { areaIds: [], termsDocumentId: terms.id, researchDocumentId: research.id };
  const body = profileRequest(references, {
    professionalLink: NO_LINK,
    ...profile.fields,
    interestAreaIds: profile.interestAreaIndexes.map((index) => allAreaIds[index % allAreaIds.length]),
    consentLanguage: profile.consentLanguage,
    researchConsent: profile.researchConsent,
  });

  const created = await createProfile(request, token, body);
  expect(created.status(), `profile of ${participant.handle}: ${await created.text()}`).toBe(HTTP_STATUS.CREATED);

  if (profile.changeResearchAfterwards) {
    // The terms are already accepted, so this save only records the new research answer.
    const changed = await updateProfile(request, token,
      { ...body, acceptedTermsDocumentId: null, researchConsent: !profile.researchConsent });
    expect(changed.status(), `research change of ${participant.handle}: ${await changed.text()}`)
      .toBe(HTTP_STATUS.OK);
  }
  return isNew ? 'created' : 'profile created';
}

/** On the local stack, makes sure the dev coordinator exists (other environments seed it with the local profile). */
function ensureLocalDevCoordinator(): boolean {
  if (!LOCAL_HOSTS.includes(new URL(GATEWAY_URL).hostname)) {
    return false;
  }
  runAuthSql(
    `INSERT INTO auth.users (username, password, customer_type)
     VALUES (:'email', :'hash', 'COORDINATOR')
     ON CONFLICT (username) DO NOTHING;`,
    { email: DEV_COORDINATOR_EMAIL, hash: COORDINATOR.passwordHash },
  );
  return true;
}

test('seed dev mentors and mentees', async ({ request }) => {
  const rows = [];
  for (const participant of SEED_PARTICIPANTS) {
    rows.push({
      email: seedEmail(participant),
      role: participant.role,
      result: await seed(request, participant),
      scenario: participant.scenario,
    });
  }

  const coordinator = ensureLocalDevCoordinator();
  console.log(`\nSeeded ${GATEWAY_URL}. Password for every participant: ${SEED_PASSWORD}`);
  console.table(rows);
  if (coordinator) {
    console.log(`Coordinator: ${DEV_COORDINATOR_EMAIL} / ${COORDINATOR.password} at /coordination/login\n`);
  }
});
