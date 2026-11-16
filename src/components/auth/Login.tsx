import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ApiErrorAlert, Button, Input } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearError, loginUser } from '../../redux/reducers/auth';
import { AuthCard } from './AuthCard';
import { homePathFor } from '../../constants/auth';
import { APP_ROUTES } from '../../constants/routes';
import type { SessionEndedState } from '../../hooks/useEndSession';

interface LoginProps {
  /** The coordinator login: other texts, no sign-up link, and the server only accepts coordinator accounts. */
  coordinator?: boolean;
}

export function Login({ coordinator = false }: LoginProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { loading, error, isAuthenticated, user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  // Read once: the history entry is cleared below, so a reload or "back" does not show the message again.
  const [sessionEndedCode] = useState((location.state as SessionEndedState | null)?.sessionEndedCode);

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<{
    userName?: string;
    password?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(homePathFor(user?.customerType));
    }
  }, [isAuthenticated, user?.customerType, navigate]);

  useEffect(() => {
    if (sessionEndedCode) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [sessionEndedCode, location.pathname, navigate]);

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
      // Success redirects through the isAuthenticated effect. Errors live in Redux state.
      await dispatch(loginUser({
        email: userName.trim(),
        password,
        coordinator,
      })).unwrap();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <AuthCard
      title={t(coordinator ? 'auth.coordinatorLogin.title' : 'auth.login.title')}
      subtitle={t(coordinator ? 'auth.coordinatorLogin.subtitle' : 'auth.login.subtitle')}
    >
      {sessionEndedCode && !error && (
        <p role="status" className="rounded-lg border border-info-main/40 bg-info-light p-3 text-sm text-info-dark">
          {t(`apiErrors.problems.${sessionEndedCode}`, { defaultValue: t('apiErrors.problems.auth.token.invalid') })}
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t('auth.login.email')}
          type="email"
          autoComplete="email"
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
          autoComplete="current-password"
          placeholder={t('auth.login.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant={formErrors.password ? 'error' : 'default'}
          helperText={formErrors.password}
          fullWidth
        />

        <ApiErrorAlert error={error} fallback={t('auth.login.errors.general')} />

        <Button type="submit" size="lg" isLoading={loading} fullWidth>
          {t('auth.login.loginButton')}
        </Button>
      </form>

      {!coordinator && (
        <p className="text-sm text-neutral-600">
          {t('auth.login.noAccount')}{' '}
          <Link to={APP_ROUTES.register} className="font-medium text-primary-700 underline-offset-2 hover:underline">
            {t('auth.login.createAccount')}
          </Link>
        </p>
      )}
    </AuthCard>
  );
}
