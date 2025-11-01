import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Input, Checkbox } from './ui';
import { tokens } from '../constants/tokens';

const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${tokens.spacing[8]};
  font-family: ${tokens.typography.fontFamily.sans};
`;

const Title = styled.h1`
  font-size: ${tokens.typography.fontSize['4xl']};
  font-weight: ${tokens.typography.fontWeight.bold};
  color: ${tokens.colors.neutral[900]};
  margin-bottom: ${tokens.spacing[8]};
  text-align: center;
  background: ${tokens.gradients.primaryBold};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Section = styled.section`
  margin-bottom: ${tokens.spacing[12]};
`;

const SectionTitle = styled.h2`
  font-size: ${tokens.typography.fontSize['2xl']};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.neutral[800]};
  margin-bottom: ${tokens.spacing[6]};
  border-bottom: 2px solid ${tokens.colors.primary[200]};
  padding-bottom: ${tokens.spacing[2]};
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${tokens.spacing[6]};
  margin-bottom: ${tokens.spacing[8]};
`;

const ComponentCard = styled.div`
  background: ${tokens.colors.neutral[0]};
  border: 1px solid ${tokens.colors.neutral[200]};
  border-radius: ${tokens.borderRadius.xl};
  padding: ${tokens.spacing[6]};
  box-shadow: ${tokens.shadows.base};
  
  &:hover {
    box-shadow: ${tokens.shadows.lg};
    transform: translateY(-2px);
    transition: all ${tokens.transitions.duration.normal} ${tokens.transitions.easing.easeInOut};
  }
`;

const ComponentTitle = styled.h3`
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.semibold};
  color: ${tokens.colors.neutral[700]};
  margin-bottom: ${tokens.spacing[4]};
`;

const ComponentGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.spacing[3]};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${tokens.spacing[2]};
  align-items: center;
`;

const ColorPalette = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${tokens.spacing[4]};
  margin-bottom: ${tokens.spacing[6]};
`;

const ColorCard = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color};
  height: 80px;
  border-radius: ${tokens.borderRadius.lg};
  display: flex;
  align-items: flex-end;
  padding: ${tokens.spacing[2]};
  border: 1px solid ${tokens.colors.neutral[200]};
  box-shadow: ${tokens.shadows.sm};
`;

const ColorLabel = styled.span<{ $isLight: boolean }>`
  font-size: ${tokens.typography.fontSize.xs};
  font-weight: ${tokens.typography.fontWeight.medium};
  color: ${({ $isLight }) => ($isLight ? tokens.colors.neutral[900] : tokens.colors.neutral[0])};
  background: ${({ $isLight }) => ($isLight ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)')};
  padding: ${tokens.spacing[1]} ${tokens.spacing[2]};
  border-radius: ${tokens.borderRadius.base};
`;

const SubTitle = styled.h4`
  margin-bottom: ${tokens.spacing[4]};
  font-size: ${tokens.typography.fontSize.lg};
  font-weight: ${tokens.typography.fontWeight.medium};
`;

// Helper function to determine if color is light
const isLightColor = (hex: string): boolean => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 155;
};

export const DesignSystemDemo: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <DemoContainer>
      <Title>Design System - Blue Violet & Olive</Title>

      {/* Color Palette */}
      <Section>
        <SectionTitle>🎨 Paleta de Cores</SectionTitle>

        <SubTitle>
          Cores Primárias (Blue-Violet)
        </SubTitle>
        <ColorPalette>
          {Object.entries(tokens.colors.primary).map(([key, value]) => (
            <ColorCard key={key} $color={value}>
              <ColorLabel $isLight={isLightColor(value)}>
                {key}: {value}
              </ColorLabel>
            </ColorCard>
          ))}
        </ColorPalette>

        <SubTitle>
          Cores Secundárias (Olive Green)
        </SubTitle>
        <ColorPalette>
          {Object.entries(tokens.colors.secondary).map(([key, value]) => (
            <ColorCard key={key} $color={value}>
              <ColorLabel $isLight={isLightColor(value)}>
                {key}: {value}
              </ColorLabel>
            </ColorCard>
          ))}
        </ColorPalette>
      </Section>

      {/* Buttons */}
      <Section>
        <SectionTitle>🔘 Botões</SectionTitle>
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle>Variações</ComponentTitle>
            <ComponentGroup>
              <ButtonRow>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </ButtonRow>
              <ButtonRow>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="error">Error</Button>
              </ButtonRow>
            </ComponentGroup>
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle>Tamanhos</ComponentTitle>
            <ComponentGroup>
              <ButtonRow>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </ButtonRow>
            </ComponentGroup>
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle>Estados</ComponentTitle>
            <ComponentGroup>
              <ButtonRow>
                <Button disabled>Disabled</Button>
                <Button isLoading={isLoading} onClick={handleLoadingDemo}>
                  {isLoading ? 'Loading...' : 'Click me'}
                </Button>
              </ButtonRow>
              <Button fullWidth>Full Width Button</Button>
            </ComponentGroup>
          </ComponentCard>
        </ComponentGrid>
      </Section>

      {/* Inputs */}
      <Section>
        <SectionTitle>📝 Inputs</SectionTitle>
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle>Tamanhos e Estados</ComponentTitle>
            <ComponentGroup>
              <Input
                size="sm"
                placeholder="Small input"
                label="Small Input"
              />
              <Input
                size="md"
                placeholder="Medium input"
                label="Medium Input (Default)"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                size="lg"
                placeholder="Large input"
                label="Large Input"
              />
            </ComponentGroup>
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle>Variações de Estado</ComponentTitle>
            <ComponentGroup>
              <Input
                variant="default"
                placeholder="Default input"
                label="Default"
                helperText="Este é um campo normal"
              />
              <Input
                variant="success"
                placeholder="Success input"
                label="Success"
                helperText="Campo válido!"
              />
              <Input
                variant="warning"
                placeholder="Warning input"
                label="Warning"
                helperText="Atenção: verifique os dados"
              />
              <Input
                variant="error"
                placeholder="Error input"
                label="Error"
                helperText="Este campo contém erros"
              />
            </ComponentGroup>
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle>Com Ícones e Estados</ComponentTitle>
            <ComponentGroup>
              <Input
                placeholder="Email"
                label="Email"
                leftIcon="📧"
                isRequired
              />
              <Input
                placeholder="Senha"
                type="password"
                label="Senha"
                rightIcon="👁️"
                isRequired
              />
              <Input
                placeholder="Disabled input"
                label="Disabled"
                disabled
                helperText="Este campo está desabilitado"
              />
            </ComponentGroup>
          </ComponentCard>
        </ComponentGrid>
      </Section>

      {/* Checkboxes */}
      <Section>
        <SectionTitle>☑️ Checkboxes</SectionTitle>
        <ComponentGrid>
          <ComponentCard>
            <ComponentTitle>Tamanhos</ComponentTitle>
            <ComponentGroup>
              <Checkbox
                size="sm"
                label="Small checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />
              <Checkbox
                size="md"
                label="Medium checkbox (default)"
                description="Esta é uma descrição do checkbox medium"
              />
              <Checkbox
                size="lg"
                label="Large checkbox"
                description="Checkbox grande com descrição mais detalhada"
              />
            </ComponentGroup>
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle>Variações</ComponentTitle>
            <ComponentGroup>
              <Checkbox
                variant="default"
                label="Default checkbox"
                checked
              />
              <Checkbox
                variant="success"
                label="Success checkbox"
                checked
              />
              <Checkbox
                variant="warning"
                label="Warning checkbox"
                checked
              />
              <Checkbox
                variant="error"
                label="Error checkbox"
                checked
              />
            </ComponentGroup>
          </ComponentCard>

          <ComponentCard>
            <ComponentTitle>Estados Especiais</ComponentTitle>
            <ComponentGroup>
              <Checkbox
                label="Indeterminate checkbox"
                isIndeterminate
              />
              <Checkbox
                label="Disabled unchecked"
                disabled
              />
              <Checkbox
                label="Disabled checked"
                disabled
                checked
              />
            </ComponentGroup>
          </ComponentCard>
        </ComponentGrid>
      </Section>

      {/* Typography */}
      <Section>
        <SectionTitle>🔤 Tipografia</SectionTitle>
        <ComponentCard>
          <ComponentGroup>
            <div style={{
              fontSize: tokens.typography.fontSize['6xl'],
              fontWeight: tokens.typography.fontWeight.bold,
            }}>
              Heading 1 - 6xl Bold
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['4xl'],
              fontWeight: tokens.typography.fontWeight.semibold,
            }}>
              Heading 2 - 4xl Semibold
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize['2xl'],
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Heading 3 - 2xl Medium
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.medium,
            }}>
              Heading 4 - xl Medium
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.base,
              fontWeight: tokens.typography.fontWeight.normal,
            }}>
              Body text - base Normal. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.normal,
              color: tokens.colors.neutral[600],
            }}>
              Small text - sm Normal. Ut enim ad minim veniam, quis nostrud exercitation.
            </div>
            <div style={{
              fontSize: tokens.typography.fontSize.xs,
              fontWeight: tokens.typography.fontWeight.light,
              color: tokens.colors.neutral[500],
            }}>
              Caption text - xs Light. Excepteur sint occaecat cupidatat non proident.
            </div>
          </ComponentGroup>
        </ComponentCard>
      </Section>
    </DemoContainer>
  );
};
