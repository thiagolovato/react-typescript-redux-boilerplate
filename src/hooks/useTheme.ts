import { useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

// The script in index.html reads the same key and sets the same theme colors before the first paint, so keep the
// two in step.
const STORAGE_KEY = 'theme';
const THEME_COLORS: Record<Theme, string> = { light: '#fcfaf6', dark: '#131e26' };

const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : 'system';
  } catch {
    return 'system';
  }
}

let preference = readPreference();
let theme: Theme = 'light';

function apply() {
  theme = preference === 'dark' || (preference === 'system' && systemDark.matches) ? 'dark' : 'light';
  const root = document.documentElement;
  if (root.dataset.theme !== theme) {
    // Swap every color at once: without this, elements with a color transition trail the page by a beat.
    root.dataset.themeSwitching = '';
    root.dataset.theme = theme;
    requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.themeSwitching));
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme]);
  listeners.forEach((listener) => listener());
}

// "System" follows the OS live, also when it switches at sunset.
systemDark.addEventListener('change', apply);

// A choice made in another tab applies here too.
window.addEventListener('storage', (event) => {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  preference = readPreference();
  apply();
});

apply();

function setPreference(next: ThemePreference) {
  preference = next;
  try {
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Storage blocked: the choice still holds until the tab closes.
  }
  apply();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** The user's choice (`preference`) and what is on screen now (`theme`, with "system" resolved). */
export const useTheme = () => {
  const currentPreference = useSyncExternalStore(subscribe, () => preference);
  const currentTheme = useSyncExternalStore(subscribe, () => theme);
  return { preference: currentPreference, theme: currentTheme, setPreference };
};
