export type Theme = "dark" | "light";

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

interface ThemeMediaQueryResult {
  matches: boolean;
}

type ThemeMatchMedia = (query: string) => ThemeMediaQueryResult;

function isTheme(value: string | null): value is Theme {
  return value === "dark" || value === "light";
}

export function getThemeFromRoot(root: ThemeRoot | null | undefined): Theme {
  if (!root) return "dark";

  const dataTheme = root.getAttribute("data-theme");
  if (isTheme(dataTheme)) return dataTheme;

  return root.classList.contains("light") ? "light" : "dark";
}

export function applyTheme(root: ThemeRoot, theme: Theme): void {
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.setAttribute("data-theme", theme);
}

export function readStoredTheme(
  storage: ThemeStorage | null | undefined,
): Theme | null {
  if (!storage) return null;

  try {
    const storedTheme = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(storedTheme) ? storedTheme : null;
  } catch {
    return null;
  }
}

export function persistTheme(
  storage: ThemeStorage | null | undefined,
  theme: Theme,
): void {
  if (!storage?.setItem) return;

  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage failures so theme switching still works in restricted contexts.
  }
}

export function getSystemTheme(matchMedia?: ThemeMatchMedia): Theme {
  if (!matchMedia) return "dark";

  try {
    return matchMedia(THEME_MEDIA_QUERY).matches ? "light" : "dark";
  } catch {
    return "dark";
  }
}

export function resolveTheme(
  storage?: ThemeStorage | null,
  matchMedia?: ThemeMatchMedia,
): Theme {
  return readStoredTheme(storage) ?? getSystemTheme(matchMedia);
}
