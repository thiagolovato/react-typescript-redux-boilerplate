import { useCallback, useEffect, useState } from 'react';
import { ApiErrorAlert, Button } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useInterestGroups } from '../../hooks/useInterestGroups';
import { useAppSelector } from '../../redux/hooks';
import { mentorshipService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { DeclineForm } from './DeclineForm';
import { MentorshipCard } from './MentorshipCard';
import type { ApiError } from '../../types/api';
import type { Mentorship, MentorshipParty } from '../../types/mentorship';

/**
 * The caller's pairs. A mentee sees the mentors the coordination suggests, chooses one or declines them all, and
 * answers first; a mentor sees a proposal only after the mentee chose them.
 */
export function MyMentorship() {
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const viewer: MentorshipParty = user?.customerType === 'MENTOR' ? 'MENTOR' : 'MENTEE';
  const { areaNames } = useInterestGroups();
  const [mentorships, setMentorships] = useState<Mentorship[] | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [decliningAll, setDecliningAll] = useState(false);
  const [declineState, setDeclineState] = useState<{ sending: boolean; error: ApiError | null }>({ sending: false, error: null });

  /** Loads the list again: an answer may close other options too. */
  const load = useCallback(async () => {
    try {
      setMentorships(await mentorshipService.getMine());
      setError(null);
    } catch (err) {
      setError(toApiError(err));
    }
  }, []);

  useEffect(() => {
    let current = true;
    mentorshipService.getMine()
        .then((found) => current && setMentorships(found))
        .catch((err: unknown) => current && setError(toApiError(err)));
    return () => {
      current = false;
    };
  }, []);

  // Several mentors waiting for the mentee: they choose one, or decline them all at once.
  const options = viewer === 'MENTEE' ? (mentorships ?? []).filter((mentorship) => mentorship.awaiting === 'MENTEE') : [];
  const choosing = options.length > 1;

  /** Declining one option declines the whole proposal. */
  const declineAll = async (reason: string) => {
    setDeclineState({ sending: true, error: null });
    try {
      await mentorshipService.decline(options[0].id, reason);
      setDecliningAll(false);
      setDeclineState({ sending: false, error: null });
      await load();
    } catch (err) {
      setDeclineState({ sending: false, error: toApiError(err) });
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('mentorship.title')}</h1>
        <p className="mt-3 text-lg text-neutral-600">{t(`mentorship.subtitle.${viewer}`)}</p>
      </header>

      <ApiErrorAlert error={error} fallback={t('mentorship.loadError')} />

      {mentorships === null && !error && <p role="status" className="text-neutral-600">{t('common.loading')}</p>}

      {mentorships?.length === 0 && (
        <p className="rounded-xl border border-neutral-200 bg-surface p-6 text-neutral-600">{t(`mentorship.empty.${viewer}`)}</p>
      )}

      {choosing && (
        <p className="rounded-xl border border-secondary-200 bg-secondary-50 p-4 text-secondary-800">
          {t('mentorship.choosing.intro', { count: options.length })}
        </p>
      )}

      {mentorships?.map((mentorship) => (
        <MentorshipCard
          key={mentorship.id}
          mentorship={mentorship}
          viewer={viewer}
          areaNames={areaNames}
          optionNumber={choosing && mentorship.awaiting === 'MENTEE' ? options.indexOf(mentorship) + 1 : undefined}
          onChange={() => void load()}
        />
      ))}

      {choosing && (
        <section className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-surface p-6">
          <h2 className="text-lg font-medium">{t('mentorship.choosing.noneTitle')}</h2>
          <p className="text-sm text-neutral-600">{t('mentorship.choosing.noneDescription')}</p>
          <ApiErrorAlert error={declineState.error} fallback={t('mentorship.actionError')} />
          {decliningAll ? (
            <DeclineForm
              declining={declineState.sending}
              submitLabel={t('mentorship.choosing.confirmDeclineAll')}
              onCancel={() => setDecliningAll(false)}
              onSubmit={(reason) => void declineAll(reason)}
            />
          ) : (
            <Button variant="outline" className="self-start" onClick={() => setDecliningAll(true)}>
              {t('mentorship.choosing.declineAll')}
            </Button>
          )}
        </section>
      )}
    </div>
  );
}
