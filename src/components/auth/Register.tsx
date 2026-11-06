import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button, Checkbox, Input } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearError, registerUser } from '../../redux/reducers/auth';
import { CustomerType } from '../../types/auth/register';
import { AuthCard, FormError } from './AuthCard';

type RegisterErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  customerType?: string;
  termsAccepted?: string;
};

const customerTypes = [
  { value: 'MENTOR', icon: '🎓', title: 'auth.register.mentor', description: 'auth.register.mentorDescription' },
  { value: 'MENTEE', icon: '📚', title: 'auth.register.mentee', description: 'auth.register.menteeDescription' },
] as const;

export function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<RegisterErrors>({});

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
    const newErrors: RegisterErrors = {};

    if (!email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.register.errors.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('validation.required');
    } else if (password.length < 6) {
      newErrors.password = t('auth.register.errors.passwordMinLength');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.register.errors.passwordsNotMatch');
    }

    if (!customerType) {
      newErrors.customerType = t('auth.register.errors.userTypeRequired');
    }

    if (!termsAccepted) {
      newErrors.termsAccepted = t('validation.required');
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
      await dispatch(registerUser({
        email: email.trim(),
        password,
        customerType: customerType as CustomerType,
      })).unwrap();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleUserTypeSelect = (type: CustomerType) => {
    setCustomerType(type);
    setFormErrors((prev) => ({ ...prev, customerType: undefined }));
  };

  return (
    <AuthCard title={t('auth.register.title')} subtitle={t('auth.register.subtitle')}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <Input
          label={t('auth.register.email')}
          type="email"
          autoComplete="email"
          placeholder={t('auth.register.emailPlaceholder')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          variant={formErrors.email ? 'error' : 'default'}
          helperText={formErrors.email}
          fullWidth
        />

        <Input
          label={t('auth.register.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.register.passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant={formErrors.password ? 'error' : 'default'}
          helperText={formErrors.password}
          fullWidth
        />

        <Input
          label={t('auth.register.confirmPassword')}
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          variant={formErrors.confirmPassword ? 'error' : 'default'}
          helperText={formErrors.confirmPassword}
          fullWidth
        />

        <fieldset
          aria-describedby={formErrors.customerType ? 'customer-type-error' : undefined}
          className="flex flex-col gap-2"
        >
          <legend className="mb-2 text-sm font-medium">{t('auth.register.userType')}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {customerTypes.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-neutral-300 p-3
                  transition-colors hover:border-primary-400 has-checked:border-primary-500 has-checked:bg-primary-50
                  has-focus-visible:ring-3 has-focus-visible:ring-primary-200"
              >
                <input
                  type="radio"
                  name="customerType"
                  value={option.value}
                  checked={customerType === option.value}
                  onChange={() => handleUserTypeSelect(option.value)}
                  className="sr-only"
                />
                <span aria-hidden="true" className="text-2xl">{option.icon}</span>
                <span>
                  <span className="block font-semibold text-neutral-900">{t(option.title)}</span>
                  <span className="block text-sm text-neutral-600">{t(option.description)}</span>
                </span>
              </label>
            ))}
          </div>
          {formErrors.customerType && (
            <span id="customer-type-error" className="text-sm text-error-dark">{formErrors.customerType}</span>
          )}
        </fieldset>

        <div className="flex flex-col gap-1">
          <Checkbox
            label={t('auth.register.termsOfUse')}
            checked={termsAccepted}
            aria-invalid={!!formErrors.termsAccepted || undefined}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (e.target.checked) {
                setFormErrors((prev) => ({ ...prev, termsAccepted: undefined }));
              }
            }}
          />
          {formErrors.termsAccepted && (
            <span className="text-sm text-error-dark">{formErrors.termsAccepted}</span>
          )}
        </div>

        {error && <FormError>{error}</FormError>}

        <Button type="submit" size="lg" isLoading={loading} fullWidth>
          {t('auth.register.registerButton')}
        </Button>
      </form>

      <p className="text-center text-sm text-neutral-600">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
          {t('auth.register.loginHere')}
        </Link>
      </p>
    </AuthCard>
  );
}
