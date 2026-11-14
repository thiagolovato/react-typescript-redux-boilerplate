import { useState, type ReactNode } from 'react';
import { ApiErrorAlert, Button, TextArea } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useDisplayNames } from '../../hooks/useDisplayNames';
import { mentorshipService } from '../../service/request';
import { toApiError } from '../../service/request/apiError';
import { MAX_DECLINE_REASON } from '../../constants/mentorship';
import type { ApiError } from '../../types/api';
import type { Mentorship, MentorshipParty } from '../../types/mentorship';

interface MentorshipCardProps {
  mentorship: Mentorship;
  /** The viewer's side of the pair. */
  viewer: MentorshipParty;
  areaNames: Map<number, string>;
  /** The server's answer after an accept or decline. */
  onChange: (updated: Mentorship) => void;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{label}</dt>
      <dd className="mt-1 text-sm whitespace-pre-line text-neutral-800">{children}</dd>
    </div>
  );
}

/**
 * One pair as a party sees it. While proposed, the other party is anonymous (REGRAS_DE_NEGOCIO.md 7.5) and the
 * party whose turn it is accepts or declines; once both accepted, the name and contacts show (7.8).
 */
export function MentorshipCard({ mentorship, viewer, areaNames, onChange }: MentorshipCardProps) {
  const { t } = useI18n();
  const names = useDisplayNames();
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const { partner, introduction } = mentorship;
  const myTurn = mentorship.awaiting === viewer;
  const state = mentorship.status === 'ACCEPTED' ? 'accepted' : myTurn ? 'yourTurn' : 'waiting';

  const run = async (kind: 'accept' | 'decline', action: () => Promise<Mentorship>) => {
    setPending(kind);
    setError(null);
    try {
      onChange(await action());
    } catch (err) {
      setError(toApiError(err));
      setPending(null);
    }
  };

  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-white p-6">
      <header>
        <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
          {t(`mentorship.party.${viewer}.${state}.eyebrow`)}
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight">
          {introduction?.name ?? t(`mentorship.anonymous.${partner.role}`)}
        </h2>
        <p className="mt-2 text-sm text-neutral-600">{t(`mentorship.party.${viewer}.${state}.description`)}</p>
      </header>

      {introduction && (
        <dl className="grid gap-4 rounded-xl bg-success-light p-4 sm:grid-cols-2">
          {introduction.email && (
            <Field label={t('mentorship.introduction.email')}>
              <a href={`mailto:${introduction.email}`} className="text-primary-700 underline">{introduction.email}</a>
            </Field>
          )}
          {introduction.contacts.map((contact) => (
            <Field key={`${contact.contactType}-${contact.contactValue}`} label={t(`profile.contactTypes.${contact.contactType}`)}>
              {contact.contactValue}
            </Field>
          ))}
          {introduction.professionalLink && (
            <Field label={t('mentorship.introduction.professionalLink')}>
              <a href={introduction.professionalLink} target="_blank" rel="noreferrer" className="text-primary-700 underline">
                {introduction.professionalLink}
              </a>
            </Field>
          )}
        </dl>
      )}

      <dl className="grid gap-4 sm:grid-cols-2">
        <Field label={t('mentorship.profile.place')}>
          {names.place(introduction?.city, partner.region, partner.country) || '—'}
        </Field>
        <Field label={t('mentorship.profile.profession')}>
          {partner.profession ?? '—'}
          {partner.graduationYear && (
            <span className="text-neutral-500">
              {` · ${t('coordination.unmatchedMentees.graduation', { year: partner.graduationYear })}`}
            </span>
          )}
        </Field>
        {partner.academicBackground && (
          <Field label={t('coordination.matching.academicBackground')}>{partner.academicBackground}</Field>
        )}
        <Field label={t('profile.languages')}>{partner.languages.map(names.language).join(', ')}</Field>
        <div className="sm:col-span-2">
          <Field label={t('coordination.matching.interestAreas')}>
            <span className="flex flex-wrap gap-1.5">
              {partner.interestAreaIds.map((id) => (
                <span key={id} className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700">
                  {areaNames.get(id) ?? id}
                </span>
              ))}
            </span>
          </Field>
        </div>
        {(partner.hasMentorshipTraining || partner.hasMentorshipExperience) && (
          <div className="flex flex-wrap gap-1.5 sm:col-span-2">
            {partner.hasMentorshipTraining && (
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs text-teal-700">
                {t('coordination.matching.hasTraining')}
              </span>
            )}
            {partner.hasMentorshipExperience && (
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs text-teal-700">
                {t('coordination.matching.hasExperience')}
              </span>
            )}
          </div>
        )}
        {partner.motivation && (
          <div className="sm:col-span-2">
            <Field label={t('coordination.matching.motivation')}>{partner.motivation}</Field>
          </div>
        )}
        {partner.goals && (
          <div className="sm:col-span-2">
            <Field label={t('coordination.matching.goals')}>{partner.goals}</Field>
          </div>
        )}
      </dl>

      <ApiErrorAlert error={error} fallback={t('mentorship.actionError')} />

      {myTurn && !declining && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant={viewer === 'MENTOR' ? 'primary' : 'secondary'}
            isLoading={pending === 'accept'}
            disabled={pending !== null}
            onClick={() => void run('accept', () => mentorshipService.accept(mentorship.id))}
          >
            {t('mentorship.accept')}
          </Button>
          <Button variant="outline" disabled={pending !== null} onClick={() => setDeclining(true)}>
            {t('mentorship.decline')}
          </Button>
        </div>
      )}

      {myTurn && declining && (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void run('decline', () => mentorshipService.decline(mentorship.id, reason.trim()));
          }}
        >
          <TextArea
            label={t('mentorship.declineReasonLabel')}
            helperText={t('mentorship.declineReasonHelp')}
            value={reason}
            maxLength={MAX_DECLINE_REASON}
            rows={3}
            fullWidth
            onChange={(event) => setReason(event.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="error" isLoading={pending === 'decline'} disabled={pending !== null}>
              {t('mentorship.confirmDecline')}
            </Button>
            <Button type="button" variant="ghost" disabled={pending !== null} onClick={() => setDeclining(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}
