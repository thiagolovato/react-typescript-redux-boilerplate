import React, { useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@rdx/hooks';
import { tokens } from '../constants/tokens';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { TextArea } from './ui/TextArea';
import { Checkbox } from './ui/Checkbox';
import { useI18n } from '../hooks/useI18n';
import withAuthentication from './hoc/withAuthentication';
import { profileService } from '../service/request/api';
import type { CustomerContact, ProfileFormData } from '../types/profile';

const PageContainer = styled.div`
    min-height: 100vh;
    width: 100%;
    display: flex;
    justify-content: center;
    padding: ${tokens.spacing[8]} ${tokens.spacing[4]};
    margin: 0 auto;
`;

const ProfileContainer = styled.div`
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
`;

const Title = styled.h1`
    font-size: ${tokens.typography.fontSize['3xl']};
    color: ${tokens.colors.neutral[50]};
    margin-bottom: ${tokens.spacing[6]};
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacing[6]};
    background: ${tokens.colors.primary[800]};
    padding: ${tokens.spacing[6]};
    border-radius: ${tokens.borderRadius.xl};
    box-shadow: ${tokens.shadows.xl};
    border: 1px solid ${tokens.colors.primary[700]};
`;

const FormSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacing[4]};
`;

const SectionTitle = styled.h2`
    font-size: ${tokens.typography.fontSize.xl};
    color: ${tokens.colors.neutral[50]};
    margin-bottom: ${tokens.spacing[2]};
    border-bottom: 1px solid ${tokens.colors.primary[700]};
    padding-bottom: ${tokens.spacing[2]};
`;

const InputGroup = styled.div`
    display: flex;
    gap: ${tokens.spacing[4]};
    flex-wrap: wrap;

    ${({ alignItems }) => alignItems && css`
        align-items: ${alignItems};
    `}
    > * {
        flex: 1;
        min-width: 200px;
    }
`;

const CheckboxGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacing[3]};
    color: ${tokens.colors.neutral[50]};
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: ${tokens.spacing[4]};
    justify-content: flex-end;
    margin-top: ${tokens.spacing[6]};
`;

const ErrorMessage = styled.div`
    color: ${tokens.colors.error.main};
    background: ${tokens.colors.error.light};
    padding: ${tokens.spacing[4]};
    border-radius: ${tokens.borderRadius.md};
    margin-bottom: ${tokens.spacing[4]};
    font-size: ${tokens.typography.fontSize.sm};
`;

const AddButton = styled(Button)`
    margin-top: ${tokens.spacing[2]};
`;

const ContactItem = styled.div`
    display: flex;
    gap: ${tokens.spacing[2]};
    align-items: center;
    margin-bottom: ${tokens.spacing[2]};
`;

const RemoveButton = styled(Button)`
    flex-shrink: 0;
`;

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    age: 0,
    gender: '',
    languages: [],
    profession: '',
    generation: '',
    contacts: [],
    address: {
      city: '',
      region: '',
      country: '',
    },
    hasRuralTraining: false,
    expectations: '',
    interestAreas: [],
    isGraduated: false,
    hasMentorshipTraining: false,
    hasMentorshipExperience: false,
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.userId) return;

      try {
        setLoading(true);
        setError(null);
        const profile = await profileService.get(user.userId);
        setFormData({
          name: profile.name,
          age: profile.age,
          gender: profile.gender,
          languages: profile.languages,
          profession: profile.profession,
          generation: profile.generation,
          contacts: profile.contacts,
          address: profile.address,
          hasRuralTraining: profile.hasRuralTraining,
          expectations: profile.expectations,
          interestAreas: profile.interestAreas,
          isGraduated: profile.isGraduated,
          hasMentorshipTraining: profile.hasMentorshipTraining,
          hasMentorshipExperience: profile.hasMentorshipExperience,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user?.userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);
      await profileService.save({
        ...formData,
        userId: user.userId,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
  };

  const handleAddContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          contactType: 'EMAIL',
          contactValue: '',
          isPreferentialContact: false,
        },
      ],
    }));
  };

  const handleContactChange = (index: number, field: keyof CustomerContact, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) =>
                i === index ? { ...contact, [field]: value } : contact,
      ),
    }));
  };

  const handleRemoveContact = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleAddLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        {
          languageId: '',
          language: {
            id: '',
            value: '',
          },
        },
      ],
    }));
  };

  const handleLanguageChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.map((lang, i) =>
                i === index ?
                    {
                      languageId: value,
                      language: { id: value, value },
                    } :
                    lang,
      ),
    }));
  };

  const handleRemoveLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <PageContainer>
        <ProfileContainer>
          <Title>{t('profile.loading')}</Title>
        </ProfileContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ProfileContainer>
        <Title>{t('profile.title')}</Title>
        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}
        <Form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>{t('profile.personalInfo')}</SectionTitle>
            <InputGroup>
              <Input
                label={t('profile.name')}
                labelColor={tokens.colors.neutral[0]}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t('profile.age')}
                labelColor={tokens.colors.neutral[0]}
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t('profile.gender')}
                labelColor={tokens.colors.neutral[0]}
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
              />
            </InputGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>{t('profile.languages')}</SectionTitle>
            {formData.languages.map((lang, index) => (
              <InputGroup key={index} alignItems={'self-end'}>
                <Input
                  label={t('profile.language')}
                  labelColor={tokens.colors.neutral[0]}
                  value={lang.languageId}
                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                  required
                />
                <RemoveButton
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveLanguage(index)}
                >
                  {t('common.remove')}
                </RemoveButton>
              </InputGroup>
            ))}
            <AddButton
              type="button"
              variant="outline"
              onClick={handleAddLanguage}
            >
              {t('profile.addLanguage')}
            </AddButton>
          </FormSection>

          <FormSection>
            <SectionTitle>{t('profile.professionalInfo')}</SectionTitle>
            <InputGroup>
              <Input
                label={t('profile.profession')}
                labelColor={tokens.colors.neutral[0]}
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                required
              />
              <Input
                label={t('profile.generation')}
                labelColor={tokens.colors.neutral[0]}
                name="generation"
                value={formData.generation}
                onChange={handleInputChange}
              />
            </InputGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>{t('profile.contacts')}</SectionTitle>
            {formData.contacts.map((contact, index) => (
              <ContactItem key={index}>
                <Input
                  label={t('profile.contactType')}
                  value={contact.contactType}
                  onChange={(e) => handleContactChange(index, 'contactType', e.target.value)}
                  required
                />
                <Input
                  label={t('profile.contactValue')}
                  value={contact.contactValue}
                  onChange={(e) => handleContactChange(index, 'contactValue', e.target.value)}
                  required
                />
                <Checkbox
                  label={t('profile.preferentialContact')}
                  checked={contact.isPreferentialContact}
                  onChange={(e) => handleContactChange(index, 'isPreferentialContact', e.target.checked)}
                />
                <RemoveButton
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveContact(index)}
                >
                  {t('common.remove')}
                </RemoveButton>
              </ContactItem>
            ))}
            <AddButton
              type="button"
              variant="outline"
              onClick={handleAddContact}
            >
              {t('profile.addContact')}
            </AddButton>
          </FormSection>

          <FormSection>
            <SectionTitle>{t('profile.address')}</SectionTitle>
            <InputGroup>
              <Input
                label={t('profile.city')}
                labelColor={tokens.colors.neutral[0]}
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                required
              />
              <Input
                label={t('profile.region')}
                labelColor={tokens.colors.neutral[0]}
                name="region"
                value={formData.address.region}
                onChange={handleAddressChange}
                required
              />
              <Input
                label={t('profile.country')}
                labelColor={tokens.colors.neutral[0]}
                name="country"
                value={formData.address.country}
                onChange={handleAddressChange}
                required
              />
            </InputGroup>
          </FormSection>

          <FormSection>
            <SectionTitle>{t('profile.expectations')}</SectionTitle>
            <TextArea
              label={t('profile.expectations')}
              name="expectations"
              value={formData.expectations}
              onChange={handleInputChange}
              rows={4}
            />
          </FormSection>

          <FormSection>
            <SectionTitle>{t('profile.qualifications')}</SectionTitle>
            <CheckboxGroup>
              <Checkbox
                label={t('profile.isGraduated')}
                name="isGraduated"
                checked={formData.isGraduated}
                onChange={handleInputChange}
              />
              {user?.customerType === 'MENTOR' && (
                <>
                  <Checkbox
                    label={t('profile.hasMentorshipTraining')}
                    name="hasMentorshipTraining"
                    checked={formData.hasMentorshipTraining}
                    onChange={handleInputChange}
                  />
                  <Checkbox
                    label={t('profile.hasMentorshipExperience')}
                    name="hasMentorshipExperience"
                    checked={formData.hasMentorshipExperience}
                    onChange={handleInputChange}
                  />
                </>
              )}
              <Checkbox
                label={t('profile.hasRuralTraining')}
                name="hasRuralTraining"
                checked={formData.hasRuralTraining}
                onChange={handleInputChange}
              />
            </CheckboxGroup>
          </FormSection>

          <ButtonGroup>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
            >
              {t('common.save')}
            </Button>
          </ButtonGroup>
        </Form>
      </ProfileContainer>
    </PageContainer>
  );
};

export default withAuthentication(Profile, {
  requireAuth: true,
  redirectTo: '/login',
});
