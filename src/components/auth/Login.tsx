import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@components/ui';
import { tokens } from '@constants/tokens.ts';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '@rdx/hooks.ts';
import { clearError, loginUser } from '@rdx/reducers/auth.ts';
import { BrandingSection } from '@components/auth/BrandingSection.tsx';

// Container principal
const LoginContainer = styled.div`
    min-height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: ${tokens.spacing[4]};
    box-sizing: border-box;

    @media (max-width: ${tokens.breakpoints.mobile}) {
        padding: ${tokens.spacing[2]};
    }
`;

const LoginWrapper = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 95%;
    max-width: 1400px;
    height: 650px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: ${tokens.borderRadius['2xl']};
    box-shadow: ${tokens.shadows['2xl']};
    overflow: hidden;
    margin: 0 auto;

    @media (max-width: ${tokens.breakpoints.notebook}) {
        grid-template-columns: 1fr;
        max-width: 500px;
        width: 90%;
        height: auto;
        min-height: 600px;
    }

    @media (min-width: 1920px) {
        max-width: 1200px;
        width: 80%;
    }
`;

const FormSection = styled.div`
    padding: ${tokens.spacing[8]};
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: ${tokens.spacing[5]};

    @media (max-width: ${tokens.breakpoints.notebook}) {
        padding: ${tokens.spacing[6]} ${tokens.spacing[4]};
    }

    form {
        display: flex;
        flex-direction: column;
        gap: ${tokens.spacing[4]};
    }
`;

const MobileLogo = styled.div`
    display: none;
    font-size: 3rem;
    text-align: center;
    margin-bottom: ${tokens.spacing[4]};

    @media (max-width: ${tokens.breakpoints.notebook}) {
        display: block;
    }
`;

const FormTitle = styled.h2`
    font-size: ${tokens.typography.fontSize['2xl']};
    font-weight: ${tokens.typography.fontWeight.bold};
    color: ${tokens.colors.neutral[900]};
    margin-bottom: ${tokens.spacing[2]};
    text-align: center;

    @media (max-width: ${tokens.breakpoints.notebook}) {
        font-size: ${tokens.typography.fontSize.xl};
    }
`;

const FormSubtitle = styled.p`
    color: ${tokens.colors.neutral[600]};
    text-align: center;
    margin-bottom: ${tokens.spacing[6]};
    font-size: ${tokens.typography.fontSize.base};
`;

const ErrorMessage = styled.div`
    color: ${tokens.colors.error.main};
    font-size: ${tokens.typography.fontSize.sm};
    margin-top: ${tokens.spacing[1]};
    margin-bottom: ${tokens.spacing[4]};
    padding: ${tokens.spacing[3]};
    background-color: ${tokens.colors.error.light};
    border-radius: ${tokens.borderRadius.md};
    border: 1px solid ${tokens.colors.error.main};
`;

const SignupContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${tokens.spacing[2]};
    margin-top: ${tokens.spacing[6]};
    text-align: center;
    flex-wrap: wrap;
`;

const SignupText = styled.span`
    color: ${tokens.colors.neutral[600]};
    font-size: ${tokens.typography.fontSize.sm};
`;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
        userName?: string;
        password?: string;
    }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const validateForm = () => {
    const newErrors: { userName?: string; password?: string } = {};

    if (!userName.trim()) {
      newErrors.userName = t('auth.login.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userName)) {
      newErrors.userName = t('auth.login.errors.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('auth.login.errors.passwordRequired');
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginUser({
        email: userName.trim(),
        password,
      })).unwrap();

      // Success - user will be redirected by useEffect
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by Redux state
    }
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  return (
    <LoginContainer>
      <LoginWrapper>
        <BrandingSection />

        <FormSection>
          <MobileLogo src="/src/assets/mentor-mentee-logo.png" alt="Mentor Mentee Logo" />
          <FormTitle>{t('auth.login.title')}</FormTitle>
          <FormSubtitle>
            {t('auth.login.subtitle')}
          </FormSubtitle>

          <form onSubmit={handleSubmit}>
            <Input
              label={t('auth.login.email')}
              type="email"
              placeholder={t('auth.login.emailPlaceholder')}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              variant={formErrors.userName ? 'error' : 'default'}
              helperText={formErrors.userName}
              fullWidth
            />

            <Input
              label={t('auth.login.password')}
              type="password"
              placeholder={t('auth.login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant={formErrors.password ? 'error' : 'default'}
              helperText={formErrors.password}
              fullWidth
            />

            {error && (
              <ErrorMessage>{error}</ErrorMessage>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              fullWidth
            >
              {t('auth.login.loginButton')}
            </Button>
          </form>

          <SignupContainer>
            <SignupText>{t('auth.login.noAccount')}</SignupText>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateToRegister}
            >
              {t('auth.login.createAccount')}
            </Button>
          </SignupContainer>
        </FormSection>
      </LoginWrapper>
    </LoginContainer>
  );
};
