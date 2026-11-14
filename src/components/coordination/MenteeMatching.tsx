import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ApiErrorAlert, ChevronLeftIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useInterestGroups } from '../../hooks/useInterestGroups';
import { coordinationService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { APP_ROUTES } from '../../constants/routes';
import { MenteeProfilePanel } from './MenteeProfilePanel';
import { MentorCandidateCard } from './MentorCandidateCard';
import { MentorshipSummary } from './MentorshipSummary';
import type { ApiError } from '../../types/api';
import type { MenteeCandidates } from '../../types/coordination';

interface Loaded {
  /** Mentee the answer is for; null before the first answer. */
  userId: number | null;
  data: MenteeCandidates | null;
  error: ApiError | null;
}

/** Fetches the mentee and the candidates, failure included. */
async function fetchMatching(userId: number): Promise<Loaded> {
  try {
    return { userId, data: await coordinationService.getMenteeCandidates(userId), error: null };
  } catch (err) {
    return { userId, data: null, error: toApiError(err) };
  }
}

/** Matching page for one mentee: their profile and the mentors who pass the hard filters, best score first. */
export function MenteeMatching() {
  const { t } = useI18n();
  const userId = Number(useParams().userId);
  const [loaded, setLoaded] = useState<Loaded>({ userId: null, data: null, error: null });
  const { areaNames } = useInterestGroups();
  // Mentor being proposed, or 'withdraw' while the open pair is withdrawn.
  const [pending, setPending] = useState<number | 'withdraw' | null>(null);
  const [actionError, setActionError] = useState<ApiError | null>(null);

  /** Runs a proposal or a withdrawal, then loads the page again: the mentee's open pair replaces the candidates. */
  const act = async (target: number | 'withdraw', action: () => Promise<unknown>) => {
    setPending(target);
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(toApiError(err));
    }
    setLoaded(await fetchMatching(userId));
    setPending(null);
  };

  useEffect(() => {
    let current = true;
    fetchMatching(userId).then((result) => {
      if (current) setLoaded(result);
    });
    return () => {
      current = false;
    };
  }, [userId]);

  const { data, error } = loaded;
  const menteeAreas = useMemo(() => new Set(data?.mentee.interestAreaIds), [data]);
  const menteeLanguages = useMemo(() => new Set(data?.mentee.languages), [data]);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <Link
        to={APP_ROUTES.coordination}
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-neutral-600 hover:text-neutral-900"
      >
        <ChevronLeftIcon />
        {t('coordination.matching.back')}
      </Link>

      {loaded.userId !== userId && <p role="status" className="text-neutral-600">{t('common.loading')}</p>}

      <ApiErrorAlert error={error} fallback={t('coordination.matching.loadError')} />

      {data && (
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <MenteeProfilePanel mentee={data.mentee} areaNames={areaNames} />

          <section aria-labelledby="candidates" className="flex flex-col gap-4">
            <div>
              <h2 id="candidates" className="text-lg font-medium">
                {t('coordination.matching.candidates')}
                <span className="ml-2 text-neutral-500">({data.candidates.length})</span>
              </h2>
              <p className="mt-1 text-sm text-neutral-600">{t('coordination.matching.filters')}</p>
            </div>

            <ApiErrorAlert error={actionError} fallback={t('coordination.matching.actionError')} />

            {data.mentorship && (
              <div className="flex flex-col gap-2">
                <p className="text-sm text-neutral-600">{t('coordination.matching.openPair')}</p>
                <MentorshipSummary
                  mentorship={data.mentorship}
                  withdrawing={pending === 'withdraw'}
                  onWithdraw={() => {
                    const id = data.mentorship?.id;
                    if (id !== undefined) void act('withdraw', () => coordinationService.withdraw(id));
                  }}
                />
              </div>
            )}

            {!data.mentee.termsAccepted && (
              <p className="rounded-xl border border-warning-main/40 bg-warning-light p-4 text-sm text-warning-dark">
                {t('coordination.matching.termsPending')}
              </p>
            )}

            {data.mentee.termsAccepted && !data.mentorship && data.candidates.length === 0 && (
              <p className="rounded-xl border border-neutral-200 bg-surface p-6 text-sm text-neutral-600">
                {t('coordination.matching.noCandidates')}
              </p>
            )}

            <ol className="flex flex-col gap-3">
              {data.candidates.map((candidate, index) => (
                <li key={candidate.userId}>
                  <MentorCandidateCard
                    rank={index + 1}
                    candidate={candidate}
                    menteeAreas={menteeAreas}
                    menteeLanguages={menteeLanguages}
                    areaNames={areaNames}
                    proposing={pending === candidate.userId}
                    disabled={pending !== null}
                    onPropose={() => void act(candidate.userId,
                        () => coordinationService.propose(userId, candidate.userId))}
                  />
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </div>
  );
}
