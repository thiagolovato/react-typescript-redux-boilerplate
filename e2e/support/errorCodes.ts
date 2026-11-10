import { API_ERROR_CODES } from '../../src/constants/errorCodes';

// Problem detail codes the tests expect. Same values as ErrorCodes in mentor-mentee-auth and mentor-mentee-core.
export const ERROR_CODES = {
  auth: {
    passwordTooLong: 'auth.password.tooLong',
    invalidCredentials: 'auth.credentials.invalid',
    accountLocked: 'auth.account.locked',
    userAlreadyExists: 'auth.user.alreadyExists',
  },
  core: {
    accessDenied: 'core.access.denied',
    profileAlreadyExists: 'core.profile.alreadyExists',
    termsNotAccepted: API_ERROR_CODES.core.termsNotAccepted,
    unknownLanguage: 'core.profile.unknownLanguage',
    unknownInterestArea: 'core.profile.unknownInterestArea',
    invalidUserType: 'core.token.invalidUserType',
    cohortNotFound: 'core.cohort.notFound',
    cohortInvalidDates: 'core.cohort.invalidDates',
    cohortOverlap: 'core.cohort.overlap',
    consentOutdated: API_ERROR_CODES.core.consentOutdated,
    consentLanguageUnavailable: 'core.consent.languageUnavailable',
  },
} as const;
