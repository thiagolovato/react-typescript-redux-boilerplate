import axios from 'axios';
import type { ApiError, FieldValidationError, ProblemDetail } from '../../types/api';

/** Thrown by every call in api.ts. `details` holds the parsed server answer. */
export class ApiRequestError extends Error {
  readonly details: ApiError;

  constructor(details: ApiError) {
    super(details.message);
    this.name = 'ApiRequestError';
    this.details = details;
  }
}

/** Parses any failure (problem detail, plain text from the gateway, network error) into an ApiError. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiRequestError) return error.details;
  if (!axios.isAxiosError(error) || !error.response) return { errors: [] };

  const { status, data } = error.response;
  if (typeof data === 'string') return { status, message: data || undefined, errors: [] };

  const problem = (data ?? {}) as ProblemDetail;
  return {
    status,
    message: problem.detail,
    code: problem.code,
    service: problem.code?.split('.')[0],
    errors: Array.isArray(problem.errors) ? problem.errors : [],
  };
}

export const toApiRequestError = (error: unknown) => new ApiRequestError(toApiError(error));

/** First error for a field, e.g. `fieldErrorOf(error, 'address.city')`. */
export function fieldErrorOf(error: ApiError | null | undefined, field: string): FieldValidationError | undefined {
  return error?.errors.find((fieldError) => fieldError.field === field);
}
