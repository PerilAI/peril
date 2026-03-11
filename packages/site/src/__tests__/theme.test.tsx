// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  applyTheme,
  getThemeFromRoot,
  resolveTheme,
  THEME_MEDIA_QUERY,
  THEME_STORAGE_KEY,
} from "../theme";

afterEach(() => {
  cleanup();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

beforeEach(() => {
  document.documentElement.className = "dark";
  document.documentElement.setAttribute("data-theme", "dark");
});

interface MatchMediaController {
  emit: (matches: boolean) => void;
}

function installMatchMedia(initialMatches: boolean): MatchMediaController {
  let matches = initialMatches;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: THEME_MEDIA_QUERY,
    addEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
    ),
    removeEventListener: vi.fn(
      (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
    ),
  };

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn(() => mediaQuery),
  });

  return {
    emit(nextMatches) {
      matches = nextMatches;
      const event = { matches, media: THEME_MEDIA_QUERY } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function extractThemeBootstrapScript(): string {
  const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
  // Match the first plain <script> tag (no type attribute) — the bootstrap IIFE
  const match = html.match(/<script>(?!\s*\{)\s*([\s\S]*?)\s*<\/script>/);

  if (!match) {
    throw new Error("Theme bootstrap script not found in index.html");
  }

  const script = match[1];
  if (!script) {
    throw new Error("Theme bootstrap script was empty");
  }

  return script;
}

describe("theme helpers", () => {
  it("applies the theme to both class and data attribute", () => {
    applyTheme(document.documentElement, "light");

    expect(getThemeFromRoot(document.documentElement)).toBe("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("prefers a stored theme over the system preference", () => {
    const matchMedia = vi.fn(() => ({ matches: false }));
    window.localStorage.setItem(THEME_STORAGE_KEY, "light");

    expect(resolveTheme(window.localStorage, matchMedia)).toBe("light");
  });

  it("falls back to system preference when storage access fails", () => {
    const matchMedia = vi.fn(() => ({ matches: true }));
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage unavailable");
    });

    expect(resolveTheme(window.localStorage, matchMedia)).toBe("light");
  });
});

describe("ThemeToggle", () => {
  it("toggles the document theme and persists the choice", () => {
    installMatchMedia(false);
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
    expect(
      screen.getByRole("button", { name: "Switch to dark mode" }),
    ).toBeDefined();
  });

  it("tracks system theme changes until a user preference is stored", () => {
    const matchMedia = installMatchMedia(true);
    render(<ThemeToggle />);

    expect(document.documentElement.classList.contains("light")).toBe(true);

    act(() => {
      matchMedia.emit(false);
    });
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Switch to light mode" }));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    act(() => {
      matchMedia.emit(false);
    });
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});

describe("theme bootstrap script", () => {
  it("applies the stored theme before React mounts", () => {
    const runBootstrap = new Function(
      "window",
      "document",
      "localStorage",
      extractThemeBootstrapScript(),
    );

    const matchMedia = vi.fn(() => ({ matches: false }));
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: matchMedia,
    });
    vi.spyOn(window.localStorage, "getItem").mockReturnValue("light");

    document.documentElement.className = "";
    document.documentElement.removeAttribute("data-theme");

    runBootstrap(window, document, window.localStorage);

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
