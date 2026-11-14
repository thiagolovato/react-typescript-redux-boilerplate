import React from 'react';
import { Bird } from './Bird';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-fill-primary text-white hover:bg-fill-primary-hover active:bg-fill-primary-active',
  secondary: 'border-transparent bg-fill-secondary text-white hover:bg-fill-secondary-hover ' +
    'active:bg-fill-secondary-active',
  outline: 'border-neutral-300 bg-surface text-neutral-800 hover:border-primary-400 hover:text-primary-700 ' +
    'active:bg-primary-50',
  ghost: 'border-transparent bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 ' +
    'active:bg-neutral-200',
  success: 'border-transparent bg-fill-success text-white hover:bg-fill-success-hover',
  warning: 'border-transparent bg-fill-warning text-white hover:brightness-90',
  error: 'border-transparent bg-fill-error text-white hover:brightness-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-md px-3 text-sm',
  md: 'h-10 rounded-lg px-4 text-sm',
  lg: 'h-12 rounded-lg px-6 text-base',
  xl: 'h-14 rounded-xl px-8 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`inline-flex items-center justify-center gap-2 border font-medium
        whitespace-nowrap transition-colors disabled:cursor-not-allowed
        ${isLoading ? '' : 'disabled:opacity-60'} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        // A bird doing a loop: it starts upright at the bottom and turns with the circle, counterclockwise, so it
        // points up on the right, flies upside down on top and points down on the left. The mentee bird by default;
        // the mentor bird on the green buttons (secondary, success), where green on green would fade.
        <span aria-hidden="true" className="bird-loop relative size-6 shrink-0">
          <Bird
            role={variant === 'secondary' || variant === 'success' ? 'MENTOR' : 'MENTEE'}
            flapping
            className="absolute bottom-0 left-1/2 w-4 -translate-x-1/2"
          />
        </span>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
