// Same rules as RegisterResource.MIN_PASSWORD_LENGTH / MAX_PASSWORD_LENGTH in mentor-mentee-auth.
export const MIN_PASSWORD_LENGTH = 8;
// BCrypt reads at most 72 bytes; the server also rejects passwords over 72 bytes.
export const MAX_PASSWORD_LENGTH = 72;
