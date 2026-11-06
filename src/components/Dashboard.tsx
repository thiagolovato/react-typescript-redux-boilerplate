import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui';
import { useI18n } from '../hooks/useI18n';
import { useAppSelector } from '../redux/hooks';
import withAuthentication from './hoc/withAuthentication';

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  children: ReactNode;
}

function ActionCard({ icon, title, description, children }: ActionCardProps) {
  return (
    <article className="flex flex-col items-start gap-3 rounded-xl bg-white p-6 shadow-sm">
      <span aria-hidden="true" className="text-4xl">{icon}</span>
      <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="flex-1 text-sm text-neutral-600">{description}</p>
      {children}
    </article>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 rounded-2xl border border-white/10 bg-primary-700 p-6
      text-white shadow-lg sm:p-8"
    >
      <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold sm:text-4xl">{t('dashboard.welcome')}</h1>
          <p className="mt-3 text-lg opacity-90">{t('dashboard.subtitle')}</p>
        </div>
        <Button size="lg" onClick={() => navigate('/profile')}>
          {t('dashboard.myProfileButton')}
        </Button>
      </header>

      <section aria-labelledby="quick-actions" className="flex flex-col gap-4">
        <h2 id="quick-actions" className="text-2xl font-bold">{t('dashboard.quickActions')}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <ActionCard
            icon="👤"
            title={t('dashboard.myProfile')}
            description={t('dashboard.myProfileDescription')}
          >
            <Button variant="outline" onClick={() => navigate('/profile')}>
              {t('dashboard.myProfileButton')}
            </Button>
          </ActionCard>

          {/* Mentor search and sessions have no page yet. Their buttons stay disabled until the feature exists. */}
          {user?.customerType === 'MENTEE' && (
            <ActionCard
              icon="🔍"
              title={t('dashboard.findMentors')}
              description={t('dashboard.findMentorsDescription')}
            >
              <Button disabled>{t('dashboard.exploreMentors')}</Button>
            </ActionCard>
          )}

          {user?.customerType === 'MENTOR' && (
            <ActionCard
              icon="👥"
              title={t('dashboard.findMentees')}
              description={t('dashboard.findMenteesDescription')}
            >
              <Button variant="secondary" disabled>{t('dashboard.findMenteesButton')}</Button>
            </ActionCard>
          )}

          <ActionCard
            icon="📅"
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
  redirectTo: '/login',
});

export { AuthDashboard as Dashboard };
