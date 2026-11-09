export type FieldVariant = 'default' | 'success' | 'warning' | 'error';

export const fieldVariantClasses: Record<FieldVariant, string> = {
  default: 'border-neutral-300 bg-white hover:border-neutral-400 ' +
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
