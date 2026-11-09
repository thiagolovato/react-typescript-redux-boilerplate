import React, { useId } from 'react';
import { fieldVariantClasses } from './fieldStyles';

interface SelectProps extends React.ComponentProps<'select'> {
  label: string;
}

export function Select({ label, id, className = '', children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm leading-tight font-medium">{label}</label>
      <select
        id={selectId}
        className={`h-10 rounded-lg border px-3 text-base text-neutral-900 ring-3 ring-transparent outline-none
          transition-colors ${fieldVariantClasses.default} ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}
