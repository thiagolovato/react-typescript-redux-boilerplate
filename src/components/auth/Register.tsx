import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ApiErrorAlert, Button, Checkbox, Input, RoleBird } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useFieldErrorText } from '../../hooks/useFieldErrorText';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { clearError, registerUser } from '../../redux/reducers/auth';
import type { SignUpType } from '../../types/auth/register';
import { fieldErrorOf } from '../../service/request/apiError';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../../constants/auth';
import { AuthCard } from './AuthCard';

type RegisterErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  customerType?: string;
  termsAccepted?: string;
};

// Request fields this form shows next to their input.
const INLINE_FIELDS = ['email', 'password', 'customerType'] as const;

// Each role wears its bird's color when picked.
const customerTypes = [
  {
    value: 'MENTOR',
    title: 'auth.register.mentor',
    description: 'auth.register.mentorDescription',
    checkedClass: 'has-checked:border-primary-500 has-checked:bg-primary-50',
  },
  {
    value: 'MENTEE',
    title: 'auth.register.mentee',
    description: 'auth.register.menteeDescription',
    checkedClass: 'has-checked:border-secondary-500 has-checked:bg-secondary-50',
  },
] as const;

export function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerType, setCustomerType] = useState<SignUpType | ''>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<RegisterErrors>({});
  const fieldErrorText = useFieldErrorText();

  // The app's own checks first; then what the server rejected.
  const errorFor = (field: typeof INLINE_FIELDS[number]) => {
    const serverError = fieldErrorOf(error, field);
    return formErrors[field] ?? (serverError && fieldErrorText(serverError, error?.service));
  };
  const emailError = errorFor('email');
  const passwordError = errorFor('password');
  const customerTypeError = errorFor('customerType');

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
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = t('auth.register.errors.passwordMinLength', { min: MIN_PASSWORD_LENGTH });
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
        customerType: customerType as SignUpType,
      })).unwrap();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const handleUserTypeSelect = (type: SignUpType) => {
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
          variant={emailError ? 'error' : 'default'}
          helperText={emailError}
          fullWidth
        />

        <Input
          label={t('auth.register.password')}
          type="password"
          autoComplete="new-password"
          placeholder={t('auth.register.passwordPlaceholder')}
          maxLength={MAX_PASSWORD_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          variant={passwordError ? 'error' : 'default'}
          helperText={passwordError}
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
          aria-describedby={customerTypeError ? 'customer-type-error' : undefined}
          className="flex flex-col gap-2"
        >
          <legend className="mb-2 text-sm font-medium">{t('auth.register.userType')}</legend>
          <div className="grid gap-3">
            {customerTypes.map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center gap-4 rounded-lg border border-neutral-300 p-3
                  transition-colors hover:border-neutral-400 has-focus-visible:ring-3 has-focus-visible:ring-primary-100
                  ${option.checkedClass}`}
              >
                <input
                  type="radio"
                  name="customerType"
                  value={option.value}
                  checked={customerType === option.value}
                  onChange={() => handleUserTypeSelect(option.value)}
                  className="sr-only"
                />
                <RoleBird role={option.value} />
                <span>
                  <span className="block font-medium text-neutral-900">{t(option.title)}</span>
                  <span className="block text-sm text-neutral-600">{t(option.description)}</span>
                </span>
              </label>
            ))}
          </div>
          {customerTypeError && (
            <span id="customer-type-error" className="text-sm text-error-dark">{customerTypeError}</span>
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
          <Link
            to="/privacy"
            target="_blank"
            className="ml-7 text-sm font-medium text-primary-700 underline-offset-2 hover:underline"
          >
            {t('auth.register.readTerms')}
          </Link>
          {formErrors.termsAccepted && (
            <span className="text-sm text-error-dark">{formErrors.termsAccepted}</span>
          )}
        </div>

        <ApiErrorAlert error={error} fallback={t('auth.register.errors.general')} inlineFields={INLINE_FIELDS} />

        <Button type="submit" size="lg" isLoading={loading} fullWidth>
          {t('auth.register.registerButton')}
        </Button>
      </form>

      <p className="text-sm text-neutral-600">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/login" className="font-medium text-primary-700 underline-offset-2 hover:underline">
          {t('auth.register.loginHere')}
        </Link>
      </p>
    </AuthCard>
  );
}
