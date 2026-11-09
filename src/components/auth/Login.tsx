import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Input } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearError, loginUser } from '../../redux/reducers/auth';
import { AuthCard, FormError } from './AuthCard';

export function Login() {
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
      // Success redirects through the isAuthenticated effect. Errors live in Redux state.
      await dispatch(loginUser({
        email: userName.trim(),
        password,
      })).unwrap();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <AuthCard title={t('auth.login.title')} subtitle={t('auth.login.subtitle')}>
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

        {error && <FormError>{error}</FormError>}

        <Button type="submit" size="lg" isLoading={loading} fullWidth>
          {t('auth.login.loginButton')}
        </Button>
      </form>

      <p className="text-sm text-neutral-600">
        {t('auth.login.noAccount')}{' '}
        <Link to="/register" className="font-medium text-primary-700 underline-offset-2 hover:underline">
          {t('auth.login.createAccount')}
        </Link>
      </p>
    </AuthCard>
  );
}
