import React from 'react';

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
  primary: 'border-transparent bg-primary-bold text-white shadow-primary-bold hover:brightness-110',
  secondary: 'border-transparent bg-secondary-bold text-white shadow-secondary-bold hover:brightness-110',
  outline: 'border-primary-300 bg-white text-primary-600 hover:border-primary-400 hover:bg-primary-50 ' +
    'hover:text-primary-700 active:bg-primary-100',
  ghost: 'border-transparent bg-transparent text-primary-600 hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100',
  success: 'border-transparent bg-success-main text-white hover:bg-success-dark',
  warning: 'border-transparent bg-warning-main text-white hover:bg-warning-dark',
  error: 'border-transparent bg-error-main text-white hover:bg-error-dark',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-md px-3 text-sm',
  md: 'h-10 rounded-lg px-4 text-base',
  lg: 'h-12 rounded-xl px-6 text-lg',
  xl: 'h-14 rounded-2xl px-8 text-xl',
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
        whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-60
        ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
