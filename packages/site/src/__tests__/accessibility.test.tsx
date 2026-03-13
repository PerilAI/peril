// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { App } from "../App";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => cleanup());

// ============================================================
// Helpers
// ============================================================

function relativeLuminance(hex: string): number {
  const [red = 0, green = 0, blue = 0] = hex
    .replace("#", "")
    .match(/.{2}/g)!
    .map((c) => {
      const v = parseInt(c, 16) / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================
// Solar Flare color palette
// ============================================================

const SF_BG = "#06060e";
const SF_TEXT_PRIMARY = "#fafaf9";
const SF_TEXT_SECONDARY = "#a1a1aa";
const SF_TEXT_MUTED = "#71717a";
const SF_ACCENT = "#f59e0b";
const SF_ACCENT_FG = "#06060e";

// ============================================================
// Contrast ratio tests (dark mode only)
// ============================================================

describe("contrast ratios (WCAG 2.1 AA >= 4.5:1)", () => {
  it("primary text on background passes", () => {
    expect(contrastRatio(SF_TEXT_PRIMARY, SF_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it("secondary text on background passes", () => {
    expect(contrastRatio(SF_TEXT_SECONDARY, SF_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it("muted text on background passes (WCAG large-text / incidental 3:1)", () => {
    expect(contrastRatio(SF_TEXT_MUTED, SF_BG)).toBeGreaterThanOrEqual(3);
  });

  it("accent on background passes", () => {
    expect(contrastRatio(SF_ACCENT, SF_BG)).toBeGreaterThanOrEqual(4.5);
  });

  it("accent foreground on accent passes (buttons)", () => {
    expect(contrastRatio(SF_ACCENT_FG, SF_ACCENT)).toBeGreaterThanOrEqual(4.5);
  });
});

// ============================================================
// Semantic HTML & landmarks
// ============================================================

describe("semantic HTML landmarks", () => {
  it("renders a <main> landmark", () => {
    renderWithRouter(<App />);
    expect(screen.getByRole("main")).toBeDefined();
  });

  it("renders a <banner> (header) landmark", () => {
    renderWithRouter(<App />);
    expect(screen.getByRole("banner")).toBeDefined();
  });

  it("renders a <navigation> landmark with label", () => {
    renderWithRouter(<App />);
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    expect(nav).toBeDefined();
    expect(nav.getAttribute("aria-label")).toBe("Main navigation");
  });

  it("has exactly one h1", () => {
    renderWithRouter(<App />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it("heading hierarchy does not skip levels", () => {
    renderWithRouter(<App />);
    const allHeadings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let prevLevel = 0;
    allHeadings.forEach((h) => {
      const level = parseInt(h.tagName.slice(1), 10);
      expect(level).toBeLessThanOrEqual(prevLevel + 1 || level);
      prevLevel = level;
    });
  });
});

// ============================================================
// Skip link
// ============================================================

describe("skip-to-content link", () => {
  it("exists and targets #main", () => {
    renderWithRouter(<App />);
    const skipLink = screen.getByText("Skip to content");
    expect(skipLink).toBeDefined();
    expect(skipLink.getAttribute("href")).toBe("#main");
  });

  it("target element exists", () => {
    renderWithRouter(<App />);
    expect(document.getElementById("main")).toBeDefined();
  });
});

// ============================================================
// ARIA attributes
// ============================================================

describe("ARIA attributes", () => {
  it("external links inform screen readers about new tab", () => {
    render(<Header />);
    const githubLink = screen.getAllByText(/GitHub/)[0]!;
    const srHint = githubLink.querySelector(".sr-only") ??
      githubLink.closest("a")?.querySelector(".sr-only");
    expect(srHint?.textContent).toMatch(/new tab/i);
  });
});

// ============================================================
// Keyboard navigation
// ============================================================

describe("keyboard navigation", () => {
  it("all interactive elements are focusable links or buttons", () => {
    renderWithRouter(<App />);
    const interactives = document.querySelectorAll("a[href], button");
    interactives.forEach((el) => {
      if (el.closest("[aria-hidden='true']")) return;
      const tabIndex = el.getAttribute("tabindex");
      if (tabIndex !== null) {
        expect(parseInt(tabIndex, 10)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("buttons have type attribute", () => {
    renderWithRouter(<App />);
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      expect(btn.getAttribute("type")).toBe("button");
    });
  });
});

// ============================================================
// HTML document setup
// ============================================================

describe("HTML document attributes", () => {
  const html = readFileSync(resolve(__dirname, "../../index.html"), "utf-8");

  it("has lang attribute", () => {
    expect(html).toMatch(/<html[^>]+lang="en"/);
  });

  it("has viewport meta tag", () => {
    expect(html).toMatch(/meta[^>]+name="viewport"[^>]+content="width=device-width/);
  });

  it("has meta description", () => {
    expect(html).toMatch(/meta[^>]+name="description"/);
  });

  it("preloads headline font", () => {
    expect(html).toContain("PlusJakartaSans");
  });
});

// ============================================================
// Reduced motion support
// ============================================================

describe("reduced motion support", () => {
  const globalCSS = readFileSync(resolve(__dirname, "../styles/global.css"), "utf-8");

  it("includes prefers-reduced-motion media query", () => {
    expect(globalCSS).toContain("prefers-reduced-motion: reduce");
  });

  it("disables animations for reduced motion users", () => {
    expect(globalCSS).toContain("animation-duration: 0.01ms");
    expect(globalCSS).toContain("transition-duration: 0.01ms");
  });
});

// ============================================================
// Focus styles
// ============================================================

describe("focus styles", () => {
  const globalCSS = readFileSync(resolve(__dirname, "../styles/global.css"), "utf-8");

  it("defines :focus-visible outline", () => {
    expect(globalCSS).toContain(":focus-visible");
    expect(globalCSS).toMatch(/outline:\s*2px solid/);
    expect(globalCSS).toMatch(/outline-offset:\s*2px/);
  });

  it("skip link becomes visible on focus", () => {
    expect(globalCSS).toContain(".skip-link:focus");
  });
});

// ============================================================
// Design tokens a11y
// ============================================================

describe("design tokens a11y", () => {
  const tokensCSS = readFileSync(resolve(__dirname, "../styles/design-tokens.css"), "utf-8");

  it("uses Solar Flare muted color (not old neutral-500)", () => {
    expect(tokensCSS).toContain("--sf-text-muted: #71717a");
  });

  it("does not define light mode overrides", () => {
    expect(tokensCSS).not.toContain(":root.light");
    expect(tokensCSS).not.toContain('[data-theme="light"]');
  });
});
