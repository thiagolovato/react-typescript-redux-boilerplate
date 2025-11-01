export interface RegisterRequest {
  email: string;
  password: string;
  customerType: 'MENTOR' | 'MENTEE';
}

export interface RegisterResponse {
  userId: number;
  username: string;
  jwt: string;
  type: CustomerType;
  authorities: null;
}

export type CustomerType = 'MENTOR' | 'MENTEE';
