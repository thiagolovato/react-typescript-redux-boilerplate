import React, { useId } from 'react';
import { fieldVariantClasses, helperVariantClasses, type FieldVariant } from './fieldStyles';

type InputSize = 'sm' | 'md' | 'lg';

interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'> {
  size?: InputSize;
  variant?: FieldVariant;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  fullWidth?: boolean;
}

const sizeClasses: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-5 text-lg',
};

export function Input({
  size = 'md',
  variant = 'default',
  leftIcon,
  rightIcon,
  label,
  helperText,
  isRequired = false,
  fullWidth = false,
  disabled,
  id,
  className = '',
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;

  return (
    <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm leading-tight font-medium">
          {label}
          {isRequired && <span aria-hidden="true" className="text-error-main"> *</span>}
        </label>
      )}

      <div
        className={`flex items-center gap-2 rounded-lg border text-neutral-900 ring-3 ring-transparent
          transition-colors ${sizeClasses[size]}
          ${disabled ? 'cursor-not-allowed border-neutral-300 bg-neutral-100' : fieldVariantClasses[variant]}`}
      >
        {leftIcon && <span className="flex text-neutral-500">{leftIcon}</span>}
        <input
          id={inputId}
          disabled={disabled}
          required={isRequired || props.required}
          aria-invalid={variant === 'error' || undefined}
          aria-describedby={helperText ? helperId : undefined}
          className={`h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-400
            disabled:cursor-not-allowed disabled:text-neutral-400 ${className}`}
          {...props}
        />
        {rightIcon && <span className="flex text-neutral-500">{rightIcon}</span>}
      </div>

      {helperText && (
        <span id={helperId} className={`text-sm leading-tight ${helperVariantClasses[variant]}`}>
          {helperText}
        </span>
      )}
    </div>
  );
}
