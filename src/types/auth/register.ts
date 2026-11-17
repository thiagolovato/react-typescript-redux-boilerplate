/** Types a person can pick at sign-up. Same as RegisterResource.SignUpType in mentor-mentee-auth. */
export type SignUpType = 'MENTOR' | 'MENTEE';

/** Role carried by the token. COORDINATOR accounts come from scripts/create-coordinator.sh in mentor-mentee-auth, never from sign-up. */
export type CustomerType = SignUpType | 'COORDINATOR';

export interface RegisterRequest {
  email: string;
  password: string;
  customerType: SignUpType;
}

/** Response of register, login, authenticate and the role endpoints of mentor-mentee-auth. */
export interface RegisterResponse {
  userId: number;
  username: string;
  jwt: string;
  /** Role the token is active in. */
  type: CustomerType;
  authorities: string[];
  /** Every role of the account. A participant can be mentor and mentee; a coordinator only coordinator. */
  roles: CustomerType[];
}
