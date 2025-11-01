# 🎨 Design System - Blue Violet & Olive

Um design system completo inspirado na elegante beleza das flores azul-violeta florescendo em hastes verdes, criando uma sensação de frescor, sofisticação e naturalidade.

## 📋 Índice

- [Paleta de Cores](#-paleta-de-cores)
- [Tokens de Design](#-tokens-de-design)
- [Componentes](#-componentes)
- [Instalação e Uso](#-instalação-e-uso)
- [Princípios de Design](#-princípios-de-design)

## 🎨 Paleta de Cores

### Cores Primárias (Blue-Violet Range)
Nossa paleta primária baseia-se em tons de azul-violeta que simbolizam profundidade, expressividade e elegância.

```typescript
primary: {
  50: '#F8F9FF',   // Very light lilac
  100: '#E8EBFF',  // Light lilac  
  200: '#D2D9FB',  // Pale blue-violet
  300: '#B8C4F7',  // Light lavender blue
  400: '#8EA0FD',  // Pale blue-violet
  500: '#4C62CF',  // Light lavender blue
  600: '#0024BE',  // Rich ultramarine blue (principal)
  700: '#001A9A',  // Darker ultramarine
  800: '#001377',  // Deep blue
  900: '#000D54',  // Very deep blue
}
```

### Cores Secundárias (Olive Green Range)
As cores secundárias em tons de verde oliva representam frescor e naturalidade.

```typescript
secondary: {
  50: '#F7F8F0',
  100: '#EDEFC7',
  200: '#E1E59E', 
  300: '#D4DB75',
  400: '#C7D14C',
  500: '#9CB22A',  // Rich olive green (principal)
  600: '#7A8A21',
  700: '#586218',
  800: '#363A0F',
  900: '#1C1D08',
}
```

### Gradientes
```typescript
gradients: {
  primarySoft: 'linear-gradient(135deg, #D2D9FB 0%, #8EA0FD 100%)',
  primaryBold: 'linear-gradient(135deg, #4C62CF 0%, #0024BE 100%)',
  secondaryBold: 'linear-gradient(135deg, #9CB22A 0%, #7A8A21 100%)',
  accent: 'linear-gradient(135deg, #8EA0FD 0%, #9CB22A 100%)',
}
```

## 🏗️ Tokens de Design

### Espaçamento (Grid 8px)
```typescript
spacing: {
  0: '0',        // 0px
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px  
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
}
```

### Tipografia
```typescript
typography: {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto...',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas...',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
    '6xl': '3.75rem',  // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  }
}
```

## 🧩 Componentes

### Button

Um componente versátil com múltiplas variações e estados.

#### Variações
- `primary` - Botão principal com gradiente azul
- `secondary` - Botão secundário com gradiente verde
- `outline` - Botão com borda
- `ghost` - Botão transparente
- `success` - Para ações positivas
- `warning` - Para alertas
- `error` - Para ações destrutivas

#### Tamanhos
- `sm` - Pequeno (32px altura)
- `md` - Médio (40px altura) - padrão
- `lg` - Grande (48px altura)
- `xl` - Extra grande (56px altura)

#### Exemplo de Uso
```tsx
import { Button } from './components/ui';

// Botão básico
<Button>Click me</Button>

// Botão com variação e tamanho
<Button variant="secondary" size="lg">
  Large Secondary Button
</Button>

// Botão com estado de loading
<Button isLoading={true}>
  Loading...
</Button>

// Botão com ícones
<Button leftIcon="🚀" rightIcon="→">
  Launch App
</Button>

// Botão de largura total
<Button fullWidth>
  Full Width Button
</Button>
```

### Input

Campo de entrada com suporte a labels, ícones, diferentes estados e validação visual.

#### Variações
- `default` - Estado padrão
- `success` - Campo válido
- `warning` - Campo com aviso
- `error` - Campo com erro

#### Tamanhos
- `sm` - Pequeno (32px altura)
- `md` - Médio (40px altura) - padrão
- `lg` - Grande (48px altura)

#### Exemplo de Uso
```tsx
import { Input } from './components/ui';

// Input básico
<Input placeholder="Digite seu nome" />

// Input com label e helper text
<Input
  label="Email"
  placeholder="seu@email.com"
  helperText="Usaremos este email para contato"
  isRequired
/>

// Input com ícones
<Input
  label="Buscar"
  leftIcon="🔍"
  rightIcon="⌘K"
  placeholder="Buscar..."
/>

// Input com estado de erro
<Input
  variant="error"
  label="Senha"
  type="password"
  helperText="A senha deve ter pelo menos 8 caracteres"
/>
```

### Checkbox

Componente de checkbox com suporte a estados indeterminados, descrições e múltiplas variações.

#### Variações
- `default` - Padrão azul
- `success` - Verde para confirmações
- `warning` - Amarelo para avisos
- `error` - Vermelho para erros

#### Tamanhos
- `sm` - Pequeno (16px)
- `md` - Médio (20px) - padrão
- `lg` - Grande (24px)

#### Exemplo de Uso
```tsx
import { Checkbox } from './components/ui';

// Checkbox básico
<Checkbox label="Aceito os termos de uso" />

// Checkbox com descrição
<Checkbox
  label="Receber newsletters"
  description="Receba as últimas novidades em seu email"
/>

// Checkbox indeterminado
<Checkbox
  label="Selecionar todos"
  isIndeterminate={true}
/>

// Checkbox com variação
<Checkbox
  variant="success"
  label="Tarefa concluída"
  checked={true}
/>
```

## 🚀 Instalação e Uso

### Importação
```tsx
// Importar componentes individuais
import { Button, Input, Checkbox } from './components/ui';

// Importar tokens de design
import { tokens } from './constants/tokens';
import { colors } from './constants/colors';

// Usar tokens em styled-components
const StyledDiv = styled.div`
  padding: ${tokens.spacing[4]};
  background: ${tokens.colors.primary[50]};
  border-radius: ${tokens.borderRadius.lg};
  box-shadow: ${tokens.shadows.base};
`;
```

### Acessar a Demo
Visite `/design-system` na aplicação para ver todos os componentes em ação com exemplos interativos.

## 🎯 Princípios de Design

### 1. **Consistência**
- Uso consistente de espaçamentos baseados em grid de 8px
- Padrões visuais uniformes em todos os componentes
- Nomenclatura consistente para variações e tamanhos

### 2. **Acessibilidade**
- Contraste adequado entre cores
- Estados de foco visíveis
- Suporte a leitores de tela
- Navegação por teclado

### 3. **Flexibilidade**
- Componentes modulares e reutilizáveis
- Sistema de tokens configurável
- Suporte a temas e personalizações

### 4. **Performance**
- Componentes otimizados com styled-components
- Uso de tokens para minimizar re-renderizações
- Lazy loading quando apropriado

### 5. **Escalabilidade**
- Arquitetura baseada em tokens
- Componentes compostos
- Fácil extensão e manutenção

## 🔧 Estrutura de Arquivos

```
src/
├── constants/
│   ├── colors.ts       # Paleta de cores
│   └── tokens.ts       # Todos os tokens de design
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Checkbox.tsx
│   │   └── index.ts    # Exports
│   └── DesignSystemDemo.tsx  # Página de demonstração
```

## 📚 Referências

- **Inspiração**: Flores azul-violeta em hastes verdes
- **Princípios**: Atomic Design, Design Systems
- **Tecnologias**: React, TypeScript, Styled Components
- **Padrões**: DRY (Don't Repeat Yourself), Component Composition

---

💡 **Dica**: Para explorar todos os componentes interativamente, acesse `/design-system` na aplicação! 