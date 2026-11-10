import { useI18n } from '../../hooks/useI18n';
import { useFieldErrorText } from '../../hooks/useFieldErrorText';
import type { ApiError } from '../../types/api';

const SERVER_ERROR_STATUS = 500;

interface ApiErrorAlertProps {
  error: ApiError | null | undefined;
  /** Text when there is nothing better: network failure, server error, empty answer. */
  fallback: string;
  /** Fields the form already shows next to their input. They are left out of the list here. */
  inlineFields?: readonly string[];
}

/**
 * Shows a failed request: one line for the request, plus the field errors the form does not show inline.
 * The line is the translation of the server `code` (`apiErrors.problems`), else the server text, else `fallback`.
 */
export function ApiErrorAlert({ error, fallback, inlineFields = [] }: ApiErrorAlertProps) {
  const { t } = useI18n();
  const fieldErrorText = useFieldErrorText();

  if (!error) return null;

  const listed = error.errors.filter((fieldError) => !fieldError.field || !inlineFields.includes(fieldError.field));
  // 5xx text is for logs, not for people.
  const serverText = error.status !== undefined && error.status < SERVER_ERROR_STATUS ? error.message : undefined;
  const untranslated = serverText ?? fallback;
  let title = untranslated;
  if (error.errors.length > 0) {
    title = t('apiErrors.checkFields');
  } else if (error.code) {
    title = t(`apiErrors.problems.${error.code}`, { defaultValue: untranslated });
  }

  return (
    <div role="alert" className="rounded-lg border border-error-main/40 bg-error-light p-3 text-sm text-error-dark">
      <p>{title}</p>
      {listed.length > 0 && (
        <ul className="mt-2 list-disc pl-5">
          {listed.map((fieldError, index) => (
            <li key={`${fieldError.field}-${index}`}>
              {fieldError.field && <span className="font-medium">{fieldError.field}: </span>}
              {fieldErrorText(fieldError, error.service)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
