import type { CustomerType } from '../types/auth/register';
import { APP_ROUTES } from './routes';

// Same rules as RegisterResource.MIN_PASSWORD_LENGTH / MAX_PASSWORD_LENGTH in mentor-mentee-auth.
export const MIN_PASSWORD_LENGTH = 8;
// BCrypt reads at most 72 bytes; the server also rejects passwords over 72 bytes.
export const MAX_PASSWORD_LENGTH = 72;

/** Where a signed-in user lands. */
export function homePathFor(type?: CustomerType): string {
  return type === 'COORDINATOR' ? APP_ROUTES.coordination : APP_ROUTES.dashboard;
}

/** Where a user goes after logging out, so coordinators return to their own login page. */
export function loginPathFor(type?: CustomerType): string {
  return type === 'COORDINATOR' ? APP_ROUTES.coordinatorLogin : APP_ROUTES.login;
}
