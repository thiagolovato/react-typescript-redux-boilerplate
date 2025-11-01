import { colors, gradients } from './colors';

// Spacing Scale - Based on 8px grid system
export const spacing = {
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },
  fontSize: {
    'xs': '0.75rem', // 12px
    'sm': '0.875rem', // 14px
    'base': '1rem', // 16px
    'lg': '1.125rem', // 18px
    'xl': '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem', // 48px
    '6xl': '3.75rem', // 60px
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

// Border Radius
export const borderRadius = {
  'none': '0',
  'sm': '0.125rem', // 2px
  'base': '0.25rem', // 4px
  'md': '0.375rem', // 6px
  'lg': '0.5rem', // 8px
  'xl': '0.75rem', // 12px
  '2xl': '1rem', // 16px
  '3xl': '1.5rem', // 24px
  'full': '9999px',
} as const;

// Box Shadows
export const shadows = {
  'none': 'none',
  'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  'base': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  // Custom shadows with brand colors
  'primarySoft': `0 4px 6px -1px ${colors.primary[200]}, 0 2px 4px -1px ${colors.primary[100]}`,
  'primaryBold': `0 10px 15px -3px ${colors.primary[600]}40, 0 4px 6px -2px ${colors.primary[600]}20`,
  'secondaryBold': `0 10px 15px -3px ${colors.secondary[600]}40, 0 4px 6px -2px ${colors.secondary[600]}20`,
} as const;

// Transitions
export const transitions = {
  duration: {
    fastest: '75ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

// Z-Index Scale
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// Responsive Breakpoints - Mobile, Notebook, Full HD
export const breakpoints = {
  'mobile': '480px', // Mobile devices
  'notebook': '1366px', // Notebook/Laptop screens
  'fullhd': '1920px', // Full HD displays
} as const;

// Responsive Container Sizes
export const containers = {
  mobile: {
    maxWidth: '100%',
    padding: spacing[4], // 16px
  },
  notebook: {
    maxWidth: '1200px',
    padding: spacing[6], // 24px
  },
  fullhd: {
    maxWidth: '1600px',
    padding: spacing[8], // 32px
  },
} as const;

// Component specific tokens with responsive variants
export const component = {
  button: {
    height: {
      sm: '2rem', // 32px
      md: '2.5rem', // 40px
      lg: '3rem', // 48px
      xl: '3.5rem', // 56px
    },
    padding: {
      sm: `${spacing[2]} ${spacing[3]}`,
      md: `${spacing[3]} ${spacing[4]}`,
      lg: `${spacing[4]} ${spacing[6]}`,
      xl: `${spacing[5]} ${spacing[8]}`,
    },
  },
  input: {
    height: {
      sm: '2rem', // 32px
      md: '2.5rem', // 40px
      lg: '3rem', // 48px
    },
    padding: `${spacing[3]} ${spacing[4]}`,
  },
  card: {
    padding: {
      sm: spacing[4],
      md: spacing[6],
      lg: spacing[8],
    },
    maxWidth: {
      mobile: '100%',
      notebook: '480px',
      fullhd: '600px',
    },
    // Responsive card padding
    responsive: {
      mobile: {
        padding: spacing[6],
        margin: spacing[4],
        borderRadius: borderRadius.xl,
      },
      notebook: {
        padding: spacing[10],
        margin: spacing[6],
        borderRadius: borderRadius['2xl'],
      },
      fullhd: {
        padding: spacing[12],
        margin: spacing[8],
        borderRadius: borderRadius['3xl'],
      },
    },
  },
  // Login specific responsive tokens
  loginCard: {
    mobile: {
      width: '95%',
      maxWidth: '500px',
      padding: spacing[6],
      logoSize: '60px',
      titleSize: typography.fontSize['2xl'],
    },
    desktop: {
      width: '100%',
      maxWidth: '800px',
      padding: spacing[10],
      logoSize: '80px',
      titleSize: typography.fontSize['3xl'],
    },
  },
} as const;

// Media Query Helpers
export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  notebook: `@media (min-width: calc(${breakpoints.mobile} + 1px)) and (max-width: ${breakpoints.notebook})`,
  fullhd: `@media (min-width: calc(${breakpoints.notebook} + 1px))`,

  // Min-width queries
  mobileUp: `@media (min-width: ${breakpoints.mobile})`,
  notebookUp: `@media (min-width: ${breakpoints.notebook})`,
  fullhdUp: `@media (min-width: ${breakpoints.fullhd})`,
} as const;

// Export everything as a single tokens object
export const tokens = {
  colors,
  gradients,
  spacing,
  typography,
  borderRadius,
  shadows,
  transitions,
  zIndex,
  breakpoints,
  containers,
  component,
  mediaQuery,
} as const;

export default tokens;
