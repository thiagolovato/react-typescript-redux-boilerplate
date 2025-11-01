import tokens from '@constants/tokens.ts';
import React from 'react';
import { useI18n } from 'src/hooks/useI18n.ts';
import styled, { keyframes } from 'styled-components';

const backgroundShift = keyframes`
    0%, 100% {
        background-position: 0% 50%;
    }
    50% {
        background-position: 100% 50%;
    }
`;

const particleFloat = keyframes`
    0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: translateY(-100vh) rotate(360deg);
        opacity: 0;
    }
`;

const pulse = keyframes`
    0%, 100% {
        opacity: 0.1;
        transform: scale(1);
    }
    50% {
        opacity: 0.2;
        transform: scale(1.1);
    }
`;

const MobileDecorativeElement = styled.div<{ $position: string }>`
    display: none;

    @media (max-width: ${tokens.breakpoints.notebook}) {
        display: block;
        position: absolute;
        width: 100px;
        height: 100px;
        background: linear-gradient(45deg, ${tokens.colors.secondary[400]}, ${tokens.colors.secondary[600]});
        border-radius: 50%;
        animation: ${pulse} 4s ease-in-out infinite;
        ${(props) => props.$position === 'top-left' && `
      top: -50px;
      left: -50px;
    `}
        ${(props) => props.$position === 'bottom-right' && `
      bottom: -50px;
      right: -50px;
    `}
    }
`;

const BrandingSectionWrapper = styled.div`
    background: linear-gradient(
        135deg,
        ${tokens.colors.primary[600]} 0%,
        ${tokens.colors.primary[800]} 50%,
        ${tokens.colors.secondary[600]} 100%
    );
    background-size: 200% 200%;
    animation: ${backgroundShift} 8s ease-in-out infinite;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: ${tokens.spacing[8]};
    color: white;
    position: relative;
    overflow: hidden;

    @media (max-width: ${tokens.breakpoints.notebook}) {
        padding: ${tokens.spacing[6]} ${tokens.spacing[4]};
        min-height: 200px;
    }

    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 70% 80%, rgba(167, 139, 250, 0.2) 0%, transparent 50%);
        pointer-events: none;
    }
`;

const BrandingLogo = styled.img`
    width: 300px;
    height: 300px;
    margin-bottom: ${tokens.spacing[4]};
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
    border-radius: 50%;
    z-index: 100;

    @media (max-width: ${tokens.breakpoints.notebook}) {
        width: 80px;
        height: 80px;
        margin-bottom: ${tokens.spacing[2]};
    }
`;

const BrandingSubtitle = styled.p`
    font-size: ${tokens.typography.fontSize.lg};
    text-align: center;
    opacity: 0.9;
    line-height: ${tokens.typography.lineHeight.relaxed};
    max-width: 300px;

    @media (max-width: ${tokens.breakpoints.notebook}) {
        font-size: ${tokens.typography.fontSize.base};
        max-width: 250px;
    }
`;

// Floating particles
const FloatingParticle = styled.div<{ delay: number; duration: number; size: number }>`
    position: absolute;
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: ${particleFloat} ${(props) => props.duration}s linear infinite;
    animation-delay: ${(props) => props.delay}s;
    left: ${() => Math.random() * 100}%;
`;

const DecorativeOrb = styled.div<{ size: number; position: { x: number; y: number } }>`
    position: absolute;
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    left: ${(props) => props.position.x}%;
    top: ${(props) => props.position.y}%;
    animation: ${pulse} 3s ease-in-out infinite;
    animation-delay: ${() => Math.random() * 2}s;
`;
const BrandingSection: React.FC = () => {
  const { t } = useI18n();

  return <BrandingSectionWrapper>
    <BrandingLogo src="/src/assets/mentor-mentee-logo.png" alt="Mentor Mentee Logo" />
    <BrandingSubtitle>
      {t('app.tagline')}
    </BrandingSubtitle>

    {/* Floating Particles */}
    {[...Array(6)].map((_, i) => (
      <FloatingParticle
        key={i}
        delay={i * 2}
        duration={8 + Math.random() * 4}
        size={4 + Math.random() * 8}
      />
    ))}

    {/* Decorative Orbs */}
    <DecorativeOrb size={80} position={{ x: 10, y: 20 }} />
    <DecorativeOrb size={60} position={{ x: 85, y: 10 }} />
    <DecorativeOrb size={100} position={{ x: 75, y: 75 }} />
    <DecorativeOrb size={40} position={{ x: 15, y: 85 }} />

    <MobileDecorativeElement $position="top-left" />
    <MobileDecorativeElement $position="bottom-right" />
  </BrandingSectionWrapper>;
};

export { BrandingSection };
