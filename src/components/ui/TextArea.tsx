import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { tokens } from '../../constants/tokens';

type TextAreaVariant = 'default' | 'success' | 'warning' | 'error';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextAreaVariant;
  label?: string;
  helperText?: string;
  isRequired?: boolean;
  fullWidth?: boolean;
}

const TextAreaContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[2]};
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
`;

const Label = styled.label<{ $isRequired: boolean }>`
  font-family: ${tokens.typography.fontFamily.sans};
  font-size: ${tokens.typography.fontSize.sm};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${tokens.colors.neutral[50]};
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

const TextAreaWrapper = styled.div<{
  $variant: TextAreaVariant;
  $isFocused: boolean;
  $isDisabled: boolean;
}>`
  position: relative;
  display: flex;
  align-items: stretch;
  
  border: 1px solid;
  border-radius: ${tokens.borderRadius.lg};
  
  transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  
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

const StyledTextArea = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  resize: vertical;
  min-height: 100px;
  
  font-family: ${tokens.typography.fontFamily.sans};
  font-size: ${tokens.typography.fontSize.base};
  font-weight: ${tokens.typography.fontWeight.normal};
  color: ${tokens.colors.neutral[50]};
  padding: ${tokens.spacing[3]};
  
  &::placeholder {
    color: ${tokens.colors.neutral[400]};
  }
  
  &:disabled {
    color: ${tokens.colors.neutral[400]};
    background: transparent;
    cursor: not-allowed;
  }
`;

const HelperText = styled.span<{ $variant: TextAreaVariant }>`
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

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    (
        {
          variant = 'default',
          label,
          helperText,
          isRequired = false,
          fullWidth = false,
          disabled,
          ...props
        },
        ref,
    ) => {
      const [isFocused, setIsFocused] = React.useState(false);

      return (
        <TextAreaContainer $fullWidth={fullWidth}>
          {label && (
            <Label $isRequired={isRequired} htmlFor={props.id}>
              {label}
            </Label>
          )}

          <TextAreaWrapper
            $variant={variant}
            $isFocused={isFocused}
            $isDisabled={!!disabled}
          >
            <StyledTextArea
              ref={ref}
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
          </TextAreaWrapper>

          {helperText && (
            <HelperText $variant={variant}>
              {helperText}
            </HelperText>
          )}
        </TextAreaContainer>
      );
    },
);

TextArea.displayName = 'TextArea';
