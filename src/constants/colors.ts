// Source of truth for the brand palette. src/index.css mirrors these values in the Tailwind theme.
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
} as const;

// Gradients
export const gradients = {
  primarySoft: 'linear-gradient(135deg, #D2D9FB 0%, #8EA0FD 100%)',
  primaryBold: 'linear-gradient(135deg, #4C62CF 0%, #0024BE 100%)',
  secondaryBold: 'linear-gradient(135deg, #9CB22A 0%, #7A8A21 100%)',
  accent: 'linear-gradient(135deg, #8EA0FD 0%, #9CB22A 100%)',
} as const;
