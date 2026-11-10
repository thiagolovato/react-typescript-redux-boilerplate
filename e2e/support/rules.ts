// Business-rule limits the tests check (REGRAS_DE_NEGOCIO.md).
// The app already has some of them; the others mirror backend constants named next to each one.
export { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../src/constants/auth';
export { MAX_AGE, MIN_AGE, MIN_GRADUATION_YEAR } from '../../src/constants/profileOptions';

/** LoginAttemptService.MAX_ATTEMPTS_PER_ACCOUNT in mentor-mentee-auth. */
export const MAX_FAILED_LOGINS_PER_ACCOUNT = 5;

/** CustomerRequest.MAX_GRADUATION_YEAR in mentor-mentee-core. The app form allows fewer years ahead. */
export const MAX_GRADUATION_YEAR = 2100;

/** CohortRequest.MAX_PAIRS in mentor-mentee-core: at most 20 pairs per year. */
export const MAX_PAIRS_PER_COHORT = 20;

/** @Min(1) on CohortRequest.maxPairs and maxMenteesPerMentor. */
export const MIN_PER_COHORT = 1;

/** Character that takes 2 bytes in UTF-8, to test the password byte limit. */
export const TWO_BYTE_CHAR = 'é';
