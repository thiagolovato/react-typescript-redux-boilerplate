import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { tokens } from '../constants/tokens';
import { useI18n } from '../hooks/useI18n';
import { useAppSelector } from '@rdx/hooks';
import withAuthentication from './hoc/withAuthentication';

const DashboardContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-bottom: ${tokens.spacing[8]};
`;

const MainContent = styled.main`
    width: 100%;
    max-width: 1200px;
    padding: ${tokens.spacing[8]} ${tokens.spacing[6]};
    margin: auto auto;
    background: ${tokens.colors.primary[700]};
    border-radius: ${tokens.borderRadius['2xl']};
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-sizing: border-box;

    @media (max-width: ${tokens.breakpoints.mobile}) {
        padding: ${tokens.spacing[6]} ${tokens.spacing[4]};
        margin: ${tokens.spacing[4]} ${tokens.spacing[2]} 0;
        border-radius: ${tokens.borderRadius.xl};
    }
`;

const WelcomeSection = styled.section`
    text-align: center;
    margin-bottom: ${tokens.spacing[8]};
`;

const WelcomeTitle = styled.h1`
    font-size: ${tokens.typography.fontSize['4xl']};
    font-weight: ${tokens.typography.fontWeight.bold};
    color: white;
    margin-bottom: ${tokens.spacing[4]};

    @media (max-width: ${tokens.breakpoints.mobile}) {
        font-size: ${tokens.typography.fontSize['3xl']};
    }
`;

const WelcomeSubtitle = styled.p`
    font-size: ${tokens.typography.fontSize.lg};
    color: rgba(255, 255, 255, 0.9);
    max-width: 600px;
    margin: 0 auto;
    line-height: ${tokens.typography.lineHeight.relaxed};

    @media (max-width: ${tokens.breakpoints.mobile}) {
        font-size: ${tokens.typography.fontSize.base};
    }
`;

const QuickActionsSection = styled.section`
    margin-top: ${tokens.spacing[8]};
`;

const SectionTitle = styled.h2`
    font-size: ${tokens.typography.fontSize['2xl']};
    font-weight: ${tokens.typography.fontWeight.bold};
    color: white;
    margin-bottom: ${tokens.spacing[6]};
    text-align: center;
`;

const ActionsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: ${tokens.spacing[6]};
`;

const ActionCard = styled.div`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: ${tokens.borderRadius.xl};
    padding: ${tokens.spacing[6]};
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: ${tokens.shadows.xl};
    transition: ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};

    &:hover {
        transform: translateY(-4px);
        box-shadow: ${tokens.shadows['2xl']};
    }
`;

const ActionIcon = styled.div`
    font-size: 3rem;
    margin-bottom: ${tokens.spacing[4]};
`;

const ActionTitle = styled.h3`
    font-size: ${tokens.typography.fontSize.xl};
    font-weight: ${tokens.typography.fontWeight.semibold};
    color: ${tokens.colors.neutral[900]};
    margin-bottom: ${tokens.spacing[2]};
`;

const ActionDescription = styled.p`
    color: ${tokens.colors.neutral[600]};
    margin-bottom: ${tokens.spacing[4]};
    font-size: ${tokens.typography.fontSize.sm};
`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <DashboardContainer>
      <MainContent>
        <WelcomeSection>
          <WelcomeTitle>{t('dashboard.welcome')}</WelcomeTitle>
          <WelcomeSubtitle>
            {t('dashboard.subtitle')}
          </WelcomeSubtitle>
        </WelcomeSection>

        <QuickActionsSection>
          <SectionTitle>{t('dashboard.quickActions')}</SectionTitle>
          <ActionsGrid>
            {user?.customerType === 'MENTEE' && (
              <ActionCard>
                <ActionIcon>🔍</ActionIcon>
                <ActionTitle>{t('dashboard.findMentors')}</ActionTitle>
                <ActionDescription>
                  {t('dashboard.findMentorsDescription')}
                </ActionDescription>
                <Button variant="primary" size="md">
                  {t('dashboard.exploreMentors')}
                </Button>
              </ActionCard>
            )}

            {user?.customerType === 'MENTOR' && (
              <ActionCard>
                <ActionIcon>👥</ActionIcon>
                <ActionTitle>{t('dashboard.findMentees')}</ActionTitle>
                <ActionDescription>
                  {t('dashboard.findMenteesDescription')}
                </ActionDescription>
                <Button variant="secondary" size="md">
                  {t('dashboard.findMenteesButton')}
                </Button>
              </ActionCard>
            )}

            <ActionCard>
              <ActionIcon>👤</ActionIcon>
              <ActionTitle>{t('dashboard.myProfile')}</ActionTitle>
              <ActionDescription>
                {t('dashboard.myProfileDescription')}
              </ActionDescription>
              <Button variant="outline" size="md" onClick={() => navigate('/profile')}>
                {t('dashboard.myProfileButton')}
              </Button>
            </ActionCard>

            <ActionCard>
              <ActionIcon>📅</ActionIcon>
              <ActionTitle>{t('dashboard.sessions')}</ActionTitle>
              <ActionDescription>
                {t('dashboard.sessionsDescription')}
              </ActionDescription>
              <Button variant="outline" size="md">
                {t('dashboard.viewConversations')}
              </Button>
            </ActionCard>
          </ActionsGrid>
        </QuickActionsSection>
      </MainContent>
    </DashboardContainer>
  );
};

const AuthDashboard = withAuthentication(Dashboard, {
  requireAuth: true,
  redirectTo: '/login',
});

export { AuthDashboard as Dashboard };
