import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '../redux/hooks';
import { Button, Checkbox, Input, TextArea } from './ui';
import { useI18n } from '../hooks/useI18n';
import withAuthentication from './hoc/withAuthentication';
import { profileService } from '../service/request/api';
import type { CustomerContact, ProfileFormData } from '../types/profile';

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-primary-700 pb-2 text-xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message?: string; fallbackKey: string } | null>(null);

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
        setError({ message: err instanceof Error ? err.message : undefined, fallbackKey: 'profile.errors.loadProfile' });
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
      setSaving(true);
      setError(null);
      await profileService.save({
        ...formData,
        userId: user.userId,
      });
      navigate('/dashboard');
    } catch (err) {
      setError({ message: err instanceof Error ? err.message : undefined, fallbackKey: 'profile.errors.saveProfile' });
    } finally {
      setSaving(false);
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
      <p role="status" className="py-16 text-center text-2xl text-neutral-50">{t('profile.loading')}</p>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-center text-3xl font-bold text-neutral-50">{t('profile.title')}</h1>
      {error && (
        <p role="alert" className="rounded-md bg-error-light p-4 text-sm text-error-dark">
          {error.message ?? t(error.fallbackKey)}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-8 rounded-xl border border-primary-700 bg-primary-800 p-6 text-neutral-50
          shadow-lg"
      >
        <FormSection title={t('profile.personalInfo')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={t('profile.name')} name="name" value={formData.name} onChange={handleInputChange} required />
            <Input
              label={t('profile.age')}
              name="age"
              type="number"
              min={0}
              value={formData.age}
              onChange={handleInputChange}
              required
            />
            <Input
              label={t('profile.gender')}
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
            />
          </div>
        </FormSection>

        <FormSection title={t('profile.languages')}>
          {formData.languages.map((lang, index) => (
            <div key={index} className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label={t('profile.language')}
                  value={lang.languageId}
                  onChange={(e) => handleLanguageChange(index, e.target.value)}
                  required
                  fullWidth
                />
              </div>
              <Button variant="outline" onClick={() => handleRemoveLanguage(index)}>
                {t('common.remove')}
              </Button>
            </div>
          ))}
          <Button variant="outline" className="self-start" onClick={handleAddLanguage}>
            {t('profile.addLanguage')}
          </Button>
        </FormSection>

        <FormSection title={t('profile.professionalInfo')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('profile.profession')}
              name="profession"
              value={formData.profession}
              onChange={handleInputChange}
              required
            />
            <Input
              label={t('profile.generation')}
              name="generation"
              value={formData.generation}
              onChange={handleInputChange}
            />
          </div>
        </FormSection>

        <FormSection title={t('profile.contacts')}>
          {formData.contacts.map((contact, index) => (
            <fieldset key={index} className="grid items-end gap-3 rounded-lg border border-primary-700 p-4
              sm:grid-cols-[10rem_1fr_auto]"
            >
              <legend className="sr-only">{`${t('profile.contacts')} ${index + 1}`}</legend>
              <label className="flex flex-col gap-2 text-sm font-medium">
                {t('profile.contactType')}
                <select
                  value={contact.contactType}
                  onChange={(e) => handleContactChange(index, 'contactType', e.target.value)}
                  required
                  className="h-10 rounded-lg border border-neutral-300 bg-white px-3 text-base text-neutral-900"
                >
                  <option value="EMAIL">EMAIL</option>
                  <option value="PHONE">PHONE</option>
                </select>
              </label>
              <Input
                label={t('profile.contactValue')}
                value={contact.contactValue}
                onChange={(e) => handleContactChange(index, 'contactValue', e.target.value)}
                required
                fullWidth
              />
              <Button variant="outline" onClick={() => handleRemoveContact(index)}>
                {t('common.remove')}
              </Button>
              <Checkbox
                label={t('profile.preferentialContact')}
                checked={contact.isPreferentialContact}
                onChange={(e) => handleContactChange(index, 'isPreferentialContact', e.target.checked)}
                className="sm:col-span-3"
              />
            </fieldset>
          ))}
          <Button variant="outline" className="self-start" onClick={handleAddContact}>
            {t('profile.addContact')}
          </Button>
        </FormSection>

        <FormSection title={t('profile.address')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label={t('profile.city')}
              name="city"
              value={formData.address.city}
              onChange={handleAddressChange}
              required
            />
            <Input
              label={t('profile.region')}
              name="region"
              value={formData.address.region}
              onChange={handleAddressChange}
              required
            />
            <Input
              label={t('profile.country')}
              name="country"
              value={formData.address.country}
              onChange={handleAddressChange}
              required
            />
          </div>
        </FormSection>

        <FormSection title={t('profile.expectations')}>
          <TextArea
            aria-label={t('profile.expectations')}
            name="expectations"
            value={formData.expectations}
            onChange={handleInputChange}
            rows={4}
          />
        </FormSection>

        <FormSection title={t('profile.qualifications')}>
          <div className="flex flex-col gap-3">
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
          </div>
        </FormSection>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/dashboard')} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={saving}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default withAuthentication(Profile, {
  requireAuth: true,
  redirectTo: '/login',
});
