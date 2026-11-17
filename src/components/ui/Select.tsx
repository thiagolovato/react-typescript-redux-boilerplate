import React, { useId } from 'react';
import { fieldVariantClasses } from './fieldStyles';
import { ChevronDownIcon } from './icons';

interface SelectProps extends React.ComponentProps<'select'> {
  label: string;
}

export function Select({ label, id, className = '', children, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={selectId} className="text-sm leading-tight font-medium">{label}</label>
      {/* The browser's own arrow is hidden (it sits against the edge); this one keeps the text's inset. */}
      <div className="relative">
        <select
          id={selectId}
          className={`h-10 w-full cursor-pointer appearance-none rounded-lg border pr-11 pl-4 text-base text-neutral-900
            ring-3 ring-transparent outline-none transition-colors ${fieldVariantClasses.default} ${className}`}
          {...props}
        >
          {children}
        </select>
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-neutral-600">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}
