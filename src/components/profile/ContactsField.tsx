import { Button, Checkbox, Input, PlusIcon, Select, TrashIcon } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import type { CustomerContact } from '../../types/profile';

interface ContactsFieldProps {
  value: CustomerContact[];
  onChange: (contacts: CustomerContact[]) => void;
}

const NEW_CONTACT: CustomerContact = { contactType: 'EMAIL', contactValue: '', isPreferentialContact: false };

/** Editable list of e-mails and phone numbers. */
export function ContactsField({ value, onChange }: ContactsFieldProps) {
  const { t } = useI18n();

  const update = (index: number, field: keyof CustomerContact, fieldValue: string | boolean) =>
    onChange(value.map((contact, i) => (i === index ? { ...contact, [field]: fieldValue } : contact)));

  const add = () => onChange([...value, NEW_CONTACT]);

  return (
    <>
      {value.map((contact, index) => (
        <fieldset
          key={index}
          className="grid items-end gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4
            sm:grid-cols-[10rem_1fr_auto]"
        >
          <legend className="sr-only">{`${t('profile.contacts')} ${index + 1}`}</legend>
          <Select
            label={t('profile.contactType')}
            value={contact.contactType}
            onChange={(e) => update(index, 'contactType', e.target.value)}
            required
          >
            <option value="EMAIL">{t('profile.contactTypes.EMAIL')}</option>
            <option value="PHONE">{t('profile.contactTypes.PHONE')}</option>
          </Select>
          <Input
            label={t('profile.contactValue')}
            value={contact.contactValue}
            onChange={(e) => update(index, 'contactValue', e.target.value)}
            maxLength={150}
            required
            fullWidth
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              aria-label={t('profile.removeContact', { index: index + 1 })}
              title={t('common.remove')}
              onClick={() => onChange(value.filter((_, i) => i !== index))}
            >
              <TrashIcon />
            </Button>
            {index === value.length - 1 && (
              <Button variant="outline" aria-label={t('profile.addContact')} title={t('profile.addContact')} onClick={add}>
                <PlusIcon />
              </Button>
            )}
          </div>
          <Checkbox
            label={t('profile.preferentialContact')}
            checked={contact.isPreferentialContact}
            onChange={(e) => update(index, 'isPreferentialContact', e.target.checked)}
            className="sm:col-span-3"
          />
        </fieldset>
      ))}
      {value.length === 0 && (
        <Button variant="outline" className="self-start" leftIcon={<PlusIcon />} onClick={add}>
          {t('profile.addContact')}
        </Button>
      )}
    </>
  );
}
