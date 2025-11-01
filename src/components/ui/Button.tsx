import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { tokens } from '../../constants/tokens';

// Button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'warning' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// Base button styles
const ButtonBase = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${tokens.spacing[2]};
  
  font-family: ${tokens.typography.fontFamily.sans};
  font-weight: ${tokens.typography.fontWeight.medium};
  line-height: ${tokens.typography.lineHeight.none};
  text-decoration: none;
  white-space: nowrap;
  
  border: 1px solid transparent;
  cursor: pointer;
  outline: none;
  
  transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  
  &:focus {
    outline: 2px solid ${tokens.colors.primary[400]};
    outline-offset: 2px;
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}
  
  /* Size variants */
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`
          height: ${tokens.component.button.height.sm};
          padding: ${tokens.component.button.padding.sm};
          font-size: ${tokens.typography.fontSize.sm};
          border-radius: ${tokens.borderRadius.md};
        `;
      case 'md':
        return css`
          height: ${tokens.component.button.height.md};
          padding: ${tokens.component.button.padding.md};
          font-size: ${tokens.typography.fontSize.base};
          border-radius: ${tokens.borderRadius.lg};
        `;
      case 'lg':
        return css`
          height: ${tokens.component.button.height.lg};
          padding: ${tokens.component.button.padding.lg};
          font-size: ${tokens.typography.fontSize.lg};
          border-radius: ${tokens.borderRadius.xl};
        `;
      case 'xl':
        return css`
          height: ${tokens.component.button.height.xl};
          padding: ${tokens.component.button.padding.xl};
          font-size: ${tokens.typography.fontSize.xl};
          border-radius: ${tokens.borderRadius['2xl']};
        `;
      default:
        return css`
          height: ${tokens.component.button.height.md};
          padding: ${tokens.component.button.padding.md};
          font-size: ${tokens.typography.fontSize.base};
          border-radius: ${tokens.borderRadius.lg};
        `;
    }
  }}
  
  /* Variant styles */
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${tokens.gradients.primaryBold};
          color: ${tokens.colors.neutral[0]};
          box-shadow: ${tokens.shadows.primaryBold};
          
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: ${tokens.shadows.lg};
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${tokens.shadows.md};
          }
        `;

      case 'secondary':
        return css`
          background: ${tokens.gradients.secondaryBold};
          color: ${tokens.colors.neutral[0]};
          box-shadow: ${tokens.shadows.secondaryBold};
          
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: ${tokens.shadows.lg};
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${tokens.shadows.md};
          }
        `;

      case 'outline':
        return css`
          background: ${tokens.colors.neutral[0]};
          color: ${tokens.colors.primary[600]};
          border-color: ${tokens.colors.primary[300]};
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.primary[50]};
            border-color: ${tokens.colors.primary[400]};
            color: ${tokens.colors.primary[700]};
          }
          
          &:active:not(:disabled) {
            background: ${tokens.colors.primary[100]};
          }
        `;

      case 'ghost':
        return css`
          background: transparent;
          color: ${tokens.colors.primary[600]};
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.primary[50]};
            color: ${tokens.colors.primary[700]};
          }
          
          &:active:not(:disabled) {
            background: ${tokens.colors.primary[100]};
          }
        `;

      case 'success':
        return css`
          background: ${tokens.colors.success.main};
          color: ${tokens.colors.neutral[0]};
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.success.dark};
            transform: translateY(-1px);
            box-shadow: ${tokens.shadows.lg};
          }
        `;

      case 'warning':
        return css`
          background: ${tokens.colors.warning.main};
          color: ${tokens.colors.neutral[0]};
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.warning.dark};
            transform: translateY(-1px);
            box-shadow: ${tokens.shadows.lg};
          }
        `;

      case 'error':
        return css`
          background: ${tokens.colors.error.main};
          color: ${tokens.colors.neutral[0]};
          
          &:hover:not(:disabled) {
            background: ${tokens.colors.error.dark};
            transform: translateY(-1px);
            box-shadow: ${tokens.shadows.lg};
          }
        `;

      default:
        return css`
          background: ${tokens.gradients.primaryBold};
          color: ${tokens.colors.neutral[0]};
          box-shadow: ${tokens.shadows.primaryBold};
          
          &:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: ${tokens.shadows.lg};
          }
        `;
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 1em;
  height: 1em;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
          variant = 'primary',
          size = 'md',
          isLoading = false,
          leftIcon,
          rightIcon,
          fullWidth = false,
          children,
          disabled,
          ...props
        },
        ref,
    ) => {
      return (
        <ButtonBase
          ref={ref}
          $variant={variant}
          $size={size}
          $fullWidth={fullWidth}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading && <LoadingSpinner />}
          {!isLoading && leftIcon && leftIcon}
          {children}
          {!isLoading && rightIcon && rightIcon}
        </ButtonBase>
      );
    },
);

Button.displayName = 'Button';
