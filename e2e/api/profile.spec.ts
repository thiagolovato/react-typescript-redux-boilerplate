import { expect, test } from '@playwright/test';
import {
  coordinatorToken,
  createProfile,
  errorCodeOf,
  fetchInterestAreaIds,
  getMyProfile,
  invalidFieldNames,
  profileRequest,
  registerParticipant,
  updateProfile,
} from '../support/api';
import { birthDateForAge } from '../support/dates';
import { psqlBoolean, runCoreSql } from '../support/db';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS, NON_EXISTENT_ID } from '../support/http';
import { MAX_AGE, MAX_GRADUATION_YEAR, MIN_AGE, MIN_GRADUATION_YEAR, TERMS_VERSION } from '../support/rules';

const TERMS_CONSENT_KIND = 'TERMS';

// REGRAS_DE_NEGOCIO.md sections 3 (profile) and 4 (consent).
test.describe('profile API', () => {
  test('role and user come from the token, not the body (3.1)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const areas = await fetchInterestAreaIds(request, token);
    const forgedUserId = 1;
    const response = await createProfile(request, token, profileRequest(areas, { type: 'MENTOR', userId: forgedUserId }));
    expect(response.status(), await response.text()).toBe(HTTP_STATUS.CREATED);
    const profile = await response.json();
    expect(profile.type).toBe('MENTEE');
    expect(profile.userId).not.toBe(forgedUserId);
  });

  test('one profile per user (3.1)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    const body = profileRequest(await fetchInterestAreaIds(request, token));
    expect((await createProfile(request, token, body)).status()).toBe(HTTP_STATUS.CREATED);
    const second = await createProfile(request, token, body);
    expect(second.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(second)).toBe(ERROR_CODES.core.profileAlreadyExists);
  });

  test('required fields (3.2)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const response = await createProfile(request, token, { acceptTerms: true });
    expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await invalidFieldNames(response)).toEqual(expect.arrayContaining([
      'name', 'birthDate', 'gender', 'languages', 'profession', 'graduationYear', 'academicBackground',
      'address', 'motivation', 'expectations', 'goals', 'contactPreference', 'interestAreaIds',
    ]));
  });

  test('age between 16 and 120 (3.3)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const areas = await fetchInterestAreaIds(request, token);
    const turnsMinAgeTomorrow = birthDateForAge(MIN_AGE, -1);
    const reachedMaxAge = birthDateForAge(MAX_AGE);
    for (const birthDate of [turnsMinAgeTomorrow, reachedMaxAge]) {
      const response = await createProfile(request, token, profileRequest(areas, { birthDate }));
      expect(response.status(), birthDate).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(await invalidFieldNames(response)).toContain('birthDateInRange');
    }
    const turnsMinAgeToday = birthDateForAge(MIN_AGE);
    expect((await createProfile(request, token, profileRequest(areas, { birthDate: turnsMinAgeToday }))).status())
      .toBe(HTTP_STATUS.CREATED);
  });

  test('graduation year between 1940 and 2100 (3.4)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    const areas = await fetchInterestAreaIds(request, token);
    for (const graduationYear of [MIN_GRADUATION_YEAR - 1, MAX_GRADUATION_YEAR + 1]) {
      const response = await createProfile(request, token, profileRequest(areas, { graduationYear }));
      expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(await invalidFieldNames(response)).toContain('graduationYear');
    }
    expect((await createProfile(request, token, profileRequest(areas, { graduationYear: MAX_GRADUATION_YEAR }))).status())
      .toBe(HTTP_STATUS.CREATED);
  });

  test('professional link must start with http:// or https:// (3.5)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    const areas = await fetchInterestAreaIds(request, token);
    const response = await createProfile(request, token, profileRequest(areas, { professionalLink: 'ftp://example.org' }));
    expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await invalidFieldNames(response)).toContain('professionalLink');
    expect((await createProfile(request, token, profileRequest(areas, { professionalLink: 'http://example.org' }))).status())
      .toBe(HTTP_STATUS.CREATED);
  });

  test('languages and interest areas must exist; repeats count once (3.6)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const [firstArea] = await fetchInterestAreaIds(request, token);

    const unknownLanguage = await createProfile(request, token, profileRequest([firstArea], { languages: ['xx_ZZ'] }));
    expect(unknownLanguage.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(unknownLanguage)).toBe(ERROR_CODES.core.unknownLanguage);

    const unknownArea = await createProfile(request, token, profileRequest([NON_EXISTENT_ID]));
    expect(unknownArea.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(unknownArea)).toBe(ERROR_CODES.core.unknownInterestArea);

    const repeated = await createProfile(request, token,
      profileRequest([firstArea, firstArea], { languages: ['en', 'en'] }));
    expect(repeated.status()).toBe(HTTP_STATUS.CREATED);
    const profile = await repeated.json();
    expect(profile.languages).toEqual(['en']);
    expect(profile.interestAreaIds).toEqual([firstArea]);
  });

  test('mentor-only fields are ignored for a mentee (3.7)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const response = await createProfile(request, token, profileRequest(await fetchInterestAreaIds(request, token), {
      hasMentorshipExperience: true,
      hasMentorshipTraining: true,
      acceptedBackgrounds: 'Nursing students',
      preferredMentorGender: 'WOMAN',
    }));
    expect(response.status()).toBe(HTTP_STATUS.CREATED);
    const profile = await response.json();
    expect(profile.hasMentorshipExperience).toBe(false);
    expect(profile.hasMentorshipTraining).toBe(false);
    expect(profile.acceptedBackgrounds).toBeNull();
    expect(profile.preferredMentorGender).toBe('WOMAN');
  });

  test('mentee-only fields are ignored for a mentor (3.7)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    const response = await createProfile(request, token, profileRequest(await fetchInterestAreaIds(request, token), {
      hasMentorshipExperience: true,
      acceptedBackgrounds: 'Nursing students',
      preferredMentorGender: 'WOMAN',
    }));
    expect(response.status()).toBe(HTTP_STATUS.CREATED);
    const profile = await response.json();
    expect(profile.hasMentorshipExperience).toBe(true);
    expect(profile.acceptedBackgrounds).toBe('Nursing students');
    expect(profile.preferredMentorGender).toBeNull();
  });

  test('login e-mail is stored from the token, never from the body, and not returned (3.8)', async ({ request }) => {
    const { email, token } = await registerParticipant(request, 'MENTOR');
    const response = await createProfile(request, token,
      profileRequest(await fetchInterestAreaIds(request, token), { email: 'attacker@example.org' }));
    expect(response.status()).toBe(HTTP_STATUS.CREATED);
    const profile = await response.json();
    expect(profile).not.toHaveProperty('email');
    expect(JSON.stringify(await (await getMyProfile(request, token)).json())).not.toContain(email);

    const [[storedEmail]] = runCoreSql(`SELECT email FROM core.customer WHERE user_id = :'id';`,
      { id: String(profile.userId) });
    expect(storedEmail).toBe(email);
  });

  test('saving requires accepting the current terms (4.1)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const areas = await fetchInterestAreaIds(request, token);
    for (const acceptTerms of [undefined, false]) {
      const response = await createProfile(request, token, profileRequest(areas, { acceptTerms }));
      expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
      expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.termsNotAccepted);
    }
    const created = await createProfile(request, token, profileRequest(areas));
    expect((await created.json()).termsAccepted).toBe(true);

    // Already accepted the current version: later saves do not ask again.
    const newName = 'Renamed';
    const updated = await updateProfile(request, token, profileRequest(areas, { acceptTerms: undefined, name: newName }));
    expect(updated.status()).toBe(HTTP_STATUS.OK);
    expect((await updated.json()).name).toBe(newName);
  });

  test('research consent is optional, defaults to no and keeps the last choice (4.3)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    const areas = await fetchInterestAreaIds(request, token);

    const created = await createProfile(request, token, profileRequest(areas));
    expect((await created.json()).researchConsent).toBe(false);

    const granted = await updateProfile(request, token, profileRequest(areas, { researchConsent: true }));
    expect((await granted.json()).researchConsent).toBe(true);

    const kept = await updateProfile(request, token, profileRequest(areas, { researchConsent: undefined }));
    expect((await kept.json()).researchConsent).toBe(true);

    const withdrawn = await updateProfile(request, token, profileRequest(areas, { researchConsent: false }));
    expect((await withdrawn.json()).researchConsent).toBe(false);
  });

  test('each consent decision is a new row with the app terms version (4.2, 4.4)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const areas = await fetchInterestAreaIds(request, token);
    const profile = await (await createProfile(request, token, profileRequest(areas, { researchConsent: true }))).json();
    // Same choices again: no new decision, no new row.
    await updateProfile(request, token, profileRequest(areas, { researchConsent: true }));
    await updateProfile(request, token, profileRequest(areas, { researchConsent: false }));

    const rows = runCoreSql(
      `SELECT c.kind, c.version, c.granted FROM core.customer_consent c
         JOIN core.customer u ON u.id = c.customer_id
        WHERE u.user_id = :'id' ORDER BY c.id;`,
      { id: String(profile.userId) },
    ).map(([kind, version, granted]) => ({ kind, version, granted: psqlBoolean(granted) }));

    expect(rows.filter((row) => row.kind === TERMS_CONSENT_KIND))
      .toEqual([{ kind: TERMS_CONSENT_KIND, version: TERMS_VERSION, granted: true }]);
    expect(rows.filter((row) => row.kind !== TERMS_CONSENT_KIND).map((row) => row.granted)).toEqual([true, false]);
  });

  test('coordinator cannot create a profile (2.4)', async ({ request }) => {
    const token = coordinatorToken();
    const response = await createProfile(request, token, profileRequest(await fetchInterestAreaIds(request, token)));
    expect(response.status()).toBe(HTTP_STATUS.FORBIDDEN);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.invalidUserType);
  });
});
