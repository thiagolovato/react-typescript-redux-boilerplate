import { useEffect, useState } from 'react';
import { Checkbox } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { referenceDataService } from '../../service/request/api';
import type { InterestGroup } from '../../types/profile';

interface InterestAreaPickerProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

/** Interest areas grouped as in the core seed. Each group folds open to keep the form short. */
export function InterestAreaPicker({ value, onChange }: InterestAreaPickerProps) {
  const { t } = useI18n();
  const [groups, setGroups] = useState<InterestGroup[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    referenceDataService.getInterestGroups().then(setGroups).catch(() => setFailed(true));
  }, []);

  const toggle = (id: number, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((selected) => selected !== id));

  if (failed) {
    return <p role="alert" className="text-sm text-error-dark">{t('profile.errors.loadInterestAreas')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => {
        const selected = group.areas.filter((area) => value.includes(area.id)).length;
        return (
          <details key={group.id} className="rounded-lg border border-neutral-200 bg-neutral-50 open:bg-white">
            <summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3 font-medium">
              {group.name}
              {selected > 0 && (
                <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-sm text-primary-700">
                  {t('profile.selectedCount', { count: selected })}
                </span>
              )}
            </summary>
            <div className="grid gap-3 px-4 pt-1 pb-4 sm:grid-cols-2">
              {group.areas.map((area) => (
                <Checkbox
                  key={area.id}
                  label={area.name}
                  checked={value.includes(area.id)}
                  onChange={(e) => toggle(area.id, e.target.checked)}
                />
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}
