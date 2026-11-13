// Error contract shared by every backend service (auth and core).

/** One failed field rule. Same shape as `FieldValidationError` in mentor-mentee-auth and mentor-mentee-core. */
export interface FieldValidationError {
  /** Request field path, e.g. `password` or `address.city`. Null for errors about the whole body. */
  field: string | null;
  /** Constraint name, e.g. `NotBlank`, `Size`, `Email`. The app translates it (`apiErrors.codes`). */
  code: string;
  /** The rule's attributes, e.g. `{ min: 8, max: 2147483647 }` for `Size`. Used in the translation. */
  params?: Record<string, string | number | boolean>;
  /** English text from the server. The fallback when the app has no translation. */
  message: string;
}

/** Error body of every service: a problem detail (RFC 9457). `errors` is set on validation failures (400). */
export interface ProblemDetail {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  /** Stable error code `<service>.<context>.<error>`, e.g. `auth.user.alreadyExists`. Translated from `apiErrors.problems`. */
  code?: string;
  errors?: FieldValidationError[];
}

/** A failed request, parsed. Plain data so Redux can keep it in state. */
export interface ApiError {
  /** HTTP status. Missing when the server could not be reached. */
  status?: number;
  /** Server text for the whole request (`detail`), in English. */
  message?: string;
  /** Stable error code from the server, when it sent one. */
  code?: string;
  /** Service that answered (`auth`, `core`): the first segment of `code`. Scopes field translations. */
  service?: string;
  /** Every failed field rule, in server order. */
  errors: FieldValidationError[];
}

/** One page of a list. Same shape as `PageResponse` in mentor-mentee-core. */
export interface PageResponse<T> {
  items: T[];
  /** Zero-based page number. */
  page: number;
  /** Items in the whole list, not only this page. */
  totalItems: number;
  hasNext: boolean;
}
