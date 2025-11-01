import { linearGradient, transparentize } from 'polished';

// Design System Color Palette - Inspired by blue-violet flowers and olive green
export const colors = {
  // Primary Colors - Blue-Violet Range
  primary: {
    50: '#F8F9FF', // Very light lilac
    100: '#E8EBFF', // Light lilac
    200: '#D2D9FB', // Pale blue-violet
    300: '#B8C4F7', // Light lavender blue
    400: '#8EA0FD', // Pale blue-violet
    500: '#4C62CF', // Light lavender blue
    600: '#0024BE', // Rich ultramarine blue
    700: '#001A9A', // Darker ultramarine
    800: '#001377', // Deep blue
    900: '#000D54', // Very deep blue
  },

  // Secondary Colors - Olive Green Range
  secondary: {
    50: '#F7F8F0',
    100: '#EDEFC7',
    200: '#E1E59E',
    300: '#D4DB75',
    400: '#C7D14C',
    500: '#9CB22A', // Rich olive green
    600: '#7A8A21',
    700: '#586218',
    800: '#363A0F',
    900: '#1C1D08',
  },

  // Neutral Colors
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    1000: '#000000',
  },

  // Semantic Colors
  success: {
    light: '#D1FAE5',
    main: '#10B981',
    dark: '#047857',
  },

  warning: {
    light: '#FEF3C7',
    main: '#F59E0B',
    dark: '#D97706',
  },

  error: {
    light: '#FEE2E2',
    main: '#EF4444',
    dark: '#DC2626',
  },

  info: {
    light: '#DBEAFE',
    main: '#3B82F6',
    dark: '#1D4ED8',
  },

  // Legacy color mappings for backwards compatibility
  transparent: 'rgba(0,0,0,0)',
  black: '#000000',
  white: '#ffffff',
  white100: '#f9f9f9',
  white200: '#f1f1f1',
  red: '#EF4444',
  yellow: '#F59E0B',
  gold: '#e6e4bc',
  green: '#10B981',
  green100: '#D1FAE5',
  green200: '#129c8c',
  green300: '#047857',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
} as const;

// Gradients
export const gradients = {
  primarySoft: 'linear-gradient(135deg, #D2D9FB 0%, #8EA0FD 100%)',
  primaryBold: 'linear-gradient(135deg, #4C62CF 0%, #0024BE 100%)',
  secondaryBold: 'linear-gradient(135deg, #9CB22A 0%, #7A8A21 100%)',
  accent: 'linear-gradient(135deg, #8EA0FD 0%, #9CB22A 100%)',
} as const;

// Legacy support - will be deprecated
export const COLORS = colors;

const STATE_COLORS = Object.freeze({
  success: colors.success.main,
  invalid: colors.error.main,
  warning: colors.warning.main,
});

const LINEAR_GRADIENT = Object.freeze({
  green: linearGradient({
    colorStops: [colors.secondary[500], colors.primary[600]],
    fallback: colors.primary[600],
    toDirection: 'to right',
  }),
  gray: linearGradient({
    colorStops: [colors.neutral[200], colors.neutral[300]],
    fallback: colors.neutral[200],
    toDirection: 'to right',
  }),
});

const TRANSPARENT_BLACK = Object.freeze({
  soft: transparentize(0.8, colors.neutral[1000]),
  normal: transparentize(0.5, colors.neutral[1000]),
  hard: transparentize(0.3, colors.neutral[1000]),
});

export { STATE_COLORS, LINEAR_GRADIENT, TRANSPARENT_BLACK };
