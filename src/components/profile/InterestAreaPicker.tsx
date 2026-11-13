import { Checkbox } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { useInterestGroups } from '../../hooks/useInterestGroups';

interface InterestAreaPickerProps {
  value: number[];
  onChange: (ids: number[]) => void;
}

/**
 * Interest areas grouped as in the core catalog. Each group folds open to keep the form short. An area that left
 * the catalog shows only while it is still selected, so the person can keep or drop it but not pick it anew.
 */
export function InterestAreaPicker({ value, onChange }: InterestAreaPickerProps) {
  const { t } = useI18n();
  const { groups, failed } = useInterestGroups();

  const toggle = (id: number, checked: boolean) =>
    onChange(checked ? [...value, id] : value.filter((selected) => selected !== id));

  if (failed) {
    return <p role="alert" className="text-sm text-error-dark">{t('profile.errors.loadInterestAreas')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => {
        const shown = group.areas.filter((area) => area.offered || value.includes(area.id));
        if (shown.length === 0) return null;
        const selected = shown.filter((area) => value.includes(area.id)).length;
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
              {shown.map((area) => (
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
