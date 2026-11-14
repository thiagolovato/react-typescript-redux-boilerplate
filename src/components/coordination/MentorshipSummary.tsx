import { Button } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useDisplayNames } from '../../hooks/useDisplayNames';
import { mentorshipStage } from '../mentorship/mentorshipStage';
import type { CoordinatorMentorship } from '../../types/mentorship';

interface MentorshipSummaryProps {
  /** One pair, or the options of one proposal while the mentee is choosing (same mentee, same stage). */
  mentorships: CoordinatorMentorship[];
  /** Shown only while the pair is proposed. Withdraws every option. */
  onWithdraw: () => void;
  withdrawing: boolean;
}

const STAGE_TONES = {
  awaitingMentee: 'bg-secondary-100 text-secondary-700',
  awaitingMentor: 'bg-primary-100 text-primary-700',
  accepted: 'bg-success-light text-success-dark',
  declined: 'bg-neutral-100 text-neutral-600',
  other: 'bg-teal-100 text-teal-700',
} as const;

/** One pair, or one proposal's options, as the coordinator follows it: who, where it stands, who declined and why. */
export function MentorshipSummary({ mentorships, onWithdraw, withdrawing }: MentorshipSummaryProps) {
  const { t } = useI18n();
  const names = useDisplayNames();
  const [mentorship] = mentorships;
  const stage = mentorshipStage(mentorship);
  const noName = t('coordination.unmatchedMentees.noName');
  const label = stage === 'awaitingMentee' && mentorships.length > 1
    ? t('mentorship.coordinatorStage.choosing', { count: mentorships.length })
    : t(`mentorship.coordinatorStage.${stage}`, { by: mentorship.declinedBy && t(`mentorship.declinedBy.${mentorship.declinedBy}`) });

  return (
    <article className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-surface px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">
          <span className="text-secondary-700">{mentorship.mentee.name ?? noName}</span>
          <span className="text-neutral-400"> · </span>
          {mentorships.map((option, index) => (
            <span key={option.id}>
              {index > 0 && <span className="text-neutral-400"> / </span>}
              <span className="text-primary-700">{option.mentor.name ?? noName}</span>
            </span>
          ))}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-600">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_TONES[stage]}`}>{label}</span>
          {t('mentorship.proposedOn', { date: names.date(mentorship.proposedAt) })}
        </p>
        {mentorship.declineReason && (
          <p className="mt-2 text-sm whitespace-pre-line text-neutral-700">
            <span className="font-medium">{t('mentorship.declineReason')}: </span>
            {mentorship.declineReason}
          </p>
        )}
      </div>
      {mentorship.status === 'PROPOSED' && (
        <Button variant="outline" size="sm" className="shrink-0" onClick={onWithdraw} isLoading={withdrawing}>
          {t('mentorship.withdraw')}
        </Button>
      )}
    </article>
  );
}
