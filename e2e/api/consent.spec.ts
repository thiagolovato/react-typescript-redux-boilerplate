import { createHash } from 'node:crypto';
import { expect, test } from '@playwright/test';
import {
  createProfile,
  errorCodeOf,
  fetchCurrentConsents,
  fetchProfileReferences,
  invalidFieldNames,
  profileRequest,
  registerParticipant,
  requestCurrentConsents,
} from '../support/api';
import { runCoreSql } from '../support/db';
import { ERROR_CODES } from '../support/errorCodes';
import { HTTP_STATUS, NON_EXISTENT_ID } from '../support/http';
import { CORE_LANGUAGE_BY_UI_LANGUAGE } from '../../src/constants/coreLanguages';

// Versioned consent documents. REGRAS_DE_NEGOCIO.md section 4.
const CONSENT_LANGUAGES = Object.values(CORE_LANGUAGE_BY_UI_LANGUAGE);
const LANGUAGE_WITHOUT_TEXT = 'fr';

const sha256Hex = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

test.describe('consent API', () => {
  test('documents in force are public, in every interface language, with the same ids (4.1)', async ({ request }) => {
    const byLanguage = await Promise.all(CONSENT_LANGUAGES.map((language) => fetchCurrentConsents(request, language)));

    const [first] = byLanguage;
    for (const [index, documents] of byLanguage.entries()) {
      const language = CONSENT_LANGUAGES[index];
      for (const document of [documents.terms, documents.research]) {
        expect(document.language).toBe(language);
        expect(document.languages).toEqual(expect.arrayContaining(CONSENT_LANGUAGES));
        expect(document.sha256).toBe(sha256Hex(document.body));
      }
      // One document per version: only the text changes with the language.
      expect(documents.terms.id).toBe(first.terms.id);
      expect(documents.research.id).toBe(first.research.id);
    }
  });

  test('a language without text answers 400', async ({ request }) => {
    const response = await requestCurrentConsents(request, LANGUAGE_WITHOUT_TEXT);
    expect(response.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.consentLanguageUnavailable);
  });

  test('accepting a document that is not the terms in force is refused (4.1)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const references = await fetchProfileReferences(request, token);

    for (const acceptedTermsDocumentId of [references.researchDocumentId, NON_EXISTENT_ID]) {
      const response = await createProfile(request, token, profileRequest(references, { acceptedTermsDocumentId }));
      expect(response.status()).toBe(HTTP_STATUS.CONFLICT);
      expect(await errorCodeOf(response)).toBe(ERROR_CODES.core.consentOutdated);
    }
  });

  test('a research answer names the document it answers (4.3)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTOR');
    const references = await fetchProfileReferences(request, token);

    const withoutDocument = await createProfile(request, token,
      profileRequest(references, { researchConsent: true, researchDocumentId: null }));
    expect(withoutDocument.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await invalidFieldNames(withoutDocument)).toContain('researchDecisionComplete');

    const outdated = await createProfile(request, token,
      profileRequest(references, { researchConsent: true, researchDocumentId: references.termsDocumentId }));
    expect(outdated.status()).toBe(HTTP_STATUS.CONFLICT);
    expect(await errorCodeOf(outdated)).toBe(ERROR_CODES.core.consentOutdated);
  });

  test('a decision needs the language the person read, and the document must have a text in it (4.4)', async ({ request }) => {
    const { token } = await registerParticipant(request, 'MENTEE');
    const references = await fetchProfileReferences(request, token);

    const withoutLanguage = await createProfile(request, token, profileRequest(references, { consentLanguage: null }));
    expect(withoutLanguage.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await invalidFieldNames(withoutLanguage)).toContain('consentLanguageGiven');

    const withoutText = await createProfile(request, token,
      profileRequest(references, { consentLanguage: LANGUAGE_WITHOUT_TEXT }));
    expect(withoutText.status()).toBe(HTTP_STATUS.BAD_REQUEST);
    expect(await errorCodeOf(withoutText)).toBe(ERROR_CODES.core.consentLanguageUnavailable);
  });

  test('published texts never change (4.4)', () => {
    // Each statement runs in a transaction rolled back at the end, so a broken trigger fails the test
    // without changing the texts of the local database.
    const inRolledBackTransaction = (statement: string) => `BEGIN;\n${statement}\nROLLBACK;`;
    for (const statement of [
      `UPDATE core.consent_document_text SET title = title || ' changed';`,
      'DELETE FROM core.consent_document_text;',
      'TRUNCATE core.consent_document_text;',
      'TRUNCATE core.consent_document CASCADE;',
    ]) {
      expect(() => runCoreSql(inRolledBackTransaction(statement)), statement)
        .toThrow(/Published consent documents never change/);
    }
  });
});
