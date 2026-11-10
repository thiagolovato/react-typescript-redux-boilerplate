import { useCallback } from 'react';
import { useI18n } from './useI18n';
import type { FieldValidationError } from '../types/api';

// Java's Integer.MAX_VALUE: the default `max` of @Size, meaning "no upper limit".
const NO_MAX = 2147483647;

/** `Size` reads differently as a minimum, a maximum or a range, so each has its own text. */
function translationCode(error: FieldValidationError): string {
  if (error.code !== 'Size') return error.code;
  const min = Number(error.params?.min ?? 0);
  const max = Number(error.params?.max ?? NO_MAX);
  if (max === NO_MAX) return 'Size.min';
  if (min <= 0) return 'Size.max';
  return 'Size.range';
}

/**
 * Text for a failed field rule. Looks up `apiErrors.fields.<service>.<field>.<code>` (text for one field
 * of one service, `service` from `ApiError.service`), then `apiErrors.codes.<code>`, then falls back to
 * the server text. The rule's params (`min`, `max`...) fill the placeholders.
 */
export function useFieldErrorText() {
  const { t } = useI18n();
  return useCallback(
      (error: FieldValidationError, service?: string): string => {
        const code = translationCode(error);
        const keys = [`apiErrors.codes.${code}`];
        if (service && error.field) keys.unshift(`apiErrors.fields.${service}.${error.field}.${code}`);
        return t(keys, { ...error.params, defaultValue: error.message });
      },
      [t],
  );
}
