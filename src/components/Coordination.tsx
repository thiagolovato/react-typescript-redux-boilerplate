import { useState } from 'react';
import { generatePath, Link } from 'react-router';
import { ApiErrorAlert, Button, RefreshIcon } from './ui';
import { useI18n } from '../hooks/useI18n';
import { useDisplayNames } from '../hooks/useDisplayNames';
import { useInfiniteList } from '../hooks/useInfiniteList';
import { coordinationService } from '../service/request';
import { APP_ROUTES } from '../constants/routes';
import { CohortMentorships } from './coordination/CohortMentorships';
import { CohortPanel } from './coordination/CohortPanel';

// Module function, so the list keeps the same fetcher across renders.
const fetchUnmatchedMentees = (page: number) => coordinationService.getUnmatchedMentees(page);

// Coordinator home: the cohorts, then the mentees still waiting for a mentor, the proposals waiting for an answer and
// the pairs in progress in the open cohort.
export function Coordination() {
  const { t } = useI18n();
  const names = useDisplayNames();
  // Bumped when a cohort is saved: the pairs below belong to the cohort open today, which may have changed.
  const [cohortVersion, setCohortVersion] = useState(0);
  const {
    items: mentees, totalItems, hasNext, loading, error, loadMore, refresh, sentinelRef,
  } = useInfiniteList(fetchUnmatchedMentees);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('coordination.title')}</h1>
        <p className="mt-3 text-lg text-neutral-600">{t('coordination.subtitle')}</p>
      </header>

      <CohortPanel
        onSaved={() => {
          setCohortVersion((version) => version + 1);
          refresh();
        }}
      />

      <section aria-labelledby="unmatched-mentees" className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="unmatched-mentees" className="text-lg font-medium">
              {t('coordination.unmatchedMentees.title')}
              {totalItems !== null && <span className="ml-2 text-neutral-500">({totalItems})</span>}
            </h2>
            <p className="mt-1 text-sm text-neutral-600">{t('coordination.unmatchedMentees.description')}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshIcon />}
            onClick={refresh}
            disabled={loading}
            className="shrink-0"
          >
            {t('coordination.unmatchedMentees.refresh')}
          </Button>
        </div>

        {totalItems === 0 && (
          <p className="rounded-xl border border-neutral-200 bg-surface p-6 text-sm text-neutral-600">
            {t('coordination.unmatchedMentees.empty')}
          </p>
        )}

        {mentees.length > 0 && (
          <ul className="flex flex-col gap-2" aria-busy={loading}>
            {mentees.map((mentee) => (
              <li key={mentee.userId}>
                <Link
                  to={generatePath(APP_ROUTES.menteeMatching, { userId: String(mentee.userId) })}
                  className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-surface px-4 py-3 transition-colors hover:border-secondary-300 hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-secondary-600 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {mentee.name ?? t('coordination.unmatchedMentees.noName')}
                      {mentee.alsoMentor && (
                        <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-800">
                          {t('coordination.unmatchedMentees.alsoMentor')}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-700">
                      {mentee.profession ?? t('coordination.unmatchedMentees.noProfession')}
                      {mentee.graduationYear && (
                        <span className="text-neutral-500">
                          {` · ${t('coordination.unmatchedMentees.graduation', { year: mentee.graduationYear })}`}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {names.place(mentee.city, mentee.region, mentee.country)}
                      {mentee.languages.length > 0 && ` · ${mentee.languages.map(names.language).join(', ')}`}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-neutral-500">
                    {t('coordination.unmatchedMentees.waitingSince', { date: names.date(mentee.waitingSince) })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <ApiErrorAlert error={error} fallback={t('coordination.unmatchedMentees.loadError')} />
        {error && (
          <Button variant="outline" className="self-start" onClick={() => void loadMore()}>
            {t('coordination.unmatchedMentees.retry')}
          </Button>
        )}

        {loading && <p role="status" className="text-sm text-neutral-600">{t('common.loading')}</p>}

        {hasNext && <div ref={sentinelRef} aria-hidden="true" className="h-px" />}
      </section>

      <CohortMentorships key={cohortVersion} onChange={refresh} />
    </div>
  );
}
