import { useMemo } from 'react';
import { Select } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { COUNTRY_CODES } from '../../constants/countries';

interface CountrySelectProps {
  label: string;
  /** ISO 3166-1 alpha-2 code, or empty. */
  value: string;
  onChange: (code: string) => void;
}

/** Fixed list of countries, named and sorted in the UI language. */
export function CountrySelect({ label, value, onChange }: CountrySelectProps) {
  const { t, currentLanguage } = useI18n();

  const options = useMemo(() => {
    const names = new Intl.DisplayNames([currentLanguage], { type: 'region' });
    return COUNTRY_CODES
        .map((code) => ({ code, name: names.of(code) ?? code }))
        .sort((a, b) => a.name.localeCompare(b.name, currentLanguage));
  }, [currentLanguage]);

  return (
    <Select label={label} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="country" required>
      <option value="" disabled>{t('profile.select')}</option>
      {options.map((option) => <option key={option.code} value={option.code}>{option.name}</option>)}
    </Select>
  );
}
