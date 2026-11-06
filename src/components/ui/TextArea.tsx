import React, { useId } from 'react';
import { fieldVariantClasses, helperVariantClasses, type FieldVariant } from './fieldStyles';

interface TextAreaProps extends React.ComponentProps<'textarea'> {
  variant?: FieldVariant;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  fullWidth?: boolean;
}

export function TextArea({
  variant = 'default',
  label,
  helperText,
  isRequired = false,
  fullWidth = false,
  disabled,
  id,
  className = '',
  ...props
}: TextAreaProps) {
  const generatedId = useId();
  const textAreaId = id ?? generatedId;
  const helperId = `${textAreaId}-helper`;

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={textAreaId} className="text-sm leading-tight font-medium">
          {label}
          {isRequired && <span aria-hidden="true" className="text-error-main"> *</span>}
        </label>
      )}

      <div
        className={`flex rounded-lg border text-neutral-900 ring-3 ring-transparent transition-colors
          ${disabled ? 'cursor-not-allowed border-neutral-300 bg-neutral-100' : fieldVariantClasses[variant]}`}
      >
        <textarea
          id={textAreaId}
          disabled={disabled}
          required={isRequired || props.required}
          aria-invalid={variant === 'error' || undefined}
          aria-describedby={helperText ? helperId : undefined}
          className={`min-h-25 flex-1 resize-y bg-transparent p-3 text-base outline-none placeholder:text-neutral-400
            disabled:cursor-not-allowed disabled:text-neutral-400 ${className}`}
          {...props}
        />
      </div>

      {helperText && (
        <span id={helperId} className={`text-sm leading-tight ${helperVariantClasses[variant]}`}>
          {helperText}
        </span>
      )}
    </div>
  );
}
