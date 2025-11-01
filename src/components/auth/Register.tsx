import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { tokens } from '../../constants/tokens';
import { useI18n } from '../../hooks/useI18n';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { registerUser, clearError } from '../../redux/reducers/auth';
import { CustomerType } from '../../types/auth/register';

// Keyframes for animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.1;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
    transform: scale(1.1);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.2), 0 0 40px rgba(167, 139, 250, 0.1);
  }
`;

const backgroundShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
`;

const particleFloat = keyframes`
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
`;

const RegisterContainer = styled.div`
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

const RegisterWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  width: 95%;
  max-width: 1400px;
  min-height: 700px;
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
    min-height: 800px;
  }

  @media (min-width: 1920px) {
    max-width: 1200px;
    width: 80%;
  }
`;

const BrandingSection = styled.div`
  background: linear-gradient(
    135deg,
    ${tokens.colors.primary[600]} 0%,
    ${tokens.colors.primary[800]} 50%,
    ${tokens.colors.secondary[600]} 100%
  );
  background-size: 200% 200%;
  animation: ${backgroundShift} 8s ease-in-out infinite;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${tokens.spacing[8]};
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: ${tokens.breakpoints.notebook}) {
    padding: ${tokens.spacing[6]} ${tokens.spacing[4]};
    min-height: 200px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(167, 139, 250, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const BrandingLogo = styled.img`
  width: 120px;
  height: 120px;
  margin-bottom: ${tokens.spacing[4]};
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  border-radius: 50%;

  @media (max-width: ${tokens.breakpoints.notebook}) {
    width: 80px;
    height: 80px;
    margin-bottom: ${tokens.spacing[2]};
  }
`;

const BrandingTitle = styled.h1`
  font-size: ${tokens.typography.fontSize['3xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  margin-bottom: ${tokens.spacing[2]};
  text-align: center;
  animation: ${glow} 4s ease-in-out infinite;

  @media (max-width: ${tokens.breakpoints.notebook}) {
    font-size: ${tokens.typography.fontSize['2xl']};
  }
`;

const BrandingSubtitle = styled.p`
  font-size: ${tokens.typography.fontSize.lg};
  text-align: center;
  opacity: 0.9;
  line-height: ${tokens.typography.lineHeight.relaxed};
  max-width: 300px;

  @media (max-width: ${tokens.breakpoints.notebook}) {
    font-size: ${tokens.typography.fontSize.base};
    max-width: 250px;
  }
`;

// Floating particles
const FloatingParticle = styled.div<{ delay: number; duration: number; size: number }>`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ${particleFloat} ${(props) => props.duration}s linear infinite;
  animation-delay: ${(props) => props.delay}s;
  left: ${() => Math.random() * 100}%;
`;

const DecorativeOrb = styled.div<{ size: number; position: { x: number; y: number } }>`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  left: ${(props) => props.position.x}%;
  top: ${(props) => props.position.y}%;
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${() => Math.random() * 2}s;
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

const MobileLogo = styled.img`
  display: none;
  width: 60px;
  height: 60px;
  margin-bottom: ${tokens.spacing[4]};
  border-radius: 50%;

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

const UserTypeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[3]};
  margin: ${tokens.spacing[4]} 0;
`;

const UserTypeGroupTitle = styled.label`
  display: block;
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.neutral[700]};
  margin-bottom: ${tokens.spacing[2]};
`;

const UserTypeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[3]};
`;

const UserTypeOption = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: ${tokens.spacing[4]};
  border: 2px solid ${(props) => (props.$isSelected ? tokens.colors.primary[600] : tokens.colors.neutral[200])};
  border-radius: ${tokens.borderRadius.lg};
  cursor: pointer;
  transition: ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  background: ${(props) => (props.$isSelected ? tokens.colors.primary[50] : 'white')};

  &:hover {
    border-color: ${tokens.colors.primary[400]};
    background: ${tokens.colors.primary[50]};
  }
`;

const UserTypeIcon = styled.div`
  font-size: 2rem;
  margin-right: ${tokens.spacing[3]};
`;

const UserTypeContent = styled.div`
  flex: 1;
`;

const UserTypeTitle = styled.div<{ $isSelected: boolean }>`
  font-weight: ${tokens.typography.fontWeight.semibold};
  font-size: ${tokens.typography.fontSize.base};
  color: ${(props) => (props.$isSelected ? tokens.colors.primary[700] : tokens.colors.neutral[800])};
  margin-bottom: ${tokens.spacing[1]};
`;

const UserTypeDescription = styled.div`
  font-size: ${tokens.typography.fontSize.sm};
  color: ${tokens.colors.neutral[600]};
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

const LanguageToggleWrapper = styled.div`
  position: absolute;
  top: ${tokens.spacing[6]};
  right: ${tokens.spacing[6]};
  z-index: ${tokens.zIndex.dropdown};
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${tokens.spacing[2]};
  margin-top: ${tokens.spacing[6]};
  text-align: center;
  flex-wrap: wrap;
`;

const LoginText = styled.span`
  color: ${tokens.colors.neutral[600]};
  font-size: ${tokens.typography.fontSize.sm};
`;

const MobileDecorativeElement = styled.div<{ $position?: 'top-left' | 'bottom-right' }>`
  position: absolute;
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, ${tokens.colors.secondary[400]}, ${tokens.colors.secondary[600]});
  border-radius: 50%;
  animation: ${pulse} 4s ease-in-out infinite;
  top: ${(props) => (props.$position === 'top-left' ? '-50px' : 'auto')};
  left: ${(props) => (props.$position === 'top-left' ? '-50px' : 'auto')};
  bottom: ${(props) => (props.$position === 'bottom-right' ? 'auto' : '-50px')};
  right: ${(props) => (props.$position === 'bottom-right' ? '-50px' : 'auto')};

  @media (min-width: ${tokens.breakpoints.notebook}) {
    display: none;
  }
`;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useI18n();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType | ''>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    customerType?: string;
    termsAccepted?: string;
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
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      customerType?: string;
      termsAccepted?: string;
    } = {};

    if (!email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('validation.email');
    }

    if (!password) {
      newErrors.password = t('validation.required');
    } else if (password.length < 6) {
      newErrors.password = t('validation.passwordLength');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordMatch');
    }

    if (!customerType) {
      newErrors.customerType = t('validation.required');
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
      await dispatch(registerUser({
        email: email.trim(),
        password,
        customerType: customerType as CustomerType,
      })).unwrap();

      // Success - user will be redirected by useEffect
      console.log('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      // Error is handled by Redux state
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleUserTypeSelect = (type: CustomerType) => {
    setCustomerType(type);
    setFormErrors((prev) => ({ ...prev, customerType: undefined }));
  };

  return (
    <RegisterContainer>
      <LanguageToggleWrapper>
        <LanguageToggle />
      </LanguageToggleWrapper>

      <RegisterWrapper>
        <BrandingSection>
          <BrandingLogo src="/src/assets/mentor-mentee-logo.png" alt="Mentor Mentee Logo" />
          <BrandingTitle>{t('app.name')}</BrandingTitle>
          <BrandingSubtitle>
            {t('app.tagline')}
          </BrandingSubtitle>

          {/* Floating Particles */}
          {[...Array(6)].map((_, i) => (
            <FloatingParticle
              key={i}
              delay={i * 2}
              duration={8 + Math.random() * 4}
              size={4 + Math.random() * 8}
            />
          ))}

          {/* Decorative Orbs */}
          <DecorativeOrb size={80} position={{ x: 10, y: 20 }} />
          <DecorativeOrb size={60} position={{ x: 85, y: 10 }} />
          <DecorativeOrb size={100} position={{ x: 75, y: 75 }} />
          <DecorativeOrb size={40} position={{ x: 15, y: 85 }} />

          <MobileDecorativeElement $position="top-left" />
          <MobileDecorativeElement $position="bottom-right" />
        </BrandingSection>

        <FormSection>
          <MobileLogo src="/src/assets/mentor-mentee-logo.png" alt="Mentor Mentee Logo" />
          <FormTitle>{t('auth.register.title')}</FormTitle>
          <FormSubtitle>
            {t('auth.register.subtitle')}
          </FormSubtitle>

          <form onSubmit={handleSubmit}>
            <Input
              label={t('auth.register.email')}
              type="email"
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
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              variant={formErrors.confirmPassword ? 'error' : 'default'}
              helperText={formErrors.confirmPassword}
              fullWidth
            />

            <UserTypeContainer>
              <UserTypeGroupTitle>{t('auth.register.userType')}</UserTypeGroupTitle>

              <UserTypeOptions>
                <UserTypeOption
                  $isSelected={customerType === 'MENTOR'}
                  onClick={() => handleUserTypeSelect('MENTOR')}
                >
                  <input
                    type="radio"
                    name="customerType"
                    value="MENTOR"
                    checked={customerType === 'MENTOR'}
                    onChange={() => handleUserTypeSelect('MENTOR')}
                    style={{ display: 'none' }}
                  />
                  <UserTypeIcon>🎓</UserTypeIcon>
                  <UserTypeContent>
                    <UserTypeTitle $isSelected={customerType === 'MENTOR'}>
                      {t('auth.register.mentor')}
                    </UserTypeTitle>
                    <UserTypeDescription>
                      {t('auth.register.mentorDescription')}
                    </UserTypeDescription>
                  </UserTypeContent>
                </UserTypeOption>

                <UserTypeOption
                  $isSelected={customerType === 'MENTEE'}
                  onClick={() => handleUserTypeSelect('MENTEE')}
                >
                  <input
                    type="radio"
                    name="customerType"
                    value="MENTEE"
                    checked={customerType === 'MENTEE'}
                    onChange={() => handleUserTypeSelect('MENTEE')}
                    style={{ display: 'none' }}
                  />
                  <UserTypeIcon>📚</UserTypeIcon>
                  <UserTypeContent>
                    <UserTypeTitle $isSelected={customerType === 'MENTEE'}>
                      {t('auth.register.mentee')}
                    </UserTypeTitle>
                    <UserTypeDescription>
                      {t('auth.register.menteeDescription')}
                    </UserTypeDescription>
                  </UserTypeContent>
                </UserTypeOption>
              </UserTypeOptions>

              {formErrors.customerType && (
                <ErrorMessage>{formErrors.customerType}</ErrorMessage>
              )}
            </UserTypeContainer>

            <div style={{ marginBottom: tokens.spacing[4] }}>
              <Checkbox
                label={t('auth.register.termsOfUse')}
                checked={termsAccepted}
                onChange={(e) => {
                  setTermsAccepted(e.target.checked);
                  if (e.target.checked) {
                    setFormErrors((prev) => ({ ...prev, termsAccepted: undefined }));
                  }
                }}
              />
              {formErrors.termsAccepted && (
                <ErrorMessage>{formErrors.termsAccepted}</ErrorMessage>
              )}
            </div>

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
              {t('auth.register.registerButton')}
            </Button>
          </form>

          <LoginContainer>
            <LoginText>{t('auth.register.hasAccount')}</LoginText>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNavigateToLogin}
            >
              {t('auth.register.loginHere')}
            </Button>
          </LoginContainer>
        </FormSection>
      </RegisterWrapper>
    </RegisterContainer>
  );
};
