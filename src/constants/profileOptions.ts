// Language codes offered in the profile. Every code must exist in the core `language` table.
// Names come from Intl.DisplayNames, so they follow the UI language.
export const COMMON_LANGUAGE_CODES = [
  'ar', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'gn', 'he', 'hi',
  'hu', 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'ms', 'nl', 'no', 'pl', 'pt', 'qu', 'ro', 'ru', 'sv',
  'sw', 'th', 'tl', 'tr', 'uk', 'ur', 'vi', 'zh',
] as const;

// Stored as the gender value. SELF_DESCRIBE stores the person's own words instead.
export const GENDER_OPTIONS = [
  'WOMAN',
  'MAN',
  'NON_BINARY',
  'TRANS_WOMAN',
  'TRANS_MAN',
  'GENDERQUEER',
  'GENDERFLUID',
  'AGENDER',
  'TWO_SPIRIT',
  'PREFER_NOT_TO_SAY',
] as const;

export const GENDER_SELF_DESCRIBE = 'SELF_DESCRIBE';
