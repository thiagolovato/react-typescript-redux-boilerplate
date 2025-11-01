import React from 'react';
import styled from 'styled-components';
import { Language, useI18n } from '../../hooks/useI18n';
import { tokens } from '@constants/tokens.ts';

const LanguageToggleContainer = styled.div`
    position: relative;
    display: inline-block;
`;

const LanguageButton = styled.button`
    display: flex;
    align-items: center;
    gap: ${tokens.spacing[1]};
    padding: ${tokens.spacing[1]} ${tokens.spacing[2]};
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: ${tokens.borderRadius.md};
    color: white;
    font-size: ${tokens.typography.fontSize.sm};
    font-weight: ${tokens.typography.fontWeight.medium};
    cursor: pointer;
    backdrop-filter: blur(10px);
    transition: ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};

    &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
        transform: translateY(-1px);
    }

    &:active {
        transform: translateY(0);
    }
`;

const LanguageDropdown = styled.div<{ isOpen: boolean }>`
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: ${tokens.spacing[1]};
    min-width: 120px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: ${tokens.borderRadius.md};
    box-shadow: ${tokens.shadows.lg};
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
    transform: ${(props) => (props.isOpen ? 'translateY(0)' : 'translateY(-10px)')};
    transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
    z-index: ${tokens.zIndex.modal};
`;

const LanguageOption = styled.button<{ isActive: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    gap: ${tokens.spacing[1]};
    padding: ${tokens.spacing[2]} ${tokens.spacing[3]};
    background: ${(props) => (props.isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent')};
    border: none;
    color: ${(props) => (props.isActive ? tokens.colors.primary[600] : tokens.colors.neutral[700])};
    font-size: ${tokens.typography.fontSize.sm};
    font-weight: ${(props) => (
            props.isActive ?
                    tokens.typography.fontWeight.semibold :
                    tokens.typography.fontWeight.medium
  )};
    cursor: pointer;
    transition: ${tokens.transitions.duration.fast} ${tokens.transitions.easing.easeInOut};

    &:first-child {
        border-radius: ${tokens.borderRadius.md} ${tokens.borderRadius.md} 0 0;
    }

    &:last-child {
        border-radius: 0 0 ${tokens.borderRadius.md} ${tokens.borderRadius.md};
    }

    &:hover {
        background: ${(props) => (props.isActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.05)')};
    }
`;

interface LanguageToggleProps {
    className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ className }) => {
  const { currentLanguage, changeLanguage, languages } = useI18n();
  const [isOpen, setIsOpen] = React.useState(false);

  const currentLang = languages.find((lang) => lang.code === currentLanguage) || languages[0];

  const handleLanguageChange = (language: Language) => {
    changeLanguage(language);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-language-toggle]')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <LanguageToggleContainer className={className} data-language-toggle>
      <LanguageButton onClick={handleToggle}>
        <span>{currentLang.flag}</span>
        <span>{currentLang.code === 'pt-BR' ? 'PT' : 'EN'}</span>
        <span style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </LanguageButton>

      <LanguageDropdown isOpen={isOpen}>
        {languages.map((language) => (
          <LanguageOption
            key={language.code}
            isActive={language.code === currentLanguage}
            onClick={() => handleLanguageChange(language.code)}
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </LanguageOption>
        ))}
      </LanguageDropdown>
    </LanguageToggleContainer>
  );
};
