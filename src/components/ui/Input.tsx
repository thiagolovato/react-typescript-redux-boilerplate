import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { tokens } from '@constants/tokens.ts';

type InputSize = 'sm' | 'md' | 'lg';
type InputVariant = 'default' | 'success' | 'warning' | 'error';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
    size?: InputSize;
    variant?: InputVariant;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    label?: string;
    helperText?: string;
    isRequired?: boolean;
    fullWidth?: boolean;
}

const InputContainer = styled.div<{ $fullWidth: boolean }>`
    display: flex;
    flex-direction: column;
    gap: ${tokens.spacing[2]};
    width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label<{ $isRequired: boolean }>`
    font-family: ${tokens.typography.fontFamily.sans};
    font-size: ${tokens.typography.fontSize.sm};
    font-weight: ${tokens.typography.fontWeight.medium};
    color: ${({ color }) => color || tokens.colors.neutral[700]};
    line-height: ${tokens.typography.lineHeight.tight};

    ${({ $isRequired }) =>
    $isRequired &&
            css`
                &::after {
                    content: ' *';
                    color: ${tokens.colors.error.main};
                }
            `}
`;

const InputWrapper = styled.div<{
    $size: InputSize;
    $variant: InputVariant;
    $hasLeftIcon: boolean;
    $hasRightIcon: boolean;
    $isFocused: boolean;
    $isDisabled: boolean;
}>`
    position: relative;
    display: flex;
    align-items: center;

    border: 1px solid;
    border-radius: ${tokens.borderRadius.lg};
    background: ${tokens.colors.neutral[0]};

    transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};

    /* Style autocomplete suggestions */

    & input {
        &:-webkit-autofill {
            & ~ datalist,
            & ~ select,
            & ~ input[list] {
                background-color: ${tokens.colors.neutral[0]};
                border: 1px solid ${tokens.colors.neutral[300]};
                border-radius: ${tokens.borderRadius.lg};
                box-shadow: ${tokens.shadows.lg};
                color: ${tokens.colors.neutral[900]};
                font-family: ${tokens.typography.fontFamily.sans};
                font-size: ${tokens.typography.fontSize.base};
                padding: ${tokens.spacing[1]};
            }
        }
    }

    /* Style autocomplete dropdown */

    &::-webkit-calendar-picker-indicator {
        display: none !important;
    }

    & input::-webkit-calendar-picker-indicator {
        display: none !important;
    }

    & input::-webkit-list-button {
        display: none !important;
    }

    & input::-webkit-contacts-auto-fill-button {
        display: none !important;
    }

    & input::-webkit-credentials-auto-fill-button {
        display: none !important;
    }

    ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`
                    height: ${tokens.component.input.height.sm};
                `;
      case 'md':
        return css`
                    height: ${tokens.component.input.height.md};
                `;
      case 'lg':
        return css`
                    height: ${tokens.component.input.height.lg};
                `;
      default:
        return css`
                    height: ${tokens.component.input.height.md};
                `;
    }
  }}

    ${({ $variant, $isFocused, $isDisabled }) => {
    if ($isDisabled) {
      return css`
                background-color: ${tokens.colors.neutral[100]};
                border-color: ${tokens.colors.neutral[300]};
                cursor: not-allowed;
            `;
    }

    switch ($variant) {
      case 'success':
        return css`
                    background-color: ${tokens.colors.success.light};
                    border-color: ${tokens.colors.success.main};

                    ${$isFocused &&
                    css`
                        border-color: ${tokens.colors.success.dark};
                        box-shadow: 0 0 0 3px ${tokens.colors.success.main}25;
                    `}
                `;

      case 'warning':
        return css`
                    background-color: ${tokens.colors.warning.light};
                    border-color: ${tokens.colors.warning.main};

                    ${$isFocused &&
                    css`
                        border-color: ${tokens.colors.warning.dark};
                        box-shadow: 0 0 0 3px ${tokens.colors.warning.main}25;
                    `}
                `;

      case 'error':
        return css`
                    background-color: ${tokens.colors.error.light};
                    border-color: ${tokens.colors.error.main};

                    ${$isFocused &&
                    css`
                        border-color: ${tokens.colors.error.dark};
                        box-shadow: 0 0 0 3px ${tokens.colors.error.main}25;
                    `}
                `;

      default:
        return css`
                    background-color: ${tokens.colors.neutral[0]};
                    border-color: ${tokens.colors.neutral[300]};

                    &:hover {
                        border-color: ${tokens.colors.primary[400]};
                    }

                    ${$isFocused &&
                    css`
                        border-color: ${tokens.colors.primary[500]};
                        box-shadow: 0 0 0 3px ${tokens.colors.primary[200]};
                    `}
                `;
    }
  }}
`;

const StyledInput = styled.input<{
    $size: InputSize;
    $hasLeftIcon: boolean;
    $hasRightIcon: boolean;
}>`
    flex: 1;
    border: none;
    outline: none;
    background: transparent;

    font-family: ${tokens.typography.fontFamily.sans};
    font-weight: ${tokens.typography.fontWeight.normal};
    color: ${tokens.colors.neutral[900]};

    /* Remove browser's default autocomplete styles */

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus,
    &:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 30px ${tokens.colors.neutral[0]} inset !important;
        -webkit-text-fill-color: ${tokens.colors.neutral[900]} !important;
        transition: background-color 5000s ease-in-out 0s;
    }

    /* Style autocomplete options */

    &::-webkit-input-placeholder {
        color: ${tokens.colors.neutral[400]};
    }

    &:-webkit-autofill::first-line {
        font-family: ${tokens.typography.fontFamily.sans};
        font-size: ${tokens.typography.fontSize.base};
    }

    &:autofill::first-line {
        font-family: ${tokens.typography.fontFamily.sans};
        font-size: ${tokens.typography.fontSize.base};
    }

    ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`
                    font-size: ${tokens.typography.fontSize.sm};
                    padding: ${tokens.spacing[2]} ${tokens.spacing[3]};
                `;
      case 'md':
        return css`
                    font-size: ${tokens.typography.fontSize.base};
                    padding: ${tokens.component.input.padding};
                `;
      case 'lg':
        return css`
                    font-size: ${tokens.typography.fontSize.lg};
                    padding: ${tokens.spacing[4]} ${tokens.spacing[5]};
                `;
      default:
        return css`
                    font-size: ${tokens.typography.fontSize.base};
                    padding: ${tokens.component.input.padding};
                `;
    }
  }}
    ${({ $hasLeftIcon }) =>
    $hasLeftIcon &&
            css`
                padding-left: 0;
            `}
    ${({ $hasRightIcon }) =>
    $hasRightIcon &&
            css`
                padding-right: 0;
            `}
    &::placeholder {
        color: ${tokens.colors.neutral[400]};
    }

    &:disabled {
        color: ${tokens.colors.neutral[400]};
        background: transparent;
        cursor: not-allowed;
    }
`;

const IconContainer = styled.div<{ $position: 'left' | 'right'; $size: InputSize }>`
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${tokens.colors.neutral[500]};

    ${({ $position, $size }) => {
    const padding = $size === 'sm' ? tokens.spacing[3] :
                $size === 'lg' ? tokens.spacing[5] : tokens.spacing[4];

    return css`
            padding-${$position}: ${padding};
        `;
  }}
`;

const HelperText = styled.span<{ $variant: InputVariant }>`
    font-family: ${tokens.typography.fontFamily.sans};
    font-size: ${tokens.typography.fontSize.sm};
    line-height: ${tokens.typography.lineHeight.tight};

    ${({ $variant }) => {
    switch ($variant) {
      case 'success':
        return css`
                    color: ${tokens.colors.success.dark};
                `;
      case 'warning':
        return css`
                    color: ${tokens.colors.warning.dark};
                `;
      case 'error':
        return css`
                    color: ${tokens.colors.error.dark};
                `;
      default:
        return css`
                    color: ${tokens.colors.neutral[600]};
                `;
    }
  }}
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
          size = 'md',
          variant = 'default',
          leftIcon,
          rightIcon,
          label,
          helperText,
          isRequired = false,
          fullWidth = false,
          disabled,
          labelColor,
          ...props
        },
        ref,
    ) => {
      const [isFocused, setIsFocused] = React.useState(false);

      return (
        <InputContainer $fullWidth={fullWidth}>
          {label && (
            <Label $isRequired={isRequired} htmlFor={props.id} color={labelColor}>
              {label}
            </Label>
          )}

          <InputWrapper
            $size={size}
            $variant={variant}
            $hasLeftIcon={!!leftIcon}
            $hasRightIcon={!!rightIcon}
            $isFocused={isFocused}
            $isDisabled={!!disabled}
          >
            {leftIcon && (
              <IconContainer $position="left" $size={size}>
                {leftIcon}
              </IconContainer>
            )}

            <StyledInput
              ref={ref}
              $size={size}
              $hasLeftIcon={!!leftIcon}
              $hasRightIcon={!!rightIcon}
              disabled={disabled}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              {...props}
            />

            {rightIcon && (
              <IconContainer $position="right" $size={size}>
                {rightIcon}
              </IconContainer>
            )}
          </InputWrapper>

          {helperText && (
            <HelperText $variant={variant}>
              {helperText}
            </HelperText>
          )}
        </InputContainer>
      );
    },
);

Input.displayName = 'Input';
