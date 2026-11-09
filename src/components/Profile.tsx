import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppSelector } from '../redux/hooks';
import { Button, Checkbox, Input, PlusIcon, Select, TextArea, TrashIcon } from './ui';
import { useI18n } from '../hooks/useI18n';
import withAuthentication from './hoc/withAuthentication';
import { profileService } from '../service/request/api';
import { LanguagePicker } from './profile/LanguagePicker';
import { GENDER_OPTIONS, GENDER_SELF_DESCRIBE } from '../constants/profileOptions';
import type { CustomerContact, Profile as ProfileData, ProfileRequest } from '../types/profile';

// Age is kept as typed text so the field can be empty; it becomes a number on submit.
type ProfileForm = Omit<ProfileRequest, 'age'> & { age: string };

const emptyForm: ProfileForm = {
  name: '',
  age: '',
  gender: '',
  languages: [],
  profession: '',
  generation: '',
  contacts: [],
  address: { city: '', region: '', country: '' },
  hasRuralTraining: false,
  expectations: '',
  interestAreaIds: [],
  isGraduated: false,
  hasMentorshipTraining: false,
  hasMentorshipExperience: false,
};

function toForm(profile: ProfileData): ProfileForm {
  return {
    name: profile.name,
    age: String(profile.age ?? ''),
    gender: profile.gender,
    languages: profile.languages ?? [],
    profession: profile.profession,
    generation: profile.generation,
    contacts: profile.contacts ?? [],
    address: profile.address ?? emptyForm.address,
    hasRuralTraining: profile.hasRuralTraining,
    expectations: profile.expectations,
    interestAreaIds: profile.interestAreaIds ?? [],
    isGraduated: profile.isGraduated,
    hasMentorshipTraining: profile.hasMentorshipTraining,
    hasMentorshipExperience: profile.hasMentorshipExperience,
  };
}

/** Values outside the fixed list are the person's own description. */
function genderChoiceOf(gender: string): string {
  if (!gender) return '';
  return (GENDER_OPTIONS as readonly string[]).includes(gender) ? gender : GENDER_SELF_DESCRIBE;
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-neutral-200 pb-2 text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Profile() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { user } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [error, setError] = useState<{ message?: string; fallbackKey: string } | null>(null);
  const [formData, setFormData] = useState<ProfileForm>(emptyForm);
  const [genderChoice, setGenderChoice] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getMine();
        if (profile) {
          setFormData(toForm(profile));
          setGenderChoice(genderChoiceOf(profile.gender));
          setProfileExists(true);
        }
      } catch (err) {
        setError({ message: err instanceof Error ? err.message : undefined, fallbackKey: 'profile.errors.loadProfile' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);
      const request: ProfileRequest = { ...formData, age: Number(formData.age) };
      await (profileExists ? profileService.update(request) : profileService.create(request));
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

  const handleGenderChoice = (choice: string) => {
    setGenderChoice(choice);
    setFormData((prev) => ({ ...prev, gender: choice === GENDER_SELF_DESCRIBE ? '' : choice }));
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

  if (loading) {
    return (
      <p role="status" className="py-16 text-center text-lg text-neutral-600">{t('profile.loading')}</p>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t('profile.title')}</h1>
      {error && (
        <p role="alert" className="rounded-lg border border-error-main/40 bg-error-light p-4 text-sm text-error-dark">
          {error.message || t(error.fallbackKey)}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
      >
        <FormSection title={t('profile.personalInfo')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label={t('profile.name')} name="name" value={formData.name} onChange={handleInputChange} required />
            <Input
              label={t('profile.age')}
              name="age"
              type="number"
              min={16}
              max={120}
              value={formData.age}
              onChange={handleInputChange}
              required
            />
            <Select
              label={t('profile.gender')}
              value={genderChoice}
              onChange={(e) => handleGenderChoice(e.target.value)}
              required
            >
              <option value="" disabled>{t('profile.selectGender')}</option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>{t(`profile.genders.${option}`)}</option>
              ))}
              <option value={GENDER_SELF_DESCRIBE}>{t(`profile.genders.${GENDER_SELF_DESCRIBE}`)}</option>
            </Select>
          </div>
          {genderChoice === GENDER_SELF_DESCRIBE && (
            <Input
              label={t('profile.genderSelfDescribe')}
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              maxLength={50}
              required
              fullWidth
            />
          )}
        </FormSection>

        <FormSection title={t('profile.languages')}>
          <LanguagePicker
            value={formData.languages}
            onChange={(languages) => setFormData((prev) => ({ ...prev, languages }))}
          />
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
              required
            />
          </div>
        </FormSection>

        <FormSection title={t('profile.contacts')}>
          {formData.contacts.map((contact, index) => (
            <fieldset key={index} className="grid items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4
              sm:grid-cols-[10rem_1fr_auto]"
            >
              <legend className="sr-only">{`${t('profile.contacts')} ${index + 1}`}</legend>
              <Select
                label={t('profile.contactType')}
                value={contact.contactType}
                onChange={(e) => handleContactChange(index, 'contactType', e.target.value)}
                required
              >
                <option value="EMAIL">{t('profile.contactTypes.EMAIL')}</option>
                <option value="PHONE">{t('profile.contactTypes.PHONE')}</option>
              </Select>
              <Input
                label={t('profile.contactValue')}
                value={contact.contactValue}
                onChange={(e) => handleContactChange(index, 'contactValue', e.target.value)}
                required
                fullWidth
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  aria-label={t('profile.removeContact', { index: index + 1 })}
                  title={t('common.remove')}
                  onClick={() => handleRemoveContact(index)}
                >
                  <TrashIcon />
                </Button>
                {index === formData.contacts.length - 1 && (
                  <Button
                    variant="outline"
                    aria-label={t('profile.addContact')}
                    title={t('profile.addContact')}
                    onClick={handleAddContact}
                  >
                    <PlusIcon />
                  </Button>
                )}
              </div>
              <Checkbox
                label={t('profile.preferentialContact')}
                checked={contact.isPreferentialContact}
                onChange={(e) => handleContactChange(index, 'isPreferentialContact', e.target.checked)}
                className="sm:col-span-3"
              />
            </fieldset>
          ))}
          {formData.contacts.length === 0 && (
            <Button variant="outline" className="self-start" leftIcon={<PlusIcon />} onClick={handleAddContact}>
              {t('profile.addContact')}
            </Button>
          )}
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
            required
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
