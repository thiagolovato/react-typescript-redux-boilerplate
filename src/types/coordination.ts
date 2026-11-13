import type { Profile } from './profile';

/** A mentee still waiting for a mentor. The coordinator sees who the person is (REGRAS_DE_NEGOCIO.md 7.7). */
export interface UnmatchedMentee {
  userId: number;
  name: string | null;
  profession: string | null;
  graduationYear: number | null;
  /** ISO 3166-1 alpha-2 code. */
  country: string | null;
  region: string | null;
  city: string | null;
  /** Core language codes (`pt_BR`). */
  languages: string[];
  /** ISO instant the profile was created. */
  waitingSince: string;
}

/** Name of each matching criterion, as MatchScorer in mentor-mentee-core names it. */
export type MatchCriterion = 'interestAreas' | 'languages' | 'location' | 'profession' | 'gender' | 'mentorExperience';

/** A mentor who passed the hard filters for one mentee. The coordinator may see the name; the page hides it at first. */
export interface MentorCandidate {
  userId: number;
  name: string | null;
  gender: string | null;
  profession: string | null;
  graduationYear: number | null;
  academicBackground: string | null;
  /** The backgrounds the mentor feels comfortable mentoring. */
  acceptedBackgrounds: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  languages: string[];
  interestAreaIds: number[];
  hasMentorshipTraining: boolean;
  hasMentorshipExperience: boolean;
  motivation: string | null;
  otherPartyPreferences: string | null;
  /** 0..100. */
  score: number;
  /** Each criterion's own 0..100 score. */
  breakdown: Partial<Record<MatchCriterion, number>>;
}

/** The matching page for one mentee. `candidates` is empty while the mentee has not accepted the terms in force. */
export interface MenteeCandidates {
  mentee: Profile;
  candidates: MentorCandidate[];
}
