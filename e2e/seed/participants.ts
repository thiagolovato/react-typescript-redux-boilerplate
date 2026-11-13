import { ADULT_AGE, birthDateForAge } from '../support/dates';
import { MIN_AGE } from '../support/rules';
import type { Role } from '../support/api';

// Accounts the dev seed creates. A domain of their own: the end-to-end cleanup deletes only @e2e.test,
// so seeded people survive test runs. Same password for all of them.
export const SEED_EMAIL_DOMAIN = 'seed.test';
export const SEED_PASSWORD = 'password123';

// Core language codes of the consent texts (CORE_LANGUAGE_BY_UI_LANGUAGE values).
const PORTUGUESE_TEXTS = 'pt_BR';
const ENGLISH_TEXTS = 'en_US';

const SENIOR_AGE = 68;
const MENTOR_GRADUATION_YEAR = 2008;
const SENIOR_GRADUATION_YEAR = 1981;
const RECENT_GRADUATION_YEAR = 2019;
const YEARS_UNTIL_STUDENT_GRADUATES = 4;
const STUDENT_GRADUATION_YEAR = new Date().getFullYear() + YEARS_UNTIL_STUDENT_GRADUATES;

/** One seeded person. `profile` holds the fields that differ from the base profile; none means sign-up only. */
export interface SeedParticipant {
  /** Local part of the e-mail, before @seed.test. */
  handle: string;
  role: Role;
  /** What this person is for, printed in the summary. */
  scenario: string;
  profile?: {
    /** Positions in the list of every interest area, so pairs can share areas. */
    interestAreaIndexes: number[];
    /** Language the person read the consent texts in. */
    consentLanguage: string;
    researchConsent: boolean;
    /** After the first save, change the research answer once, so the history has two research rows. */
    changeResearchAfterwards?: boolean;
    fields: Record<string, unknown>;
  };
}

const phone = (number: string) => ({ contactType: 'PHONE', contactValue: number, isPreferentialContact: true });
const email = (address: string, preferred = false) =>
  ({ contactType: 'EMAIL', contactValue: address, isPreferentialContact: preferred });

export const SEED_PARTICIPANTS: SeedParticipant[] = [
  {
    handle: 'mentor.ana',
    role: 'MENTOR',
    scenario: 'Experienced and trained mentor, research yes, read the texts in Portuguese. Same city as mentee.bia.',
    profile: {
      interestAreaIndexes: [0, 1, 2],
      consentLanguage: PORTUGUESE_TEXTS,
      researchConsent: true,
      fields: {
        name: 'Ana Souza',
        gender: 'WOMAN',
        languages: ['pt', 'en'],
        profession: 'Family doctor',
        graduationYear: MENTOR_GRADUATION_YEAR,
        academicBackground: 'Medicine, USP; residency in family medicine',
        professionalLink: 'https://www.linkedin.com/in/ana-souza-example',
        address: { city: 'Itapetininga', region: 'São Paulo', country: 'BR' },
        contacts: [phone('+55 15 99999-0001'), email('ana.souza@example.org')],
        hasRuralTraining: true,
        hasMentorshipExperience: true,
        hasMentorshipTraining: true,
        acceptedBackgrounds: 'Medicine and nursing students',
        contactPreference: 'VIDEO_CALL',
      },
    },
  },
  {
    handle: 'mentor.joao',
    role: 'MENTOR',
    scenario: 'First-time mentor without training, research no, read the texts in English. Lives in Portugal.',
    profile: {
      interestAreaIndexes: [3, 4],
      consentLanguage: ENGLISH_TEXTS,
      researchConsent: false,
      fields: {
        name: 'João Pereira',
        gender: 'MAN',
        languages: ['pt', 'es'],
        profession: 'Nurse',
        academicBackground: 'Nursing, University of Coimbra',
        address: { city: 'Bragança', region: 'Bragança', country: 'PT' },
        contacts: [email('joao.pereira@example.org', true)],
        hasRuralTraining: false,
        hasMentorshipExperience: false,
        hasMentorshipTraining: false,
        contactPreference: 'EMAIL',
      },
    },
  },
  {
    handle: 'mentor.sam',
    role: 'MENTOR',
    scenario: 'Mentor who describes their own gender, has no region and gave no contact.',
    profile: {
      interestAreaIndexes: [1, 5],
      consentLanguage: ENGLISH_TEXTS,
      researchConsent: true,
      fields: {
        name: 'Sam Rivera',
        gender: 'Non-binary femme',
        languages: ['es', 'en'],
        profession: 'Physiotherapist',
        academicBackground: 'Physiotherapy, Universidad de Buenos Aires',
        address: { city: 'Tilcara', region: '', country: 'AR' },
        contacts: [],
        contactPreference: 'MESSAGING',
      },
    },
  },
  {
    handle: 'mentor.helena',
    role: 'MENTOR',
    scenario: 'Senior mentor, said yes to research and then changed to no (two research rows in the history).',
    profile: {
      interestAreaIndexes: [0, 6],
      consentLanguage: PORTUGUESE_TEXTS,
      researchConsent: true,
      changeResearchAfterwards: true,
      fields: {
        name: 'Helena Lima',
        birthDate: birthDateForAge(SENIOR_AGE),
        gender: 'WOMAN',
        languages: ['pt'],
        profession: 'Paediatrician',
        graduationYear: SENIOR_GRADUATION_YEAR,
        academicBackground: 'Medicine, UFMG; paediatrics',
        address: { city: 'Diamantina', region: 'Minas Gerais', country: 'BR' },
        contacts: [phone('+55 38 99999-0004')],
        hasMentorshipExperience: true,
        contactPreference: 'PHONE_CALL',
      },
    },
  },
  {
    handle: 'mentor.no-profile',
    role: 'MENTOR',
    scenario: 'Mentor who signed up and never filled in the profile.',
  },
  {
    handle: 'mentee.bia',
    role: 'MENTEE',
    scenario: 'Mentee asking for a woman mentor, same city as mentor.ana, research yes.',
    profile: {
      interestAreaIndexes: [0, 2],
      consentLanguage: PORTUGUESE_TEXTS,
      researchConsent: true,
      fields: {
        name: 'Beatriz Alves',
        gender: 'WOMAN',
        languages: ['pt'],
        profession: 'Family medicine',
        graduationYear: STUDENT_GRADUATION_YEAR,
        academicBackground: 'Medicine student, UNESP',
        address: { city: 'Itapetininga', region: 'São Paulo', country: 'BR' },
        contacts: [phone('+55 15 99999-1001')],
        hasRuralTraining: true,
        preferredMentorGenders: ['WOMAN'],
        contactPreference: 'VIDEO_CALL',
      },
    },
  },
  {
    handle: 'mentee.caio',
    role: 'MENTEE',
    scenario: 'Youngest allowed mentee (16), no mentor gender preference, research no.',
    profile: {
      interestAreaIndexes: [3],
      consentLanguage: PORTUGUESE_TEXTS,
      researchConsent: false,
      fields: {
        name: 'Caio Santos',
        birthDate: birthDateForAge(MIN_AGE),
        gender: 'MAN',
        languages: ['pt'],
        profession: 'Nursing',
        graduationYear: STUDENT_GRADUATION_YEAR,
        academicBackground: 'Technical nursing course',
        address: { city: 'Picos', region: 'Piauí', country: 'BR' },
        contacts: [email('caio.santos@example.org', true)],
        preferredMentorGenders: [],
        contactPreference: 'MESSAGING',
      },
    },
  },
  {
    handle: 'mentee.amina',
    role: 'MENTEE',
    scenario: 'Mentee abroad who read the texts in English and speaks Portuguese and English.',
    profile: {
      interestAreaIndexes: [1, 4],
      consentLanguage: ENGLISH_TEXTS,
      researchConsent: true,
      fields: {
        name: 'Amina Machava',
        gender: 'WOMAN',
        languages: ['pt', 'en'],
        profession: 'Public health',
        graduationYear: STUDENT_GRADUATION_YEAR,
        academicBackground: 'Medicine student, Universidade Eduardo Mondlane',
        address: { city: 'Chimoio', region: 'Manica', country: 'MZ' },
        contacts: [phone('+258 84 000 0001'), email('amina.machava@example.org')],
        hasRuralTraining: true,
        otherPartyPreferences: 'Someone who has worked in remote areas',
        contactPreference: 'NO_PREFERENCE',
      },
    },
  },
  {
    handle: 'mentee.lu',
    role: 'MENTEE',
    scenario: 'Graduated mentee (adult, past graduation year) accepting non-binary, genderqueer or agender mentors.',
    profile: {
      interestAreaIndexes: [5],
      consentLanguage: ENGLISH_TEXTS,
      researchConsent: false,
      fields: {
        name: 'Lu Nakamura',
        birthDate: birthDateForAge(ADULT_AGE),
        gender: 'NON_BINARY',
        languages: ['pt', 'ja'],
        profession: 'Physiotherapy',
        graduationYear: RECENT_GRADUATION_YEAR,
        academicBackground: 'Physiotherapy, UFPR',
        address: { city: 'Registro', region: 'São Paulo', country: 'BR' },
        preferredMentorGenders: ['NON_BINARY', 'GENDERQUEER', 'AGENDER'],
        contactPreference: 'EMAIL',
      },
    },
  },
  {
    handle: 'mentee.no-profile',
    role: 'MENTEE',
    scenario: 'Mentee who signed up and never filled in the profile.',
  },
];
