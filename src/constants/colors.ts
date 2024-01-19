import { transparentize, linearGradient } from 'polished';

const COLORS = Object.freeze({
  transparent: 'rgba(0,0,0,0)',
  black: '#000000',
  white: '#ffffff',
  white100: '#f9f9f9',
  white200: '#f1f1f1',
  red: '#b55758',
  yellow: '#ffc107',
  gold: '#e6e4bc',
  green: '#008d64',
  green100: '#48d2a0',
  green200: '#129c8c',
  green300: '#00664b',
  gray100: '#f8f8f8',
  gray200: '#f2f2f2',
  gray300: '#e0e0e0',
  gray400: '#cccccc',
  gray500: '#b1b1b1',
  gray600: '#707070',
  gray700: '#4e4e51',
  gray800: '#4d4f5c',
  gray900: '#5D5D5D',
});

const STATE_COLORS = Object.freeze({
  success: COLORS.green100,
  invalid: COLORS.red,
  warning: COLORS.yellow,
});

const LINEAR_GRADIENT = Object.freeze({
  green: linearGradient({
    colorStops: [COLORS.green300, COLORS.green],
    fallback: COLORS.green,
    toDirection: 'to right',
  }),
  gray: linearGradient({
    colorStops: [COLORS.gray200, COLORS.gray300],
    fallback: COLORS.gray200,
    toDirection: 'to right',
  }),
});

const TRANSPARENT_BLACK = Object.freeze({
  soft: transparentize(0.8, COLORS.black),
  normal: transparentize(0.5, COLORS.black),
  hard: transparentize(0.3, COLORS.black),
});

export { COLORS, STATE_COLORS, LINEAR_GRADIENT, TRANSPARENT_BLACK };
