import { useMemo } from 'react';
import { useI18n } from './useI18n';

/** Country, language and date names in the interface language. */
export function useDisplayNames() {
  const { currentLanguage } = useI18n();

  return useMemo(() => {
    const regions = new Intl.DisplayNames([currentLanguage], { type: 'region' });
    const languages = new Intl.DisplayNames([currentLanguage], { type: 'language' });
    const dates = new Intl.DateTimeFormat(currentLanguage, { dateStyle: 'medium' });
    return {
      /** ISO 3166-1 alpha-2 code to a name. */
      country: (code: string) => regions.of(code) ?? code,
      // Core codes use "_" (pt_BR); Intl expects BCP 47 tags (pt-BR).
      language: (code: string) => languages.of(code.replace('_', '-')) ?? code,
      date: (iso: string) => dates.format(new Date(iso)),
      /** City, region and country, skipping the empty ones. */
      place: (city: string | null | undefined, region: string | null | undefined, country: string | null | undefined) =>
        [city, region, country && regions.of(country)].filter(Boolean).join(', '),
    };
  }, [currentLanguage]);
}
