// Mirrors CustomerRequest / CustomerResponse in mentor-mentee-core.

export interface Address {
  city: string;
  region: string;
  country: string;
}

export interface CustomerContact {
  contactType: 'PHONE' | 'EMAIL';
  contactValue: string;
  isPreferentialContact: boolean;
}

/** Body of POST /customers and PUT /customers/me. User id and type come from the token. */
export interface ProfileRequest {
  name: string;
  age: number;
  gender: string;
  /** Codes from the core `language` table, e.g. `en`. */
  languages: string[];
  profession: string;
  generation: string;
  contacts: CustomerContact[];
  address: Address;
  hasRuralTraining: boolean;
  expectations: string;
  interestAreaIds: number[];
  isGraduated: boolean;
  hasMentorshipTraining: boolean;
  hasMentorshipExperience: boolean;
}

export interface Profile extends ProfileRequest {
  userId: number;
  type: 'MENTOR' | 'MENTEE';
}
