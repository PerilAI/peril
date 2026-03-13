export type Theme = "dark";

export const THEME_STORAGE_KEY = "peril-theme";
export const THEME_MEDIA_QUERY = "(prefers-color-scheme: light)";

interface ThemeRoot {
  classList: {
    add: (...tokens: string[]) => void;
    contains: (token: string) => boolean;
    remove: (...tokens: string[]) => void;
  };
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
}

interface ThemeStorage {
  getItem: (key: string) => string | null;
  setItem?: (key: string, value: string) => void;
}

type ThemeMatchMedia = (query: string) => { matches: boolean };

export function getThemeFromRoot(_root?: ThemeRoot | null): Theme {
  return "dark";
}

export function applyTheme(root: ThemeRoot, _theme: Theme): void {
  root.classList.remove("dark", "light");
  root.classList.add("dark");
  root.setAttribute("data-theme", "dark");
}

export function readStoredTheme(_storage?: ThemeStorage | null): Theme {
  return "dark";
}

export function persistTheme(_storage?: ThemeStorage | null, _theme?: Theme): void {
  // No-op: Solar Flare is dark-only
}

export function getSystemTheme(_matchMedia?: ThemeMatchMedia): Theme {
  return "dark";
}

export function resolveTheme(_storage?: ThemeStorage | null, _matchMedia?: ThemeMatchMedia): Theme {
  return "dark";
}
