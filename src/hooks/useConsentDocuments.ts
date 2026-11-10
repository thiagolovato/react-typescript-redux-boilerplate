import { useCallback, useEffect, useState } from 'react';
import { consentService } from '../service/request/api';
import { toApiError } from '../service/request/apiError';
import { CONSENT_LANGUAGE_BY_UI_LANGUAGE } from '../constants/legal';
import { useI18n } from './useI18n';
import type { ApiError } from '../types/api';
import type { ConsentDocument, ConsentKind } from '../types/consent';

type ConsentDocuments = Partial<Record<ConsentKind, ConsentDocument>>;

interface Loaded {
  /** Language the documents below are in; null before the first answer. */
  language: string | null;
  documents: ConsentDocuments;
  error: ApiError | null;
}

/** Fetches the documents in force and returns what the hook keeps, failure included. */
async function fetchDocuments(language: string): Promise<Loaded> {
  try {
    const list = await consentService.getCurrent(language);
    return { language, documents: Object.fromEntries(list.map((document) => [document.kind, document])), error: null };
  } catch (err) {
    return { language, documents: {}, error: toApiError(err) };
  }
}

/**
 * The consent documents in force, in the interface language. Loads again when the language changes,
 * and on `reload` (for example after the server says a newer version is in force).
 */
export function useConsentDocuments() {
  const { currentLanguage } = useI18n();
  const language = CONSENT_LANGUAGE_BY_UI_LANGUAGE[currentLanguage];
  const [loaded, setLoaded] = useState<Loaded>({ language: null, documents: {}, error: null });

  useEffect(() => {
    let current = true;
    fetchDocuments(language).then((result) => {
      if (current) setLoaded(result);
    });
    // A slower answer for a language the person already left must not overwrite the new one.
    return () => {
      current = false;
    };
  }, [language]);

  const reload = useCallback(async () => {
    const result = await fetchDocuments(language);
    // Same guard as the effect: keep the answer only if the interface language did not change meanwhile.
    setLoaded((previous) => (previous.language === null || previous.language === result.language ? result : previous));
  }, [language]);

  return {
    documents: loaded.documents,
    language,
    error: loaded.error,
    loading: loaded.language !== language,
    reload,
  };
}
