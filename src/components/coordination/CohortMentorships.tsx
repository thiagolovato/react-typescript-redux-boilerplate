import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiErrorAlert, Button, RefreshIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { coordinationService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { MentorshipSummary } from './MentorshipSummary';
import type { ApiError } from '../../types/api';
import type { CoordinatorMentorship, MentorshipStatus } from '../../types/mentorship';

interface CohortMentorshipsProps {
  /** Called after a withdrawal: the mentee is back among those without a mentor. */
  onChange: () => void;
}

/** Pairs past the proposal, still running. ACTIVE comes in phase 3. */
const IN_PROGRESS: readonly MentorshipStatus[] = ['ACCEPTED', 'ACTIVE'];

/**
 * Rows as the coordinator reads them: the options of a proposal the mentee is still choosing from together (a mentee
 * has one such proposal at most), every other row alone. Keeps the server's order, newest first.
 */
function groupOptions(mentorships: CoordinatorMentorship[]): CoordinatorMentorship[][] {
  const choosing = new Map<number, CoordinatorMentorship[]>();
  const groups: CoordinatorMentorship[][] = [];
  for (const mentorship of mentorships) {
    if (mentorship.status !== 'PROPOSED' || mentorship.awaiting !== 'MENTEE') {
      groups.push([mentorship]);
      continue;
    }
    const options = choosing.get(mentorship.mentee.userId);
    if (options) {
      options.push(mentorship);
    } else {
      const group = [mentorship];
      choosing.set(mentorship.mentee.userId, group);
      groups.push(group);
    }
  }
  return groups;
}

interface MentorshipListProps {
  id: string;
  title: string;
  description: string;
  empty: string;
  groups: CoordinatorMentorship[][] | null;
  withdrawing: number | null;
  onWithdraw: (id: number) => void;
  action?: ReactNode;
}

function MentorshipList({ id, title, description, empty, groups, withdrawing, onWithdraw, action }: MentorshipListProps) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id={id} className="text-lg font-medium">
            {title}
            {groups && <span className="ml-2 text-neutral-500">({groups.length})</span>}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{description}</p>
        </div>
        {action}
      </div>
      {groups?.length === 0 && (
        <p className="rounded-xl border border-neutral-200 bg-surface p-6 text-sm text-neutral-600">{empty}</p>
      )}
      {groups && groups.length > 0 && (
        <ul className="flex flex-col gap-2">
          {groups.map((group) => (
            <li key={group[0].id}>
              <MentorshipSummary
                mentorships={group}
                withdrawing={withdrawing === group[0].id}
                onWithdraw={() => onWithdraw(group[0].id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/**
 * Proposals and pairs of the cohort open today, in two lists: proposals waiting for an answer, then pairs in progress.
 * Declined and withdrawn proposals, with who declined and why, fold away below.
 */
export function CohortMentorships({ onChange }: CohortMentorshipsProps) {
  const { t } = useI18n();
  const [mentorships, setMentorships] = useState<CoordinatorMentorship[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setMentorships(await coordinationService.getMentorships());
      setError(null);
    } catch (err) {
      setError(toApiError(err));
    }
  }, []);

  useEffect(() => {
    let current = true;
    coordinationService.getMentorships()
        .then((found) => current && setMentorships(found))
        .catch((err: unknown) => current && setError(toApiError(err)));
    return () => {
      current = false;
    };
  }, []);

  const lists = useMemo(() => {
    if (!mentorships) return null;
    const by = (keep: (mentorship: CoordinatorMentorship) => boolean) => groupOptions(mentorships.filter(keep));
    return {
      pending: by((mentorship) => mentorship.status === 'PROPOSED'),
      inProgress: by((mentorship) => IN_PROGRESS.includes(mentorship.status)),
      // The options a mentee did not choose close as SYSTEM: noise for the coordinator.
      declined: by((mentorship) => mentorship.status === 'DECLINED' && mentorship.declinedBy !== 'SYSTEM'),
    };
  }, [mentorships]);

  const withdraw = async (id: number) => {
    setWithdrawing(id);
    try {
      await coordinationService.withdraw(id);
      onChange();
    } catch (err) {
      setError(toApiError(err));
    }
    await load();
    setWithdrawing(null);
  };

  const onWithdraw = (id: number) => void withdraw(id);

  return (
    <>
      <ApiErrorAlert error={error} fallback={t('coordination.mentorships.loadError')} />
      {mentorships === null && !error && <p role="status" className="text-sm text-neutral-600">{t('common.loading')}</p>}

      <MentorshipList
        id="pending-proposals"
        title={t('coordination.mentorships.pending.title')}
        description={t('coordination.mentorships.pending.description')}
        empty={t('coordination.mentorships.pending.empty')}
        groups={lists?.pending ?? null}
        withdrawing={withdrawing}
        onWithdraw={onWithdraw}
        action={(
          <Button variant="ghost" size="sm" leftIcon={<RefreshIcon />} onClick={() => void load()} className="shrink-0">
            {t('coordination.unmatchedMentees.refresh')}
          </Button>
        )}
      />

      <MentorshipList
        id="pairs-in-progress"
        title={t('coordination.mentorships.inProgress.title')}
        description={t('coordination.mentorships.inProgress.description')}
        empty={t('coordination.mentorships.inProgress.empty')}
        groups={lists?.inProgress ?? null}
        withdrawing={withdrawing}
        onWithdraw={onWithdraw}
      />

      {lists && lists.declined.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm font-medium text-neutral-700">
            {t('coordination.mentorships.declined', { count: lists.declined.length })}
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {lists.declined.map((group) => (
              <li key={group[0].id}>
                <MentorshipSummary mentorships={group} />
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  );
}
