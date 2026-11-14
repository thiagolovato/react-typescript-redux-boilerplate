import { useEffect, useState } from 'react';
import { ApiErrorAlert } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useInterestGroups } from '../../hooks/useInterestGroups';
import { useAppSelector } from '../../redux/hooks';
import { mentorshipService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { MentorshipCard } from './MentorshipCard';
import type { ApiError } from '../../types/api';
import type { Mentorship, MentorshipParty } from '../../types/mentorship';

/**
 * The caller's pairs. A mentee sees the mentor the coordination suggests and answers first; a mentor sees a proposal
 * only after the mentee accepted it.
 */
export function MyMentorship() {
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const viewer: MentorshipParty = user?.customerType === 'MENTOR' ? 'MENTOR' : 'MENTEE';
  const { areaNames } = useInterestGroups();
  const [mentorships, setMentorships] = useState<Mentorship[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    let current = true;
    mentorshipService.getMine()
        .then((found) => current && setMentorships(found))
        .catch((err: unknown) => current && setError(toApiError(err)));
    return () => {
      current = false;
    };
  }, []);

  // A declined pair is no longer the party's to see.
  const replace = (updated: Mentorship) => setMentorships((list) => (list ?? [])
      .flatMap((mentorship) => mentorship.id !== updated.id ? [mentorship] : updated.status === 'DECLINED' ? [] : [updated]));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('mentorship.title')}</h1>
        <p className="mt-3 text-lg text-neutral-600">{t(`mentorship.subtitle.${viewer}`)}</p>
      </header>

      <ApiErrorAlert error={error} fallback={t('mentorship.loadError')} />

      {mentorships === null && !error && <p role="status" className="text-neutral-600">{t('common.loading')}</p>}

      {mentorships?.length === 0 && (
        <p className="rounded-xl border border-neutral-200 bg-white p-6 text-neutral-600">{t(`mentorship.empty.${viewer}`)}</p>
      )}

      {mentorships?.map((mentorship) => (
        <MentorshipCard
          key={mentorship.id}
          mentorship={mentorship}
          viewer={viewer}
          areaNames={areaNames}
          onChange={replace}
        />
      ))}
    </div>
  );
}
