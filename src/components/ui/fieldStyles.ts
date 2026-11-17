export type FieldVariant = 'default' | 'success' | 'warning' | 'error';

export const fieldVariantClasses: Record<FieldVariant, string> = {
  default: 'border-neutral-300 bg-surface hover:border-neutral-400 ' +
    'focus-within:border-primary-500 focus-within:ring-primary-100',
  success: 'border-success-main bg-success-light focus-within:border-success-dark focus-within:ring-success-main/25',
  warning: 'border-warning-main bg-warning-light focus-within:border-warning-dark focus-within:ring-warning-main/25',
  error: 'border-error-main bg-error-light focus-within:border-error-dark focus-within:ring-error-main/25',
};

export const helperVariantClasses: Record<FieldVariant, string> = {
  default: 'text-neutral-600',
  success: 'text-success-dark',
  warning: 'text-warning-dark',
  error: 'text-error-dark',
};

// The compact selects in page corners and the sidebar: language and theme.
// The browser's own arrow is hidden (it sits against the edge); LanguageToggle draws one with the same inset as the text.
export const toggleSelectClasses = 'h-9 w-full cursor-pointer appearance-none rounded-md border border-neutral-300 ' +
  'bg-surface pl-3 pr-8 text-sm text-neutral-800 hover:border-neutral-400';
