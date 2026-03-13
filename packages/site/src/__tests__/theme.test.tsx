// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyTheme,
  getThemeFromRoot,
  resolveTheme,
} from "../theme";

afterEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme");
  vi.restoreAllMocks();
});

beforeEach(() => {
  document.documentElement.className = "dark";
  document.documentElement.setAttribute("data-theme", "dark");
});

describe("theme helpers (dark-only)", () => {
  it("always returns dark from getThemeFromRoot", () => {
    expect(getThemeFromRoot(document.documentElement)).toBe("dark");
  });

  it("applies dark theme to root", () => {
    applyTheme(document.documentElement, "dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("resolveTheme always returns dark", () => {
    expect(resolveTheme()).toBe("dark");
  });
});

describe("theme bootstrap script", () => {
  it("sets dark mode in index.html", () => {
    const html = readFileSync(resolve(__dirname, "../../index.html"), "utf8");
    expect(html).toContain("classList.add('dark')");
    expect(html).toContain("setAttribute('data-theme', 'dark')");
  });
});
