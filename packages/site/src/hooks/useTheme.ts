import { useEffect, useSyncExternalStore } from "react";
import {
  applyTheme,
  getSystemTheme,
  getThemeFromRoot,
  persistTheme,
  readStoredTheme,
  resolveTheme,
  THEME_MEDIA_QUERY,
  type Theme,
} from "../theme";

const listeners = new Set<() => void>();

function getSnapshot(): Theme {
  if (typeof document === "undefined") return "dark";
  return getThemeFromRoot(document.documentElement);
}

function getServerSnapshot(): Theme {
  // SSR always renders dark; the bootstrap script in index.html sets the
  // correct class before first paint so there is no visible flash.
  return "dark";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notifySubscribers() {
  listeners.forEach((cb) => cb());
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === "undefined") return;
  applyTheme(document.documentElement, theme);
  notifySubscribers();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (typeof window === "undefined") return;

    applyThemeToDocument(
      resolveTheme(window.localStorage, window.matchMedia?.bind(window)),
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);
    const handleChange = () => {
      if (!readStoredTheme(window.localStorage)) {
        applyThemeToDocument(getSystemTheme(window.matchMedia.bind(window)));
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = (next: Theme) => {
    if (typeof window !== "undefined") {
      persistTheme(window.localStorage, next);
    }

    applyThemeToDocument(next);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return { theme, setTheme, toggleTheme } as const;
}
