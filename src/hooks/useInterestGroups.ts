import { useEffect, useMemo, useState } from 'react';
import { referenceDataService } from '../service/request';
import { CORE_LANGUAGE_BY_UI_LANGUAGE } from '../constants/coreLanguages';
import { useI18n } from './useI18n';
import type { InterestGroup } from '../types/profile';

interface Loaded {
  /** Language the groups below are named in; null before the first answer. */
  language: string | null;
  groups: InterestGroup[];
  failed: boolean;
}

/** Interest groups and areas named in the interface language. Loads again when the language changes. */
export function useInterestGroups() {
  const { currentLanguage } = useI18n();
  const language = CORE_LANGUAGE_BY_UI_LANGUAGE[currentLanguage];
  const [loaded, setLoaded] = useState<Loaded>({ language: null, groups: [], failed: false });

  useEffect(() => {
    let current = true;
    referenceDataService.getInterestGroups(language)
        .then((groups) => current && setLoaded({ language, groups, failed: false }))
        .catch(() => current && setLoaded({ language, groups: [], failed: true }));
    // A slower answer for a language the person already left must not overwrite the new one.
    return () => {
      current = false;
    };
  }, [language]);

  // Every area, offered or not: profiles keep areas that left the catalog and still show their names.
  const areaNames = useMemo(
      () => new Map(loaded.groups.flatMap((group) => group.areas.map((area) => [area.id, area.name] as const))),
      [loaded.groups],
  );

  return { groups: loaded.groups, areaNames, failed: loaded.failed, loading: loaded.language !== language };
}
