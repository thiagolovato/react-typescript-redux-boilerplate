import { expect, test, type Page } from '@playwright/test';
import { registerParticipant, type Role } from '../support/api';
import { ADULT_AGE, birthDateForAge } from '../support/dates';
import { DEFAULT_PASSWORD } from '../support/env';
import {
  en,
  expectAlert,
  expectOnDashboard,
  loginViaParticipantPage,
  PROFILE_PATH,
  translate,
  urlEndsWith,
} from '../support/ui';

// Profile form by role, with consent. REGRAS_DE_NEGOCIO.md sections 3 and 4.
const profileText = en.profile;

const FILLED = {
  name: 'E2E Person',
  city: 'Small Village',
  graduationYear: '2015',
  gender: 'WOMAN',
  country: 'BR',
  contactPreference: 'VIDEO_CALL',
};

/** Text inputs by accessible name. Their label text also holds the required mark, so getByLabel(exact) misses. */
const textboxByName = (page: Page, name: string) => page.getByRole('textbox', { name, exact: true });

/** The research consent checkbox. The research text in force shows above it. */
const researchCheckbox = (page: Page) => page.getByLabel(profileText.consent.researchAgree);

/** The mentee's "mentor genders you accept" checkbox group. */
const preferredMentorGenders = (page: Page) =>
  page.getByRole('group', { name: profileText.preferredMentorGenders });

/** One gender of the group above, by its gender option (WOMAN, NON_BINARY...). */
const preferredMentorGender = (page: Page, gender: keyof typeof profileText.genders) =>
  preferredMentorGenders(page).getByLabel(profileText.genders[gender], { exact: true });

// A mentee in the tests accepts these mentor genders (3.10).
const ACCEPTED_MENTOR_GENDERS = ['WOMAN', 'NON_BINARY'] as const;

const clickSave = (page: Page) => page.getByRole('button', { name: en.common.save }).click();

const removeLanguageButton = (page: Page, language: string) =>
  page.getByRole('button', { name: translate(profileText.removeLanguage, { language }) });

/** Signs up a participant through the API, logs in and opens the profile from the dashboard. */
async function signUpAndOpenProfile(page: Page, role: Role) {
  const { email } = await registerParticipant(page.request, role);
  await loginViaParticipantPage(page, email, DEFAULT_PASSWORD);
  await expectOnDashboard(page);
  await page.getByRole('button', { name: en.dashboard.myProfileButton }).click();
  await expect(page.getByRole('heading', { name: profileText.title })).toBeVisible();
}

/** Fills every required field except the languages and interest areas lists, which have their own checks. */
async function fillRequiredFieldsExceptLists(page: Page, role: Role) {
  await textboxByName(page, profileText.name).fill(FILLED.name);
  await page.getByLabel(profileText.birthDate).fill(birthDateForAge(ADULT_AGE));
  await page.getByLabel(profileText.gender, { exact: true }).selectOption(FILLED.gender);
  await page.getByLabel(profileText.country).selectOption(FILLED.country);
  await textboxByName(page, profileText.city).fill(FILLED.city);
  await textboxByName(page, profileText.profession[role]).fill(role === 'MENTOR' ? 'Doctor' : 'Medicine');
  await page.getByLabel(profileText.graduationYear[role]).fill(FILLED.graduationYear);
  await textboxByName(page, profileText.academicBackground).fill('Medical school');
  await textboxByName(page, profileText.motivation[role]).fill('Rural health matters');
  await textboxByName(page, profileText.expectations[role]).fill('Commitment');
  await textboxByName(page, profileText.goals[role]).fill('Share and learn');
  await page.getByLabel(profileText.contactPreference[role]).selectOption(FILLED.contactPreference);
}

/** Types a language name in the picker and waits until it shows in the list. */
async function addLanguage(page: Page, language: string) {
  await page.getByLabel(profileText.addLanguage).fill(language);
  await expect(removeLanguageButton(page, language)).toBeVisible();
}

/** Opens the first interest group, checks its first area and returns the area name. */
async function checkFirstInterestArea(page: Page): Promise<string> {
  const group = page.locator('details').first();
  await group.locator('summary').click();
  await group.getByRole('checkbox').first().check();
  return (await group.locator('label').first().innerText()).trim();
}

test.describe('profile form', () => {
  test('mentee form shows mentee fields only (3.7)', async ({ page }) => {
    await signUpAndOpenProfile(page, 'MENTEE');
    await expect(page.getByText(profileText.intro.MENTEE)).toBeVisible();
    await expect(preferredMentorGenders(page)).toBeVisible();
    await expect(page.getByLabel(profileText.hasMentorshipExperience)).toHaveCount(0);
    await expect(page.getByLabel(profileText.hasMentorshipTraining)).toHaveCount(0);
    await expect(page.getByLabel(profileText.acceptedBackgrounds)).toHaveCount(0);
  });

  test('mentor form shows mentor fields only (3.7)', async ({ page }) => {
    await signUpAndOpenProfile(page, 'MENTOR');
    await expect(page.getByText(profileText.intro.MENTOR)).toBeVisible();
    await expect(page.getByLabel(profileText.hasMentorshipExperience)).toBeVisible();
    await expect(page.getByLabel(profileText.hasMentorshipTraining)).toBeVisible();
    await expect(page.getByLabel(profileText.acceptedBackgrounds)).toBeVisible();
    await expect(preferredMentorGenders(page)).toHaveCount(0);
  });

  test('mentee needs a language, an interest area and the terms; then saves and sees it again (3.2, 3.10, 4.1)', async ({ page }) => {
    await signUpAndOpenProfile(page, 'MENTEE');
    await fillRequiredFieldsExceptLists(page, 'MENTEE');
    for (const gender of ACCEPTED_MENTOR_GENDERS) {
      await preferredMentorGender(page, gender).check();
    }
    await page.getByLabel(profileText.consent.acceptTerms).check();

    await clickSave(page);
    await expectAlert(page, profileText.errors.languagesRequired);

    await addLanguage(page, 'English');
    await addLanguage(page, 'Portuguese');
    await clickSave(page);
    await expectAlert(page, profileText.errors.interestAreasRequired);

    const area = await checkFirstInterestArea(page);
    await clickSave(page);
    await expectOnDashboard(page);

    // Saved values come back, and the terms already accepted are not asked again.
    await page.goto(PROFILE_PATH);
    await expect(textboxByName(page, profileText.name)).toHaveValue(FILLED.name);
    await expect(textboxByName(page, profileText.city)).toHaveValue(FILLED.city);
    for (const gender of ACCEPTED_MENTOR_GENDERS) {
      await expect(preferredMentorGender(page, gender)).toBeChecked();
    }
    await expect(preferredMentorGender(page, 'MAN')).not.toBeChecked();
    await expect(removeLanguageButton(page, 'English')).toBeVisible();
    await expect(page.getByLabel(area)).toBeChecked();
    await expect(page.getByLabel(profileText.consent.acceptTerms)).toHaveCount(0);
    await expect(researchCheckbox(page)).not.toBeChecked();
  });

  test('mentor saves with research consent and edits the profile later (3.2, 4.3)', async ({ page }) => {
    await signUpAndOpenProfile(page, 'MENTOR');
    await fillRequiredFieldsExceptLists(page, 'MENTOR');
    await page.getByLabel(profileText.hasMentorshipExperience).check();
    await addLanguage(page, 'Spanish');
    await checkFirstInterestArea(page);
    await page.getByLabel(profileText.consent.acceptTerms).check();
    await researchCheckbox(page).check();
    await clickSave(page);
    await expectOnDashboard(page);

    await page.goto(PROFILE_PATH);
    await expect(page.getByLabel(profileText.hasMentorshipExperience)).toBeChecked();
    await expect(researchCheckbox(page)).toBeChecked();
    const newProfession = 'Surgeon';
    await textboxByName(page, profileText.profession.MENTOR).fill(newProfession);
    await clickSave(page);
    await expectOnDashboard(page);

    await page.goto(PROFILE_PATH);
    await expect(textboxByName(page, profileText.profession.MENTOR)).toHaveValue(newProfession);
  });

  test('professional link must be an http or https link (3.5)', async ({ page }) => {
    await signUpAndOpenProfile(page, 'MENTEE');
    await fillRequiredFieldsExceptLists(page, 'MENTEE');
    await addLanguage(page, 'English');
    await checkFirstInterestArea(page);
    await page.getByLabel(profileText.consent.acceptTerms).check();

    const link = page.getByLabel(profileText.professionalLink, { exact: true });
    await link.fill('ftp://example.org');
    await clickSave(page);
    // The browser blocks the save first, with the same rule as the server.
    expect(await link.evaluate((input) => (input as HTMLInputElement).validity.valid)).toBe(false);
    await expect(page).toHaveURL(urlEndsWith(PROFILE_PATH));

    await link.fill('https://example.org/me');
    await clickSave(page);
    await expectOnDashboard(page);
  });

  test('cancel goes back to the dashboard without saving', async ({ page }) => {
    await signUpAndOpenProfile(page, 'MENTOR');
    await textboxByName(page, profileText.name).fill('Not saved');
    await page.getByRole('button', { name: en.common.cancel }).click();
    await expectOnDashboard(page);
    await page.goto(PROFILE_PATH);
    await expect(textboxByName(page, profileText.name)).toHaveValue('');
  });
});
