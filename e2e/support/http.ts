// HTTP status codes the backend answers.
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  LOCKED: 423,
} as const;

// Id that no row has, for "not found" checks.
export const NON_EXISTENT_ID = 999_999_999;
