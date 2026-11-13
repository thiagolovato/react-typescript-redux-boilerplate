import type { ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useDisplayNames } from '../../hooks/useDisplayNames';
import type { Profile } from '../../types/profile';

interface MenteeProfilePanelProps {
  mentee: Profile;
  areaNames: Map<number, string>;
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-line text-neutral-800">{children}</dd>
    </div>
  );
}

/** The mentee's full profile, as the coordinator sees it on the matching page. Sticks beside the candidates. */
export function MenteeProfilePanel({ mentee, areaNames }: MenteeProfilePanelProps) {
  const { t } = useI18n();
  const names = useDisplayNames();
  const genderName = (gender: string) => t(`profile.genders.${gender}`, { defaultValue: gender });

  return (
    <section
      aria-labelledby="mentee-name"
      className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6 lg:sticky lg:top-6"
    >
      <header>
        <p className="text-xs font-medium tracking-wide text-secondary-700 uppercase">{t('roles.MENTEE')}</p>
        <h1 id="mentee-name" className="mt-1 text-2xl font-semibold tracking-tight">{mentee.name}</h1>
        <p className="mt-1 text-neutral-700">
          {mentee.profession}
          {mentee.graduationYear && (
            <span className="text-neutral-500">
              {` · ${t('coordination.unmatchedMentees.graduation', { year: mentee.graduationYear })}`}
            </span>
          )}
        </p>
        <p className="text-sm text-neutral-600">
          {names.place(mentee.address?.city, mentee.address?.region, mentee.address?.country)}
        </p>
      </header>

      <dl className="flex flex-col gap-4">
        {mentee.academicBackground && (
          <Field label={t('coordination.matching.academicBackground')}>{mentee.academicBackground}</Field>
        )}
        <Field label={t('profile.languages')}>{mentee.languages.map(names.language).join(', ')}</Field>
        <Field label={t('coordination.matching.interestAreas')}>
          <span className="flex flex-wrap gap-1.5">
            {mentee.interestAreaIds.map((id) => (
              <span key={id} className="rounded-full bg-secondary-100 px-2.5 py-0.5 text-xs text-secondary-700">
                {areaNames.get(id) ?? id}
              </span>
            ))}
          </span>
        </Field>
        <Field label={t('coordination.matching.preferredMentorGenders')}>
          {mentee.preferredMentorGenders.length > 0
            ? mentee.preferredMentorGenders.map(genderName).join(', ')
            : t('coordination.matching.noPreference')}
        </Field>
        {mentee.otherPartyPreferences && (
          <Field label={t('coordination.matching.mentorPreferences')}>{mentee.otherPartyPreferences}</Field>
        )}
        {mentee.motivation && <Field label={t('coordination.matching.motivation')}>{mentee.motivation}</Field>}
        <Field label={t('profile.expectations.MENTEE')}>{mentee.expectations}</Field>
        {mentee.goals && <Field label={t('coordination.matching.goals')}>{mentee.goals}</Field>}
      </dl>
    </section>
  );
}
