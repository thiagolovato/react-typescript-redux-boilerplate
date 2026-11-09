// Mirrors CustomerRequest / CustomerResponse in mentor-mentee-core.

export interface Address {
  city: string;
  /** Optional: the subscription forms only ask for city and country. */
  region: string;
  /** ISO 3166-1 alpha-2 code, e.g. `PT`. */
  country: string;
}

export interface CustomerContact {
  contactType: 'PHONE' | 'EMAIL';
  contactValue: string;
  isPreferentialContact: boolean;
}

export type CustomerType = 'MENTOR' | 'MENTEE';

export type ContactPreference = 'VIDEO_CALL' | 'PHONE_CALL' | 'MESSAGING' | 'EMAIL' | 'NO_PREFERENCE';

/**
 * Body of POST /customers and PUT /customers/me. User id and type come from the token.
 * Fields of the other role are ignored by the server.
 */
export interface ProfileRequest {
  name: string;
  /** ISO date, `YYYY-MM-DD`. */
  birthDate: string;
  gender: string;
  /** Codes from the core `language` table, e.g. `en`. */
  languages: string[];
  /** Mentor: profession. Mentee: career choice. */
  profession: string;
  graduationYear: number;
  academicBackground: string;
  professionalLink: string;
  contacts: CustomerContact[];
  address: Address;
  hasRuralTraining: boolean;
  motivation: string;
  expectations: string;
  goals: string;
  contactPreference: ContactPreference;
  /** Mentee only. Empty means no preference. */
  preferredMentorGender: string;
  otherPartyPreferences: string;
  /** Mentor only. */
  acceptedBackgrounds: string;
  additionalInfo: string;
  interestAreaIds: number[];
  /** Mentor only. */
  hasMentorshipTraining: boolean;
  /** Mentor only. */
  hasMentorshipExperience: boolean;
  /** Required on create and whenever `termsAccepted` comes back false. */
  acceptTerms: boolean;
  researchConsent: boolean;
}

/**
 * The caller's profile. Fields added after the profile was created can be null until the
 * person saves it again.
 */
export interface Profile {
  userId: number;
  type: CustomerType;
  name: string;
  birthDate: string | null;
  gender: string;
  languages: string[];
  profession: string;
  graduationYear: number | null;
  academicBackground: string | null;
  professionalLink: string | null;
  contacts: CustomerContact[];
  address: Address | null;
  hasRuralTraining: boolean;
  motivation: string | null;
  expectations: string;
  goals: string | null;
  contactPreference: ContactPreference | null;
  preferredMentorGender: string | null;
  otherPartyPreferences: string | null;
  acceptedBackgrounds: string | null;
  additionalInfo: string | null;
  interestAreaIds: number[];
  hasMentorshipTraining: boolean;
  hasMentorshipExperience: boolean;
  /** False when the person has not accepted the current terms version. */
  termsAccepted: boolean;
  researchConsent: boolean;
}

export interface InterestArea {
  id: number;
  name: string;
}

export interface InterestGroup {
  id: number;
  name: string;
  areas: InterestArea[];
}
