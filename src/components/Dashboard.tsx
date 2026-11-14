import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button, CalendarIcon, PairIcon, UserIcon } from './ui';
import { useI18n } from '../hooks/useI18n';
import { useAppSelector } from '../redux/hooks';
import withAuthentication from './hoc/withAuthentication';
import { APP_ROUTES } from '../constants/routes';
import { mentorshipService } from '../service/request';
import type { Mentorship } from '../types/mentorship';

type CardTone = 'neutral' | 'mentor' | 'mentee' | 'bridge';

// Mentor features take the blue bird's color, mentee features the green bird's, shared ones the teal between them.
const toneClasses: Record<CardTone, string> = {
  neutral: 'bg-neutral-100 text-neutral-700',
  mentor: 'bg-primary-100 text-primary-700',
  mentee: 'bg-secondary-100 text-secondary-700',
  bridge: 'bg-teal-100 text-teal-700',
};

interface ActionCardProps {
  icon: ReactNode;
  tone: CardTone;
  title: string;
  description: string;
  children: ReactNode;
}

function ActionCard({ icon, tone, title, description, children }: ActionCardProps) {
  return (
    <article className="flex flex-col items-start gap-3 rounded-xl border border-neutral-200 bg-white p-6">
      <span className={`flex size-10 items-center justify-center rounded-lg ${toneClasses[tone]}`}>{icon}</span>
      <h3 className="mt-1 text-lg font-medium">{title}</h3>
      <p className="flex-1 text-sm leading-relaxed text-neutral-600">{description}</p>
      {children}
    </article>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const isMentor = user?.customerType === 'MENTOR';
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);

  // Only to point at a proposal waiting for an answer; the mentorship page shows the errors.
  useEffect(() => {
    let current = true;
    mentorshipService.getMine().then((found) => current && setMentorships(found)).catch(() => undefined);
    return () => {
      current = false;
    };
  }, []);

  const waitingForMe = mentorships.some((mentorship) => mentorship.awaiting === (isMentor ? 'MENTOR' : 'MENTEE'));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t('dashboard.welcome')}</h1>
        <p className="mt-3 text-lg text-neutral-600">{t('dashboard.subtitle')}</p>
      </header>

      {waitingForMe && (
        <div
          role="status"
          className="flex flex-col items-start gap-3 rounded-xl border border-teal-300 bg-teal-50 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-teal-800">{t(isMentor ? 'dashboard.proposalWaiting.MENTOR' : 'dashboard.proposalWaiting.MENTEE')}</p>
          <Button variant={isMentor ? 'primary' : 'secondary'} onClick={() => navigate(APP_ROUTES.mentorship)}>
            {t('dashboard.proposalWaiting.open')}
          </Button>
        </div>
      )}

      <section aria-labelledby="quick-actions" className="flex flex-col gap-4">
        <h2 id="quick-actions" className="text-lg font-medium">{t('dashboard.quickActions')}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon={<UserIcon />}
            tone="neutral"
            title={t('dashboard.myProfile')}
            description={t('dashboard.myProfileDescription')}
          >
            <Button variant="outline" onClick={() => navigate(APP_ROUTES.profile)}>
              {t('dashboard.myProfileButton')}
            </Button>
          </ActionCard>

          <ActionCard
            icon={<PairIcon />}
            tone={isMentor ? 'mentee' : 'mentor'}
            title={t('dashboard.mentorship')}
            description={t(isMentor ? 'dashboard.mentorshipDescription.MENTOR' : 'dashboard.mentorshipDescription.MENTEE')}
          >
            <Button variant={isMentor ? 'secondary' : 'primary'} onClick={() => navigate(APP_ROUTES.mentorship)}>
              {t('dashboard.mentorshipButton')}
            </Button>
          </ActionCard>

          {/* Sessions have no page yet (phase 3). The button stays disabled until the feature exists. */}

          <ActionCard
            icon={<CalendarIcon />}
            tone="bridge"
            title={t('dashboard.sessions')}
            description={t('dashboard.sessionsDescription')}
          >
            <Button variant="outline" disabled>{t('dashboard.viewConversations')}</Button>
          </ActionCard>
        </div>
      </section>
    </div>
  );
}

const AuthDashboard = withAuthentication(Dashboard, {
  requireAuth: true,
  redirectTo: APP_ROUTES.login,
});

export { AuthDashboard as Dashboard };
