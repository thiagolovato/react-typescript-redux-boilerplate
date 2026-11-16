import { useEffect, useState, type FormEvent } from 'react';
import { ApiErrorAlert, Button, Input, PlusIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useDisplayNames } from '../../hooks/useDisplayNames';
import { coordinationService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { MAX_COHORT_NAME, MAX_COHORT_PAIRS } from '../../constants/mentorship';
import type { ApiError } from '../../types/api';
import type { Cohort, CohortRequest } from '../../types/coordination';

/** The form keeps what the inputs hold: a cleared number field is '' until the browser's own validation stops the submit. */
type CohortForm = Omit<CohortRequest, 'maxPairs' | 'maxMenteesPerMentor'> & { maxPairs: string; maxMenteesPerMentor: string };

const EMPTY_FORM: CohortForm = { name: '', startsOn: '', endsOn: '', maxPairs: String(MAX_COHORT_PAIRS), maxMenteesPerMentor: '1' };

const toForm = ({ name, startsOn, endsOn, maxPairs, maxMenteesPerMentor }: Cohort): CohortForm => (
  { name, startsOn, endsOn, maxPairs: String(maxPairs), maxMenteesPerMentor: String(maxMenteesPerMentor) }
);

const toRequest = ({ maxPairs, maxMenteesPerMentor, ...rest }: CohortForm): CohortRequest => (
  { ...rest, maxPairs: Number(maxPairs), maxMenteesPerMentor: Number(maxMenteesPerMentor) }
);

interface CohortPanelProps {
  /** Called after a save: the cohort open today may have changed, and the lists below follow it. */
  onSaved: () => void;
}

/** Shows an ISO date (no time) in the reader's language without shifting it by the time zone. */
const asLocalDate = (isoDate: string) => `${isoDate}T00:00:00`;

/**
 * The cohorts, the open one first, with a form to create or edit one. Proposals need a cohort open today
 * (REGRAS_DE_NEGOCIO.md 6), so this sits at the top of the coordination page.
 */
export function CohortPanel({ onSaved }: CohortPanelProps) {
  const { t } = useI18n();
  const names = useDisplayNames();
  const [cohorts, setCohorts] = useState<Cohort[] | null>(null);
  const [loadError, setLoadError] = useState<ApiError | null>(null);
  // null: form closed; 'new': creating; a number: editing that cohort.
  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [form, setForm] = useState<CohortForm>(EMPTY_FORM);
  const [saveError, setSaveError] = useState<ApiError | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let current = true;
    coordinationService.getCohorts()
        .then((found) => current && setCohorts(found))
        .catch((err: unknown) => current && setLoadError(toApiError(err)));
    return () => {
      current = false;
    };
  }, []);

  const sorted = [...(cohorts ?? [])].sort((a, b) => Number(b.open) - Number(a.open) || b.startsOn.localeCompare(a.startsOn));
  const openCohort = sorted.find((cohort) => cohort.open);

  const startEdit = (cohort: Cohort | null) => {
    setSaveError(null);
    setEditing(cohort ? cohort.id : 'new');
    setForm(cohort ? toForm(cohort) : EMPTY_FORM);
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const saved = typeof editing === 'number'
        ? await coordinationService.updateCohort(editing, toRequest(form))
        : await coordinationService.createCohort(toRequest(form));
      setCohorts((previous) => [...(previous ?? []).filter((cohort) => cohort.id !== saved.id), saved]);
      setEditing(null);
      onSaved();
    } catch (err) {
      setSaveError(toApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const field = <K extends keyof CohortForm>(key: K, value: CohortForm[K]) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <section aria-labelledby="cohorts" className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="cohorts" className="text-lg font-medium">{t('coordination.cohorts.title')}</h2>
          <p className="mt-1 text-sm text-neutral-600">
            {openCohort
              ? t('coordination.cohorts.openNow', { name: openCohort.name })
              : t('coordination.cohorts.noneOpen')}
          </p>
        </div>
        {editing === null && (
          <Button variant="outline" size="sm" leftIcon={<PlusIcon />} onClick={() => startEdit(null)} className="shrink-0">
            {t('coordination.cohorts.create')}
          </Button>
        )}
      </div>

      <ApiErrorAlert error={loadError} fallback={t('coordination.cohorts.loadError')} />
      {cohorts === null && !loadError && <p role="status" className="text-sm text-neutral-600">{t('common.loading')}</p>}

      {editing !== null && (
        <form onSubmit={(event) => void save(event)} className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-surface p-4">
          <h3 className="font-medium">{editing === 'new' ? t('coordination.cohorts.create') : t('coordination.cohorts.edit')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('coordination.cohorts.name')}
              value={form.name}
              maxLength={MAX_COHORT_NAME}
              isRequired
              onChange={(event) => field('name', event.target.value)}
              fullWidth
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label={t('coordination.cohorts.startsOn')}
                value={form.startsOn}
                isRequired
                onChange={(event) => field('startsOn', event.target.value)}
                fullWidth
              />
              <Input
                type="date"
                label={t('coordination.cohorts.endsOn')}
                value={form.endsOn}
                min={form.startsOn || undefined}
                isRequired
                onChange={(event) => field('endsOn', event.target.value)}
                fullWidth
              />
            </div>
            <Input
              type="number"
              label={t('coordination.cohorts.maxPairs')}
              helperText={t('coordination.cohorts.maxPairsHelp', { max: MAX_COHORT_PAIRS })}
              value={form.maxPairs}
              min={1}
              max={MAX_COHORT_PAIRS}
              isRequired
              onChange={(event) => field('maxPairs', event.target.value)}
              fullWidth
            />
            <Input
              type="number"
              label={t('coordination.cohorts.maxMenteesPerMentor')}
              value={form.maxMenteesPerMentor}
              min={1}
              max={MAX_COHORT_PAIRS}
              isRequired
              onChange={(event) => field('maxMenteesPerMentor', event.target.value)}
              fullWidth
            />
          </div>
          <ApiErrorAlert error={saveError} fallback={t('coordination.cohorts.saveError')} />
          <div className="flex gap-2">
            <Button type="submit" isLoading={saving}>{t('coordination.cohorts.save')}</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)} disabled={saving}>
              {t('coordination.cohorts.cancel')}
            </Button>
          </div>
        </form>
      )}

      {sorted.length > 0 && (
        <ul className="flex flex-col gap-2">
          {sorted.map((cohort) => (
            <li
              key={cohort.id}
              className="flex flex-col gap-2 rounded-lg border border-neutral-200 bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {cohort.name}
                  {cohort.open && (
                    <span className="rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success-dark">
                      {t('coordination.cohorts.open')}
                    </span>
                  )}
                </p>
                <p className="text-sm text-neutral-600">
                  {t('coordination.cohorts.period', {
                    start: names.date(asLocalDate(cohort.startsOn)),
                    end: names.date(asLocalDate(cohort.endsOn)),
                  })}
                  {' · '}
                  {t('coordination.cohorts.limits', { pairs: cohort.maxPairs, perMentor: cohort.maxMenteesPerMentor })}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => startEdit(cohort)} disabled={editing !== null} className="shrink-0">
                {t('coordination.cohorts.edit')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
