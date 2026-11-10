import type { CustomerType } from '../types/auth/register';

// Same rules as RegisterResource.MIN_PASSWORD_LENGTH / MAX_PASSWORD_LENGTH in mentor-mentee-auth.
export const MIN_PASSWORD_LENGTH = 8;
// BCrypt reads at most 72 bytes; the server also rejects passwords over 72 bytes.
export const MAX_PASSWORD_LENGTH = 72;

// Coordinators sign in on their own page. Nothing links to it: coordinators get the address directly.
export const LOGIN_PATH = '/login';
export const COORDINATOR_LOGIN_PATH = '/coordination/login';

/** Where a signed-in user lands. */
export function homePathFor(type?: CustomerType): string {
  return type === 'COORDINATOR' ? '/coordination' : '/dashboard';
}

/** Where a user goes after logging out, so coordinators return to their own login page. */
export function loginPathFor(type?: CustomerType): string {
  return type === 'COORDINATOR' ? COORDINATOR_LOGIN_PATH : LOGIN_PATH;
}
