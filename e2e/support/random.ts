const BASE_36 = 36;
const SUFFIX_LENGTH = 6;

/** Short random text to tell names apart, e.g. `k3f9a1`. */
export function randomSuffix(length = SUFFIX_LENGTH): string {
  // `toString(36)` starts with "0.", so the useful characters begin at index 2.
  const firstDigit = '0.'.length;
  return Math.random().toString(BASE_36).slice(firstDigit, firstDigit + length);
}
