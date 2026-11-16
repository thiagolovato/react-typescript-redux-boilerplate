import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import en from '../../src/i18n/locales/en-US.json' with { type: 'json' };
import pt from '../../src/i18n/locales/pt-BR.json' with { type: 'json' };

// Every problem code a service sends has its text in both locales, so nobody reads an English server text in the
// Portuguese interface. Reads the Java sources next to this project (workspace layout of the README).
const WORKSPACE = fileURLToPath(new URL('../../../', import.meta.url));
const CODE_SOURCES = [
  'mentor-mentee-core/src/main/java/com/mentormentee/core/config/ErrorCodes.java',
  'mentor-mentee-auth/auth-service/src/main/java/com/mentormenteeauth/exception/ErrorCodes.java',
  'mentor-mentee-auth/auth-shared/src/main/java/com/mentormenteeauth/configuration/token/TokenProblemEntryPoint.java',
];
// 5xx answers show the page's own message instead (ApiErrorAlert), which says what failed.
const SHOWN_AS_PAGE_MESSAGE = /\.unexpected$/;
const FIELD_ERROR_CODES = ['InvalidFormat'];

const codes = [...new Set(CODE_SOURCES.flatMap((source) => [
  ...readFileSync(WORKSPACE + source, 'utf8').matchAll(/public static final String \w+ = "((?:auth|core)\.[^"]+)"/g),
].map((match) => match[1])))].filter((code) => !SHOWN_AS_PAGE_MESSAGE.test(code));

function textOf(locale: unknown, path: string[]): unknown {
  return path.reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], locale);
}

test.describe('error translations', () => {
  test('the services send codes', () => {
    expect(codes.length).toBeGreaterThan(30);
  });

  for (const [name, locale] of [['en-US', en], ['pt-BR', pt]] as const) {
    test(`every problem code has a text in ${name}`, () => {
      const missing = codes.filter((code) => typeof textOf(locale, ['apiErrors', 'problems', ...code.split('.')]) !== 'string');
      expect(missing).toEqual([]);
    });

    test(`field error codes the services add have a text in ${name}`, () => {
      const missing = FIELD_ERROR_CODES.filter((code) => typeof textOf(locale, ['apiErrors', 'codes', code]) !== 'string');
      expect(missing).toEqual([]);
    });
  }
});
