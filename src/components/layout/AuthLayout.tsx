import React from 'react';
import styled from 'styled-components';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@rdx/hooks';
import { Sidebar } from './Sidebar';
import { tokens } from '../../constants/tokens';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: ${tokens.spacing[6]};
  transition: margin-left ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};

  &.collapsed {
    margin-left: 80px;
  }
`;

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};
