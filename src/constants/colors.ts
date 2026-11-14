// Source of truth for the brand palette. src/index.css mirrors these values in the Tailwind theme.
// Every hue comes from the logo: the larger blue bird is the mentor, the smaller green bird is the mentee,
// and the teal where their gradients meet is the bridge between them.
export const colors = {
  // Primary - mentor blue (larger bird). 600 is the lightest shade that passes AA with white text.
  primary: {
    50: '#F1F7FD',
    100: '#DFECFA',
    200: '#BFD8F4',
    300: '#91BCEC',
    400: '#66A2E6',
    500: '#448DE0', // Bird head
    600: '#2F74C8', // Buttons, links
    700: '#275FA6',
    800: '#1F4A80',
    900: '#17375D',
  },

  // Secondary - mentee green (smaller bird), from leaf green to the chartreuse tail.
  secondary: {
    50: '#F3FAEE',
    100: '#E2F3D6',
    200: '#CDEBA9',
    300: '#ABCE31', // Tail
    400: '#79C878', // Head
    500: '#5DB063',
    600: '#3F8A4A', // Large text only on white
    700: '#357A40', // Text on white
    800: '#2B5F33',
    900: '#1F4425',
  },

  // Teal - where the two gradients meet. Used by the perch gradient.
  teal: {
    100: '#DDF3EC',
    400: '#4EBCA3',
    700: '#1F7F6E',
  },

  // Neutral - warm paper of the logo background to the slate ink of the eyes and wordmark.
  neutral: {
    0: '#FFFFFF',
    50: '#FCFAF6', // Paper, page background
    100: '#F2F1EE',
    200: '#E3E5E6', // Borders
    300: '#CBD1D5',
    400: '#9AA5AD',
    500: '#6B7A84', // Placeholders
    600: '#55656F', // Secondary text
    700: '#3E505C',
    800: '#2A3F4E', // Ink, body text
    900: '#1C2B36', // Headings
  },

  // Semantic colors
  success: {
    light: '#E2F3D6',
    main: '#5DB063',
    dark: '#357A40',
  },

  warning: {
    light: '#FDF0D5',
    main: '#E8A33D',
    dark: '#B4570F',
  },

  error: {
    light: '#FBE4E2',
    main: '#D9544B',
    dark: '#A8332D',
  },

  info: {
    light: '#DFECFA',
    main: '#448DE0',
    dark: '#275FA6',
  },

  // Solid buttons under white text. Fixed in both themes: the deep stops above turn light in dark mode.
  fill: {
    primary: '#2F74C8',
    'primary-hover': '#275FA6',
    'primary-active': '#1F4A80',
    secondary: '#357A40',
    'secondary-hover': '#2B5F33',
    'secondary-active': '#1F4425',
    success: '#357A40',
    'success-hover': '#2B5F33',
    warning: '#B4570F',
    error: '#A8332D',
  },

  // The logo's paper and ink, fixed in both themes: the birds photo sits on paper, the drawn bird's eye is ink.
  paper: '#FCFAF6',
  ink: '#2A3F4E',
} as const;

// Dark mode: only the stops that change. Paper and ink swap places: slate becomes the ground, paper the text.
// Neutral 0 is the raised surface (cards, inputs), white in light mode.
export const darkColors = {
  primary: { 50: '#172A3D', 100: '#1C3756', 200: '#234870', 700: '#91BCEC', 800: '#B7D3F2', 900: '#DFECFA' },
  secondary: { 50: '#16271C', 100: '#1D3624', 200: '#284A31', 700: '#93CF8F', 800: '#BFE3A0', 900: '#E2F3D6' },
  teal: { 100: '#15352F', 700: '#6CCDB6' },
  neutral: {
    0: '#1A2731',
    50: '#131E26',
    100: '#213140',
    200: '#2B3C49',
    300: '#3B4E5B',
    400: '#5D6F7B',
    500: '#8A98A2',
    600: '#A8B3BA',
    700: '#C3CBD0',
    800: '#E1E1DC',
    900: '#F5F2EB',
  },
  success: { light: '#1D3624', dark: '#93CF8F' },
  warning: { light: '#3A2B12', dark: '#EFB866' },
  error: { light: '#3D1D1C', main: '#E8695F', dark: '#F08C84' },
  info: { light: '#1C3756', dark: '#91BCEC' },
} as const;

// The perch: mentor blue to mentee green, the same direction as the logo.
export const gradients = {
  perch: 'linear-gradient(90deg, #448DE0 0%, #4EBCA3 50%, #ABCE31 100%)',
} as const;
