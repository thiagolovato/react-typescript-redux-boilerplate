import { Language, useI18n } from '../../hooks/useI18n';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { t, currentLanguage, changeLanguage, languages } = useI18n();

  return (
    <label className={`inline-flex ${className}`}>
      <span className="sr-only">{t('common.language')}</span>
      <select
        value={currentLanguage}
        onChange={(e) => changeLanguage(e.target.value as Language)}
        className="h-9 rounded-md border border-neutral-300 bg-white px-2 text-sm font-medium text-neutral-800
          shadow-sm"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.flag} {language.name}
          </option>
        ))}
      </select>
    </label>
  );
}
