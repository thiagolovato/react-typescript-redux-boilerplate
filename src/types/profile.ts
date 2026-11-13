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
  /** Mentee only: genders of mentor the mentee accepts. Empty means no preference. */
  preferredMentorGenders: string[];
  otherPartyPreferences: string;
  /** Mentor only. */
  acceptedBackgrounds: string;
  additionalInfo: string;
  interestAreaIds: number[];
  /** Mentor only. */
  hasMentorshipTraining: boolean;
  /** Mentor only. */
  hasMentorshipExperience: boolean;
  /** Id of the terms document accepted with this save. Required on create and whenever `termsAccepted` is false. */
  acceptedTermsDocumentId: number | null;
  researchConsent: boolean;
  /** Id of the research consent document the person answered. */
  researchDocumentId: number;
  /** Core language code of the consent texts the person read, such as `pt_BR`. */
  consentLanguage: string;
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
  preferredMentorGenders: string[];
  otherPartyPreferences: string | null;
  acceptedBackgrounds: string | null;
  additionalInfo: string | null;
  interestAreaIds: number[];
  hasMentorshipTraining: boolean;
  hasMentorshipExperience: boolean;
  /** False when the person has not accepted the terms document in force. */
  termsAccepted: boolean;
  researchConsent: boolean;
}

export interface InterestArea {
  id: number;
  name: string;
  /** False once the area left the catalog: not offered for new picks, but profiles that have it keep it. */
  offered: boolean;
}

export interface InterestGroup {
  id: number;
  name: string;
  areas: InterestArea[];
}
