import React from 'react';

interface CheckboxProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label?: string;
}

export function Checkbox({ label, className = '', disabled, ...props }: CheckboxProps) {
  return (
    <label
      className={`inline-flex items-center gap-2 text-sm select-none
        ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}
    >
      <input type="checkbox" disabled={disabled} className="size-5 shrink-0 accent-primary-500" {...props} />
      {label}
    </label>
  );
}
