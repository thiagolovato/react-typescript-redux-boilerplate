import { useI18n } from '../../hooks/useI18n';
import { ThemePreference, useTheme } from '../../hooks/useTheme';
import { toggleSelectClasses } from './fieldStyles';

interface ThemeToggleProps {
  className?: string;
}

const preferences: ThemePreference[] = ['system', 'light', 'dark'];

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { t } = useI18n();
  const { preference, setPreference } = useTheme();

  return (
    <label className={`inline-flex ${className}`}>
      <span className="sr-only">{t('theme.label')}</span>
      <select
        value={preference}
        onChange={(e) => setPreference(e.target.value as ThemePreference)}
        className={toggleSelectClasses}
      >
        {preferences.map((option) => (
          <option key={option} value={option}>
            {t(`theme.${option}`)}
          </option>
        ))}
      </select>
    </label>
  );
}
