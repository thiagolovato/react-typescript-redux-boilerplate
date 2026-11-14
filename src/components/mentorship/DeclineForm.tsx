import { useState } from 'react';
import { Button, TextArea } from '../ui';
import { useI18n } from '../../hooks/useI18n';
import { MAX_DECLINE_REASON } from '../../constants/mentorship';

interface DeclineFormProps {
  /** Gets the reason trimmed, empty when none was given. */
  onSubmit: (reason: string) => void;
  onCancel: () => void;
  /** The decline is being sent. */
  declining: boolean;
  submitLabel: string;
}

/** Asks for an optional reason, which only the coordination sees, before declining. */
export function DeclineForm({ onSubmit, onCancel, declining, submitLabel }: DeclineFormProps) {
  const { t } = useI18n();
  const [reason, setReason] = useState('');

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(reason.trim());
      }}
    >
      <TextArea
        label={t('mentorship.declineReasonLabel')}
        helperText={t('mentorship.declineReasonHelp')}
        value={reason}
        maxLength={MAX_DECLINE_REASON}
        rows={3}
        fullWidth
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="error" isLoading={declining}>{submitLabel}</Button>
        <Button type="button" variant="ghost" disabled={declining} onClick={onCancel}>{t('common.cancel')}</Button>
      </div>
    </form>
  );
}
