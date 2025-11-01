import React from 'react';
import styled from 'styled-components';
import { tokens } from '../../constants/tokens';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: ${tokens.spacing[2]};
  cursor: pointer;
  user-select: none;
  color: ${tokens.colors.neutral[800]};
  font-size: ${tokens.typography.fontSize.sm};
`;

const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const getBackgroundColor = ({ checked, disabled }: { checked: boolean; disabled: boolean }) => {
  if (disabled) return tokens.colors.primary[800];
  if (checked) return tokens.colors.primary[500];
  return tokens.colors.primary[700];
};

const getBorderColor = ({ checked, disabled }: { checked: boolean; disabled: boolean }) => {
  if (disabled) return tokens.colors.primary[600];
  if (checked) return tokens.colors.primary[400];
  return tokens.colors.primary[500];
};

const StyledCheckbox = styled.div<{ checked: boolean; disabled: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: ${getBackgroundColor};
  border: 2px solid ${getBorderColor};
  border-radius: ${tokens.borderRadius.sm};
  transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};

  ${({ disabled }) =>
    !disabled &&
    `
    &:hover {
      border-color: ${tokens.colors.primary[400]};
    }
  `}

  &::after {
    content: '';
    width: 10px;
    height: 10px;
    background: ${tokens.colors.neutral[50]};
    transform: scale(${({ checked }) => (checked ? 1 : 0)});
    transition: transform ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
    border-radius: 1px;
  }
`;

export const Checkbox: React.FC<CheckboxProps> = ({ label, disabled = false, checked = false, ...props }) => {
  return (
    <CheckboxContainer>
      <HiddenCheckbox disabled={disabled} checked={checked} {...props} />
      <StyledCheckbox checked={checked} disabled={disabled} />
      {label}
    </CheckboxContainer>
  );
};
