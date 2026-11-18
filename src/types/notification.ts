// Mirrors NotificationResponse in mentor-mentee-core. The text comes from the locale files, by type.

/** REGRAS_DE_NEGOCIO.md 13. */
export type NotificationType =
  | 'NEW_MENTOR'
  | 'NEW_MENTEE'
  | 'PROPOSAL_RECEIVED'
  | 'MENTEE_CHOSE_MENTOR'
  | 'PROPOSAL_DECLINED_BY_MENTEE'
  | 'PROPOSAL_DECLINED_BY_MENTOR'
  | 'MENTOR_DECLINED'
  | 'PROPOSAL_WITHDRAWN'
  | 'PAIR_ACCEPTED'
  | 'TERMINATION_REQUESTED'
  | 'TERMINATION_WITHDRAWN'
  | 'PAIR_TERMINATED'
  | 'PAIR_COMPLETED';

export interface AppNotification {
  id: number;
  type: NotificationType;
  /** The pair it is about, if any. */
  mentorshipId: number | null;
  /** The person a profile notice (NEW_MENTOR, NEW_MENTEE) is about; null for other notices and older ones. */
  subjectUserId: number | null;
  /** ISO instant. */
  createdAt: string;
  read: boolean;
}

export interface UnreadCount {
  count: number;
}
