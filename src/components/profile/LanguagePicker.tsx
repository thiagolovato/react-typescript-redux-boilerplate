import { useId, useMemo, useState } from 'react';
import { Button, Input, TrashIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { COMMON_LANGUAGE_CODES } from '../../constants/profileOptions';

interface LanguagePickerProps {
  value: string[];
  onChange: (codes: string[]) => void;
}

/** Searchable list of languages. Picking one adds it; the trash button removes it. */
export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  const { t, currentLanguage } = useI18n();
  const listId = useId();
  const [query, setQuery] = useState('');

  const nameOf = useMemo(() => {
    const names = new Intl.DisplayNames([currentLanguage], { type: 'language' });
    // DB codes use "_" (pt_BR); Intl expects BCP 47 tags (pt-BR).
    return (code: string) => names.of(code.replace('_', '-')) ?? code;
  }, [currentLanguage]);

  const options = useMemo(
      () => COMMON_LANGUAGE_CODES
          .filter((code) => !value.includes(code))
          .map((code) => ({ code, name: nameOf(code) }))
          .sort((a, b) => a.name.localeCompare(b.name, currentLanguage)),
      [value, nameOf, currentLanguage],
  );

  const handleQueryChange = (text: string) => {
    const match = options.find((option) => option.name.toLowerCase() === text.trim().toLowerCase());
    if (match) {
      onChange([...value, match.code]);
      setQuery('');
    } else {
      setQuery(text);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-col gap-2">
          {value.map((code) => (
            <li
              key={code}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 py-1 pr-1 pl-4"
            >
              <span>{nameOf(code)}</span>
              <Button
                variant="ghost"
                size="sm"
                aria-label={t('profile.removeLanguage', { language: nameOf(code) })}
                title={t('common.remove')}
                onClick={() => onChange(value.filter((c) => c !== code))}
              >
                <TrashIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <Input
        label={t('profile.addLanguage')}
        placeholder={t('profile.searchLanguage')}
        list={listId}
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        autoComplete="off"
        fullWidth
      />
      <datalist id={listId}>
        {options.map((option) => <option key={option.code} value={option.name} />)}
      </datalist>
    </div>
  );
}
