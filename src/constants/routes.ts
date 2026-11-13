// Every page path in the app. App.tsx, links, redirects and the end-to-end tests all read them from here.
export const APP_ROUTES = {
  root: '/',
  login: '/login',
  register: '/register',
  // Coordinators sign in on their own page. Nothing links to it: coordinators get the address directly.
  coordinatorLogin: '/coordination/login',
  privacy: '/privacy',
  designSystem: '/design-system',
  dashboard: '/dashboard',
  profile: '/profile',
  coordination: '/coordination',
  // Build with generatePath(APP_ROUTES.menteeMatching, { userId }).
  menteeMatching: '/coordination/mentees/:userId',
} as const;
