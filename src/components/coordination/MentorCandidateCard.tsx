import { useState } from 'react';
import { Button, EyeIcon, EyeOffIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useDisplayNames } from '../../hooks/useDisplayNames';
import type { MatchCriterion, MentorCandidate } from '../../types/coordination';

interface MentorCandidateCardProps {
  /** 1 for the best score. */
  rank: number;
  candidate: MentorCandidate;
  menteeAreas: Set<number>;
  menteeLanguages: Set<string>;
  areaNames: Map<number, string>;
}

// Order of the score bars. Same names as MatchScorer in mentor-mentee-core.
const CRITERIA: MatchCriterion[] = ['interestAreas', 'location', 'profession', 'mentorExperience', 'languages', 'gender'];
// Hidden names show as this many dots, whatever the real length, so the length gives nothing away.
const MASK_LENGTH = 8;
const STRONG_SCORE = 70;
const FAIR_SCORE = 40;

function scoreTone(score: number) {
  if (score >= STRONG_SCORE) return 'bg-success-light text-success-dark';
  if (score >= FAIR_SCORE) return 'bg-warning-light text-warning-dark';
  return 'bg-neutral-100 text-neutral-700';
}

/**
 * One mentor who passed the hard filters. The name stays hidden until the coordinator asks for it, so the choice
 * rests on the profile first. What the mentor shares with the mentee is highlighted.
 */
export function MentorCandidateCard({ rank, candidate, menteeAreas, menteeLanguages, areaNames }: MentorCandidateCardProps) {
  const { t } = useI18n();
  const names = useDisplayNames();
  const [nameShown, setNameShown] = useState(false);
  const sharedAreas = candidate.interestAreaIds.filter((id) => menteeAreas.has(id)).length;

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-5">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 text-sm font-medium text-neutral-400">#{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <h3 className="truncate text-lg font-medium">
              {nameShown ? candidate.name : (
                <>
                  <span aria-hidden="true" className="tracking-widest text-neutral-400">{'•'.repeat(MASK_LENGTH)}</span>
                  <span className="sr-only">{t('coordination.matching.nameHidden')}</span>
                </>
              )}
            </h3>
            <button
              type="button"
              onClick={() => setNameShown((shown) => !shown)}
              aria-pressed={nameShown}
              aria-label={t(nameShown ? 'coordination.matching.hideName' : 'coordination.matching.showName')}
              title={t(nameShown ? 'coordination.matching.hideName' : 'coordination.matching.showName')}
              className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            >
              {nameShown ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="text-sm text-neutral-700">
            {candidate.profession}
            {candidate.graduationYear && (
              <span className="text-neutral-500">
                {` · ${t('coordination.unmatchedMentees.graduation', { year: candidate.graduationYear })}`}
              </span>
            )}
          </p>
          <p className="text-sm text-neutral-600">
            {names.place(candidate.city, candidate.region, candidate.country)}
            {candidate.gender && ` · ${t(`profile.genders.${candidate.gender}`, { defaultValue: candidate.gender })}`}
          </p>
        </div>
        <div className={`flex shrink-0 flex-col items-center rounded-lg px-3 py-1.5 ${scoreTone(candidate.score)}`}>
          <span className="text-2xl leading-none font-semibold">{candidate.score}</span>
          <span className="text-[11px]">{t('coordination.matching.score')}</span>
        </div>
      </header>

      {candidate.acceptedBackgrounds && (
        <p className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700">
          <span className="font-medium">{t('coordination.matching.acceptedBackgrounds')}: </span>
          {candidate.acceptedBackgrounds}
        </p>
      )}

      <div className="flex flex-col gap-2 text-sm">
        <p>
          <span className="text-neutral-500">{t('profile.languages')}: </span>
          {candidate.languages.map((code, index) => (
            <span key={code} className={menteeLanguages.has(code) ? 'font-medium text-secondary-700' : 'text-neutral-700'}>
              {index > 0 && ', '}
              {names.language(code)}
            </span>
          ))}
        </p>
        <div>
          <p className="text-neutral-500">
            {t('coordination.matching.sharedAreas', { count: sharedAreas, total: candidate.interestAreaIds.length })}
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {candidate.interestAreaIds.map((id) => (
              <li
                key={id}
                className={`rounded-full px-2.5 py-0.5 text-xs ${
                  menteeAreas.has(id) ? 'bg-secondary-100 text-secondary-700' : 'bg-neutral-100 text-neutral-600'}`}
              >
                {areaNames.get(id) ?? id}
              </li>
            ))}
          </ul>
        </div>
        {(candidate.hasMentorshipTraining || candidate.hasMentorshipExperience) && (
          <ul className="flex flex-wrap gap-1.5">
            {candidate.hasMentorshipTraining && (
              <li className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs text-teal-700">
                {t('coordination.matching.hasTraining')}
              </li>
            )}
            {candidate.hasMentorshipExperience && (
              <li className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs text-teal-700">
                {t('coordination.matching.hasExperience')}
              </li>
            )}
          </ul>
        )}
      </div>

      <details className="group text-sm">
        <summary className="cursor-pointer font-medium text-neutral-600 hover:text-neutral-900">
          {t('coordination.matching.details')}
        </summary>
        <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {CRITERIA.filter((criterion) => candidate.breakdown[criterion] !== undefined).map((criterion) => (
            <div key={criterion}>
              <dt className="flex justify-between text-neutral-600">
                <span>{t(`coordination.matching.criteria.${criterion}`)}</span>
                <span className="tabular-nums">{candidate.breakdown[criterion]}</span>
              </dt>
              <dd className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <span className="block h-full rounded-full bg-teal-400" style={{ width: `${candidate.breakdown[criterion]}%` }} />
              </dd>
            </div>
          ))}
        </dl>
        {candidate.motivation && (
          <p className="mt-3 whitespace-pre-line text-neutral-700">
            <span className="font-medium">{t('coordination.matching.motivation')}: </span>
            {candidate.motivation}
          </p>
        )}
        {candidate.otherPartyPreferences && (
          <p className="mt-2 whitespace-pre-line text-neutral-700">
            <span className="font-medium">{t('coordination.matching.menteePreferences')}: </span>
            {candidate.otherPartyPreferences}
          </p>
        )}
      </details>

      {/* Proposals come in phase 2, step 4 (PLANO.md). The button stays disabled until then. */}
      <Button variant="secondary" size="sm" className="self-start" disabled>
        {t('coordination.matching.propose')}
      </Button>
    </article>
  );
}
