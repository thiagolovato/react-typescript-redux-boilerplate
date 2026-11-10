import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAppSelector } from '../redux/hooks';
import { ApiErrorAlert, Button, Checkbox, Input, Select, TextArea } from './ui';
import { useI18n } from '../hooks/useI18n';
import withAuthentication from './hoc/withAuthentication';
import { profileService } from '../service/request/api';
import { fieldErrorOf, toApiError } from '../service/request/apiError';
import { useFieldErrorText } from '../hooks/useFieldErrorText';
import { LanguagePicker } from './profile/LanguagePicker';
import { InterestAreaPicker } from './profile/InterestAreaPicker';
import { ContactsField } from './profile/ContactsField';
import { CountrySelect } from './profile/CountrySelect';
import { useConsentDocuments } from '../hooks/useConsentDocuments';
import { ConsentText } from './legal/ConsentText';
import { API_ERROR_CODES } from '../constants/errorCodes';
import {
  CONTACT_PREFERENCES,
  GENDER_OPTIONS,
  GENDER_SELF_DESCRIBE,
  MAX_AGE,
  MAX_GRADUATION_YEARS_AHEAD,
  MIN_AGE,
  MIN_GRADUATION_YEAR,
  PREFERRED_MENTOR_GENDER_OPTIONS,
} from '../constants/profileOptions';
import type { ApiError } from '../types/api';
import type { ContactPreference, CustomerType, Profile as ProfileData, ProfileRequest } from '../types/profile';

// Numbers and choices are kept as typed text so the fields can be empty; they are converted on submit.
type ConsentFields = 'acceptedTermsDocumentId' | 'researchDocumentId' | 'consentLanguage';
type ProfileForm = Omit<ProfileRequest, 'graduationYear' | 'contactPreference' | ConsentFields> & {
  graduationYear: string;
  contactPreference: ContactPreference | '';
};

const MAX_TEXT = 5000;
// Same rule as the @Pattern on CustomerRequest.professionalLink. The browser anchors it to the whole value.
const PROFESSIONAL_LINK_PATTERN = String.raw`https?://\S+`;

// Request fields shown next to their input. Server errors for other fields go in the list under the form.
const INLINE_FIELDS = [
  'name', 'birthDate', 'birthDateInRange', 'profession', 'graduationYear', 'academicBackground', 'professionalLink',
  'address.city', 'address.region', 'motivation', 'expectations', 'goals', 'acceptedBackgrounds',
  'otherPartyPreferences', 'additionalInfo',
] as const;
type InlineField = typeof INLINE_FIELDS[number];

const emptyForm: ProfileForm = {
  name: '',
  birthDate: '',
  gender: '',
  languages: [],
  profession: '',
  graduationYear: '',
  academicBackground: '',
  professionalLink: '',
  contacts: [],
  address: { city: '', region: '', country: '' },
  hasRuralTraining: false,
  motivation: '',
  expectations: '',
  goals: '',
  contactPreference: '',
  preferredMentorGenders: [],
  otherPartyPreferences: '',
  acceptedBackgrounds: '',
  additionalInfo: '',
  interestAreaIds: [],
  hasMentorshipTraining: false,
  hasMentorshipExperience: false,
  researchConsent: false,
};

function toForm(profile: ProfileData): ProfileForm {
  return {
    name: profile.name,
    birthDate: profile.birthDate ?? '',
    gender: profile.gender,
    languages: profile.languages,
    profession: profile.profession,
    graduationYear: profile.graduationYear === null ? '' : String(profile.graduationYear),
    academicBackground: profile.academicBackground ?? '',
    professionalLink: profile.professionalLink ?? '',
    contacts: profile.contacts,
    address: { ...emptyForm.address, ...profile.address, region: profile.address?.region ?? '' },
    hasRuralTraining: profile.hasRuralTraining,
    motivation: profile.motivation ?? '',
    expectations: profile.expectations,
    goals: profile.goals ?? '',
    contactPreference: profile.contactPreference ?? '',
    preferredMentorGenders: profile.preferredMentorGenders,
    otherPartyPreferences: profile.otherPartyPreferences ?? '',
    acceptedBackgrounds: profile.acceptedBackgrounds ?? '',
    additionalInfo: profile.additionalInfo ?? '',
    interestAreaIds: profile.interestAreaIds,
    hasMentorshipTraining: profile.hasMentorshipTraining,
    hasMentorshipExperience: profile.hasMentorshipExperience,
    researchConsent: profile.researchConsent,
  };
}

/** Values outside the fixed list are the person's own description. */
function genderChoiceOf(gender: string): string {
  if (!gender) return '';
  return (GENDER_OPTIONS as readonly string[]).includes(gender) ? gender : GENDER_SELF_DESCRIBE;
}

/** Today minus `years`, as `YYYY-MM-DD`. */
function yearsAgo(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().slice(0, 10);
}

function FormSection({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 border-b border-neutral-200 pb-2">
        <h2 className="text-lg font-medium">{title}</h2>
        {description && <p className="text-sm text-neutral-600">{description}</p>}
      </div>
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
  const [termsAlreadyAccepted, setTermsAlreadyAccepted] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  // `error` is a check made here; `apiError` is what the server answered.
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ error: ApiError; fallbackKey: string } | null>(null);
  const fieldErrorText = useFieldErrorText();
  const [formData, setFormData] = useState<ProfileForm>(emptyForm);
  const consents = useConsentDocuments();
  const [genderChoice, setGenderChoice] = useState('');

  const role: CustomerType = user?.customerType === 'MENTOR' ? 'MENTOR' : 'MENTEE';
  const isMentor = role === 'MENTOR';
  const maxGraduationYear = new Date().getFullYear() + MAX_GRADUATION_YEARS_AHEAD;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await profileService.getMine();
        if (profile) {
          setFormData(toForm(profile));
          setGenderChoice(genderChoiceOf(profile.gender));
          setProfileExists(true);
          setTermsAlreadyAccepted(profile.termsAccepted);
        }
      } catch (err) {
        setApiError({ error: toApiError(err), fallbackKey: 'profile.errors.loadProfile' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const update = <K extends keyof ProfileForm>(field: K, value: ProfileForm[K]) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, address: { ...prev.address, [name]: value } }));
  };

  const togglePreferredMentorGender = (gender: string, accepted: boolean) =>
    setFormData((prev) => ({
      ...prev,
      preferredMentorGenders: accepted
        ? [...prev.preferredMentorGenders, gender]
        : prev.preferredMentorGenders.filter((chosen) => chosen !== gender),
    }));

  const handleGenderChoice = (choice: string) => {
    setGenderChoice(choice);
    update('gender', choice === GENDER_SELF_DESCRIBE ? '' : choice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Lists have no native "required"; check them here.
    setApiError(null);
    const { TERMS: terms, RESEARCH: research } = consents.documents;
    if (!terms || !research) {
      setError('profile.errors.loadConsents');
      return;
    }
    if (formData.languages.length === 0) {
      setError('profile.errors.languagesRequired');
      return;
    }
    if (formData.interestAreaIds.length === 0) {
      setError('profile.errors.interestAreasRequired');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const request: ProfileRequest = {
        ...formData,
        graduationYear: Number(formData.graduationYear),
        contactPreference: formData.contactPreference as ContactPreference,
        // Accepting means the terms shown on this page, which the server checks are still in force.
        acceptedTermsDocumentId: !termsAlreadyAccepted && acceptTerms ? terms.id : null,
        researchDocumentId: research.id,
        consentLanguage: consents.language,
      };
      await (profileExists ? profileService.update(request) : profileService.create(request));
      navigate('/dashboard');
    } catch (err) {
      const apiErr = toApiError(err);
      const termsChangedMeanwhile = apiErr.code === API_ERROR_CODES.core.consentOutdated
        || apiErr.code === API_ERROR_CODES.core.termsNotAccepted;
      if (termsChangedMeanwhile) {
        // A newer text came into force while the page was open (sent outdated, or none because the old one
        // was already accepted): show the new text and ask for the acceptance again.
        setTermsAlreadyAccepted(false);
        setAcceptTerms(false);
        await consents.reload();
      }
      setApiError({ error: apiErr, fallbackKey: 'profile.errors.saveProfile' });
    } finally {
      setSaving(false);
    }
  };

  /** Error look and text for an inline input (one or more request fields); `help` shows when it is fine. */
  const fieldProps = (fields: InlineField | InlineField[], help?: string) => {
    const serverError = [fields].flat()
        .map((field) => fieldErrorOf(apiError?.error, field))
        .find((fieldError) => fieldError !== undefined);
    return {
      variant: serverError ? 'error' as const : 'default' as const,
      helperText: serverError ? fieldErrorText(serverError, apiError?.error.service) : help,
    };
  };

  if (loading) {
    return (
      <p role="status" className="py-16 text-center text-lg text-neutral-600">{t('profile.loading')}</p>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{t('profile.title')}</h1>
        <p className="text-neutral-600">{t(`profile.intro.${role}`)}</p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-10 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8"
      >
        <FormSection title={t('profile.sections.aboutYou')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('profile.name')}
              name="name"
              {...fieldProps('name')}
              value={formData.name}
              onChange={handleInputChange}
              maxLength={150}
              autoComplete="name"
              isRequired
              fullWidth
            />
            <Input
              label={t('profile.birthDate')}
              name="birthDate"
              {...fieldProps(['birthDate', 'birthDateInRange'])}
              type="date"
              min={yearsAgo(MAX_AGE)}
              max={yearsAgo(MIN_AGE)}
              value={formData.birthDate}
              onChange={handleInputChange}
              autoComplete="bday"
              isRequired
              fullWidth
            />
          </div>
          <Select
            label={t('profile.gender')}
            value={genderChoice}
            onChange={(e) => handleGenderChoice(e.target.value)}
            required
          >
            <option value="" disabled>{t('profile.select')}</option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>{t(`profile.genders.${option}`)}</option>
            ))}
            <option value={GENDER_SELF_DESCRIBE}>{t(`profile.genders.${GENDER_SELF_DESCRIBE}`)}</option>
          </Select>
          {genderChoice === GENDER_SELF_DESCRIBE && (
            <Input
              label={t('profile.genderSelfDescribe')}
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              maxLength={50}
              isRequired
              fullWidth
            />
          )}
        </FormSection>

        <FormSection title={t('profile.sections.location')}>
          <div className="grid gap-4 sm:grid-cols-3">
            <CountrySelect
              label={t('profile.country')}
              value={formData.address.country}
              onChange={(country) => setFormData((prev) => ({ ...prev, address: { ...prev.address, country } }))}
            />
            <Input
              label={t('profile.city')}
              name="city"
              {...fieldProps('address.city')}
              value={formData.address.city}
              onChange={handleAddressChange}
              maxLength={100}
              autoComplete="address-level2"
              isRequired
              fullWidth
            />
            <Input
              label={t('profile.region')}
              name="region"
              {...fieldProps('address.region')}
              value={formData.address.region}
              onChange={handleAddressChange}
              maxLength={100}
              autoComplete="address-level1"
              fullWidth
            />
          </div>
        </FormSection>

        <FormSection title={t('profile.languages')} description={t('profile.languagesHelp')}>
          <LanguagePicker value={formData.languages} onChange={(languages) => update('languages', languages)} />
        </FormSection>

        <FormSection title={t('profile.sections.education')}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t(`profile.profession.${role}`)}
              name="profession"
              {...fieldProps('profession')}
              value={formData.profession}
              onChange={handleInputChange}
              maxLength={100}
              isRequired
              fullWidth
            />
            <Input
              label={t(`profile.graduationYear.${role}`)}
              name="graduationYear"
              {...fieldProps('graduationYear')}
              type="number"
              min={MIN_GRADUATION_YEAR}
              max={maxGraduationYear}
              value={formData.graduationYear}
              onChange={handleInputChange}
              isRequired
              fullWidth
            />
          </div>
          <Input
            label={t('profile.academicBackground')}
            {...fieldProps('academicBackground', t('profile.academicBackgroundHelp'))}
            name="academicBackground"
            value={formData.academicBackground}
            onChange={handleInputChange}
            maxLength={500}
            isRequired
            fullWidth
          />
          <Input
            label={t('profile.professionalLink')}
            {...fieldProps('professionalLink', t('profile.professionalLinkHelp'))}
            name="professionalLink"
            type="url"
            placeholder="https://"
            value={formData.professionalLink}
            onChange={handleInputChange}
            maxLength={300}
            pattern={PROFESSIONAL_LINK_PATTERN}
            fullWidth
          />
          <div className="flex flex-col gap-3">
            <Checkbox
              label={t('profile.hasRuralTraining')}
              name="hasRuralTraining"
              checked={formData.hasRuralTraining}
              onChange={handleInputChange}
            />
            {isMentor && (
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
          </div>
        </FormSection>

        <FormSection title={t('profile.sections.interests')} description={t('profile.interestsHelp')}>
          <InterestAreaPicker
            value={formData.interestAreaIds}
            onChange={(interestAreaIds) => update('interestAreaIds', interestAreaIds)}
          />
        </FormSection>

        <FormSection title={t('profile.sections.mentorship')}>
          <TextArea
            label={t(`profile.motivation.${role}`)}
            name="motivation"
            {...fieldProps('motivation')}
            value={formData.motivation}
            onChange={handleInputChange}
            maxLength={MAX_TEXT}
            rows={3}
            isRequired
            fullWidth
          />
          <TextArea
            label={t(`profile.expectations.${role}`)}
            name="expectations"
            {...fieldProps('expectations')}
            value={formData.expectations}
            onChange={handleInputChange}
            maxLength={MAX_TEXT}
            rows={3}
            isRequired
            fullWidth
          />
          <TextArea
            label={t(`profile.goals.${role}`)}
            name="goals"
            {...fieldProps('goals')}
            value={formData.goals}
            onChange={handleInputChange}
            maxLength={MAX_TEXT}
            rows={3}
            isRequired
            fullWidth
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t(`profile.contactPreference.${role}`)}
              name="contactPreference"
              value={formData.contactPreference}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>{t('profile.select')}</option>
              {CONTACT_PREFERENCES.map((option) => (
                <option key={option} value={option}>{t(`profile.contactPreferences.${option}`)}</option>
              ))}
            </Select>
          </div>
          {!isMentor && (
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">{t('profile.preferredMentorGenders')}</legend>
              <p className="text-sm text-neutral-600">{t('profile.preferredMentorGendersHelp')}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {PREFERRED_MENTOR_GENDER_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    label={t(`profile.genders.${option}`)}
                    checked={formData.preferredMentorGenders.includes(option)}
                    onChange={(e) => togglePreferredMentorGender(option, e.target.checked)}
                  />
                ))}
              </div>
            </fieldset>
          )}
          {isMentor && (
            <Input
              label={t('profile.acceptedBackgrounds')}
              {...fieldProps('acceptedBackgrounds', t('profile.acceptedBackgroundsHelp'))}
              name="acceptedBackgrounds"
              value={formData.acceptedBackgrounds}
              onChange={handleInputChange}
              maxLength={500}
              fullWidth
            />
          )}
          <TextArea
            label={t(`profile.otherPartyPreferences.${role}`)}
            name="otherPartyPreferences"
            {...fieldProps('otherPartyPreferences')}
            value={formData.otherPartyPreferences}
            onChange={handleInputChange}
            maxLength={2000}
            rows={2}
            fullWidth
          />
        </FormSection>

        <FormSection title={t('profile.contacts')} description={t('profile.contactsHelp')}>
          <ContactsField value={formData.contacts} onChange={(contacts) => update('contacts', contacts)} />
        </FormSection>

        <FormSection title={t('profile.additionalInfo')}>
          <TextArea
            aria-label={t('profile.additionalInfo')}
            name="additionalInfo"
            {...fieldProps('additionalInfo')}
            value={formData.additionalInfo}
            onChange={handleInputChange}
            maxLength={MAX_TEXT}
            rows={3}
            fullWidth
          />
        </FormSection>

        <FormSection title={t('profile.sections.consent')}>
          <p className="text-sm text-neutral-600">
            {t('profile.consent.summary')}{' '}
            <Link
              to="/privacy"
              target="_blank"
              className="font-medium text-primary-700 underline underline-offset-2"
            >
              {t('profile.consent.readTerms')}
            </Link>
          </p>
          {!termsAlreadyAccepted && (
            <div className="flex flex-col gap-1">
              {profileExists && <p className="text-sm text-warning-dark">{t('profile.consent.termsChanged')}</p>}
              <Checkbox
                label={t('profile.consent.acceptTerms')}
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                required
              />
            </div>
          )}
          <ApiErrorAlert error={consents.error} fallback={t('profile.errors.loadConsents')} />
          {consents.documents.RESEARCH && (
            <div className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4">
              <h3 className="font-medium">{consents.documents.RESEARCH.title}</h3>
              <ConsentText body={consents.documents.RESEARCH.body} />
            </div>
          )}
          <Checkbox
            label={t('profile.consent.researchAgree')}
            name="researchConsent"
            checked={formData.researchConsent}
            onChange={handleInputChange}
            disabled={!consents.documents.RESEARCH}
          />
        </FormSection>

        {error && (
          <p role="alert" className="rounded-lg border border-error-main/40 bg-error-light p-4 text-sm text-error-dark">
            {t(error)}
          </p>
        )}
        <ApiErrorAlert
          error={apiError?.error}
          fallback={apiError ? t(apiError.fallbackKey) : ''}
          inlineFields={INLINE_FIELDS}
        />

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
