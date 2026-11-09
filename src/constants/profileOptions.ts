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

// A mentee can ask for a mentor of one of these genders, or leave it empty for no preference.
export const PREFERRED_MENTOR_GENDER_OPTIONS = GENDER_OPTIONS.filter((option) => option !== 'PREFER_NOT_TO_SAY');

export const CONTACT_PREFERENCES = ['VIDEO_CALL', 'PHONE_CALL', 'MESSAGING', 'EMAIL', 'NO_PREFERENCE'] as const;

// The subscription forms accept graduation years from the past or a few years ahead.
export const MIN_GRADUATION_YEAR = 1940;
export const MAX_GRADUATION_YEARS_AHEAD = 10;

// Same limit as CustomerRequest.MIN_AGE in mentor-mentee-core.
export const MIN_AGE = 16;
