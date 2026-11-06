# 🎨 Design System - Blue Violet & Olive

Um design system completo inspirado na elegante beleza das flores azul-violeta florescendo em hastes verdes, criando uma sensação de frescor, sofisticação e naturalidade.

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

## Onde a paleta vive

- `src/constants/colors.ts` é a fonte da verdade dos valores hex.
- `src/index.css` replica esses valores no tema do Tailwind CSS v4 (`@theme`). Ao mudar uma cor, altere os dois arquivos.

Classes disponíveis:

- Cores: `primary-50` a `primary-900`, `secondary-50` a `secondary-900`, `neutral-50` a `neutral-900`,
  `success-{light,main,dark}`, `warning-*`, `error-*`, `info-*`. Exemplo: `bg-primary-800`, `text-error-dark`.
- Gradientes: `bg-primary-bold`, `bg-secondary-bold`, `bg-accent`.
- Sombras de marca: `shadow-primary-bold`, `shadow-secondary-bold`.

## Componentes

Ficam em `src/components/ui/` e usam só classes Tailwind.

- `Button`: `variant` (`primary`, `secondary`, `outline`, `ghost`, `success`, `warning`, `error`),
  `size` (`sm`, `md`, `lg`, `xl`), `isLoading`, `leftIcon`, `rightIcon`, `fullWidth`. O tipo padrão é `button`.
- `Input`: `size`, `variant` (`default`, `success`, `warning`, `error`), `label`, `helperText`, `isRequired`,
  `leftIcon`, `rightIcon`, `fullWidth`. Liga label e mensagem ao campo por `id`.
- `TextArea`: mesmas opções de `Input`, sem ícones e tamanhos.
- `Checkbox`: checkbox nativo com `label`.
- `LanguageToggle`: `select` nativo para trocar o idioma.

Labels herdam a cor do texto do contêiner. Assim os campos funcionam em cartões claros e em superfícies `primary-800`.

## Regras

- Sem keyframes decorativos. A única animação é o spinner de `isLoading` (`animate-spin`).
- Foco visível global em `src/index.css` (`outline-primary-400`).
- Escreva classes completas no código. O Tailwind não detecta nomes montados em tempo de execução.
