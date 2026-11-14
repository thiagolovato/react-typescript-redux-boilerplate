import type { MentorshipParty, MentorshipStatus } from '../../types/mentorship';

export type MentorshipStage = 'awaitingMentee' | 'awaitingMentor' | 'accepted' | 'declined' | 'other';

/** Where a pair stands, for labels: the mentee answers first, then the mentor. */
export function mentorshipStage({ status, awaiting }: { status: MentorshipStatus; awaiting: MentorshipParty | null }): MentorshipStage {
  if (status === 'PROPOSED') return awaiting === 'MENTOR' ? 'awaitingMentor' : 'awaitingMentee';
  if (status === 'ACCEPTED') return 'accepted';
  if (status === 'DECLINED') return 'declined';
  return 'other';
}
