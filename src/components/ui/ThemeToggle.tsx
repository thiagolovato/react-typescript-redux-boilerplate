import { useId, type ReactNode } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { ThemePreference, useTheme } from '../../hooks/useTheme';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';

interface ThemeToggleProps {
  className?: string;
}

const OPTIONS: { value: ThemePreference; icon: ReactNode }[] = [
  { value: 'system', icon: <MonitorIcon /> },
  { value: 'light', icon: <SunIcon /> },
  { value: 'dark', icon: <MoonIcon /> },
];

// Native radios: arrow keys move between options, and each option keeps its text name for screen readers.
export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { t } = useI18n();
  const { preference, setPreference } = useTheme();
  // Each toggle on the page is its own radio group.
  const name = useId();

  return (
    <div
      role="radiogroup"
      aria-label={t('theme.label')}
      className={`inline-flex h-9 shrink-0 rounded-md border border-neutral-300 bg-surface p-0.5 ${className}`}
    >
      {OPTIONS.map(({ value, icon }) => (
        <label
          key={value}
          title={t(`theme.${value}`)}
          className="relative flex w-8 cursor-pointer items-center justify-center rounded text-neutral-600 hover:text-neutral-900
            has-[:checked]:bg-primary-100 has-[:checked]:text-primary-700
            has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500"
        >
          <input
            type="radio"
            name={name}
            value={value}
            checked={preference === value}
            onChange={() => setPreference(value)}
            aria-label={t(`theme.${value}`)}
            className="absolute inset-0 cursor-pointer appearance-none rounded opacity-0"
          />
          {icon}
        </label>
      ))}
    </div>
  );
}
