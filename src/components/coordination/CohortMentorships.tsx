import { useCallback, useEffect, useState } from 'react';
import { ApiErrorAlert, Button, RefreshIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { coordinationService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { MentorshipSummary } from './MentorshipSummary';
import type { ApiError } from '../../types/api';
import type { CoordinatorMentorship } from '../../types/mentorship';

interface CohortMentorshipsProps {
  /** Called after a withdrawal: the mentee is back among those without a mentor. */
  onChange: () => void;
}

/** Proposals and pairs of the cohort open today, newest first, declined ones with who declined and why. */
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

  return (
    <section aria-labelledby="cohort-mentorships" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="cohort-mentorships" className="text-lg font-medium">
            {t('coordination.mentorships.title')}
            {mentorships && <span className="ml-2 text-neutral-500">({mentorships.length})</span>}
          </h2>
          <p className="mt-1 text-sm text-neutral-600">{t('coordination.mentorships.description')}</p>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<RefreshIcon />} onClick={() => void load()} className="shrink-0">
          {t('coordination.unmatchedMentees.refresh')}
        </Button>
      </div>

      <ApiErrorAlert error={error} fallback={t('coordination.mentorships.loadError')} />

      {mentorships === null && !error && <p role="status" className="text-sm text-neutral-600">{t('common.loading')}</p>}

      {mentorships?.length === 0 && (
        <p className="rounded-xl border border-neutral-200 bg-surface p-6 text-sm text-neutral-600">
          {t('coordination.mentorships.empty')}
        </p>
      )}

      {mentorships && mentorships.length > 0 && (
        <ul className="flex flex-col gap-2">
          {mentorships.map((mentorship) => (
            <li key={mentorship.id}>
              <MentorshipSummary
                mentorship={mentorship}
                withdrawing={withdrawing === mentorship.id}
                onWithdraw={() => void withdraw(mentorship.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
