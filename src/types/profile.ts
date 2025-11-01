export interface Address {
  id?: number;
  city: string;
  region: string;
  country: string;
}

export interface CustomerContact {
  id?: number;
  contactType: 'PHONE' | 'EMAIL';
  contactValue: string;
  isPreferentialContact: boolean;
}

export interface CustomerLanguage {
  languageId: string;
  language?: {
    id: string;
    value: string;
  };
}

export interface CustomerInterestArea {
  id?: number;
  interestAreaId: number;
}

export interface Profile {
  id?: number;
  userId: number;
  name: string;
  age: number;
  gender: string;
  languages: CustomerLanguage[];
  profession: string;
  generation: string;
  contacts: CustomerContact[];
  address: Address;
  hasRuralTraining: boolean;
  expectations: string;
  interestAreas: CustomerInterestArea[];
  isGraduated: boolean;
  hasMentorshipTraining: boolean;
  hasMentorshipExperience: boolean;
}

export interface ProfileFormData extends Omit<Profile, 'id' | 'userId'> {}
