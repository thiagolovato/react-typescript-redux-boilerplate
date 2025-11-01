import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@rdx/hooks';
import { tokens } from '../../constants/tokens';
import { Button } from '../ui/Button';
import { useI18n } from '../../hooks/useI18n';
import { logoutUser } from '../../redux/reducers/auth';
import { useAppDispatch } from '../../redux/hooks';

const SidebarContainer = styled.aside<{ $isCollapsed: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${({ $isCollapsed }) => ($isCollapsed ? '80px' : '280px')};
  background: ${tokens.colors.primary[800]};
  border-right: 1px solid ${tokens.colors.primary[700]};
  transition: width ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  display: flex;
  flex-direction: column;
  z-index: 100;
`;

const Logo = styled.div<{ $isCollapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: ${tokens.spacing[4]};
  color: ${tokens.colors.neutral[50]};
  border-bottom: 1px solid ${tokens.colors.primary[700]};
  min-height: 64px;

  span {
    font-size: ${({ $isCollapsed }) => ($isCollapsed ? '1.5rem' : '1.2rem')};
    font-weight: ${tokens.typography.fontWeight.bold};
    margin-left: ${({ $isCollapsed }) => ($isCollapsed ? '0' : tokens.spacing[2])};
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
    transition: opacity ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  }
`;

const Navigation = styled.nav`
  display: flex;
  flex-direction: column;
  padding: ${tokens.spacing[4]} 0;
  flex: 1;
`;

const NavLink = styled(Link)<{ $isActive: boolean; $isCollapsed: boolean }>`
  color: ${({ $isActive }) => ($isActive ? tokens.colors.neutral[50] : tokens.colors.neutral[400])};
  text-decoration: none;
  padding: ${tokens.spacing[3]} ${tokens.spacing[4]};
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[3]};
  transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  position: relative;

  &:hover {
    background: ${tokens.colors.primary[700]};
    color: ${tokens.colors.neutral[50]};
  }

  ${({ $isActive }) =>
    $isActive &&
    `
    background: ${tokens.colors.primary[700]};
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: ${tokens.colors.primary[500]};
    }
  `}

  span {
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
    transition: opacity ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
    white-space: nowrap;
  }
`;

const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: ${tokens.spacing[4]};
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${tokens.colors.primary[500]};
  border: none;
  color: ${tokens.colors.neutral[50]};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};

  &:hover {
    background: ${tokens.colors.primary[400]};
  }
`;

const Footer = styled.div<{ $isCollapsed: boolean }>`
  padding: ${tokens.spacing[4]};
  border-top: 1px solid ${tokens.colors.primary[700]};
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};

  ${({ $isCollapsed }) =>
    $isCollapsed &&
    `
    align-items: center;
    padding: ${tokens.spacing[2]};
  `}
`;

const UserInfo = styled.div<{ $isCollapsed: boolean }>`
  color: ${tokens.colors.neutral[50]};
  font-size: ${tokens.typography.fontSize.sm};
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? '0' : '1')};
  transition: opacity ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  return (
    <SidebarContainer $isCollapsed={isCollapsed}>
      <Logo $isCollapsed={isCollapsed}>
        <span>🌸</span>
        <span>{t('app.name')}</span>
      </Logo>

      <ToggleButton onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? '→' : '←'}
      </ToggleButton>

      <Navigation>
        <NavLink
          to="/dashboard"
          $isActive={location.pathname === '/dashboard'}
          $isCollapsed={isCollapsed}
        >
          <span>🏠</span>
          <span>{t('navigation.dashboard')}</span>
        </NavLink>
        <NavLink
          to="/mentors"
          $isActive={location.pathname === '/mentors'}
          $isCollapsed={isCollapsed}
        >
          <span>👥</span>
          <span>Mentores</span>
        </NavLink>
        <NavLink
          to="/sessions"
          $isActive={location.pathname === '/sessions'}
          $isCollapsed={isCollapsed}
        >
          <span>📅</span>
          <span>Sessões</span>
        </NavLink>
        <NavLink
          to="/profile"
          $isActive={location.pathname === '/profile'}
          $isCollapsed={isCollapsed}
        >
          <span>👤</span>
          <span>{t('profile.title')}</span>
        </NavLink>
      </Navigation>

      <Footer $isCollapsed={isCollapsed}>
        {user && (
          <UserInfo $isCollapsed={isCollapsed}>
            {user.email} ({user.customerType === 'MENTOR' ? 'Mentor' : 'Estudante'})
          </UserInfo>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          fullWidth={!isCollapsed}
        >
          {isCollapsed ? '🚪' : t('dashboard.logout')}
        </Button>
      </Footer>
    </SidebarContainer>
  );
};
