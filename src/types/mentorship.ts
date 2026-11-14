import type { CustomerContact, CustomerType } from './profile';

// Mirrors the mentorship records of mentor-mentee-core.

/** REGRAS_DE_NEGOCIO.md 7.2. ACTIVE, COMPLETED and TERMINATED come in phase 3. */
export type MentorshipStatus = 'PROPOSED' | 'ACCEPTED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'DECLINED';

/** Who answers or declines. The mentee answers first, then the mentor; the coordinator withdraws. */
export type MentorshipParty = 'MENTEE' | 'MENTOR' | 'COORDINATOR';

/** What a party sees of the other while the pair is proposed (REGRAS_DE_NEGOCIO.md 7.5): no name, city or contacts. */
export interface AnonymousProfile {
  role: CustomerType;
  /** ISO 3166-1 alpha-2 code. */
  country: string | null;
  region: string | null;
  profession: string | null;
  graduationYear: number | null;
  academicBackground: string | null;
  /** Core language codes (`pt_BR`). */
  languages: string[];
  interestAreaIds: number[];
  motivation: string | null;
  goals: string | null;
  hasMentorshipTraining: boolean;
  hasMentorshipExperience: boolean;
}

/** Who the other party is. Sent only once both accepted (REGRAS_DE_NEGOCIO.md 7.8). */
export interface Introduction {
  name: string | null;
  email: string | null;
  city: string | null;
  professionalLink: string | null;
  contacts: CustomerContact[];
}

/** A pair as one of its parties sees it (`GET /mentorships/mine`). */
export interface Mentorship {
  id: number;
  status: MentorshipStatus;
  /** Who must answer now; null once accepted. */
  awaiting: MentorshipParty | null;
  partner: AnonymousProfile;
  introduction: Introduction | null;
}

export interface MentorshipPerson {
  userId: number;
  name: string | null;
}

/** A pair as the coordinator sees it. */
export interface CoordinatorMentorship {
  id: number;
  status: MentorshipStatus;
  /** Who must answer now; null once accepted or declined. */
  awaiting: MentorshipParty | null;
  mentee: MentorshipPerson;
  mentor: MentorshipPerson;
  /** ISO instants. */
  proposedAt: string;
  menteeAcceptedAt: string | null;
  mentorAcceptedAt: string | null;
  declinedAt: string | null;
  declinedBy: MentorshipParty | null;
  /** Only the coordinator sees it. */
  declineReason: string | null;
}
