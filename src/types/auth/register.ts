/** Types a person can pick at sign-up. Same as RegisterResource.SignUpType in mentor-mentee-auth. */
export type SignUpType = 'MENTOR' | 'MENTEE';

/** Role carried by the token. COORDINATOR accounts come from scripts/create-coordinator.sh, never from sign-up. */
export type CustomerType = SignUpType | 'COORDINATOR';

export interface RegisterRequest {
  email: string;
  password: string;
  customerType: SignUpType;
}

export interface RegisterResponse {
  userId: number;
  username: string;
  jwt: string;
  type: CustomerType;
  authorities: null;
}
