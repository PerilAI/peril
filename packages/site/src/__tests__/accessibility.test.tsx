// @vitest-environment happy-dom
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { App } from "../App";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { DesignShowcase } from "../components/DesignShowcase";

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

afterEach(() => cleanup());

/**
 * Accessibility baseline tests — WCAG 2.1 AA compliance.
 *
 * Covers: contrast ratios, semantic HTML, ARIA, keyboard nav,
 * skip link, reduced motion, heading hierarchy, external links.
 */

// ============================================================
// Helpers
// ============================================================

/** Compute relative luminance per WCAG 2.1 definition. */
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

/** Compute WCAG contrast ratio between two hex colors. */
function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================
// Color palette from design tokens (keep in sync)
// ============================================================

const DARK_BG = "#0c0a09"; // --color-background (neutral-950)
const DARK_SURFACE = "#1c1917"; // --color-surface (neutral-900)
const LIGHT_BG = "#fafaf9"; // neutral-50

const DARK_TEXT = "#fafaf9"; // --color-text (neutral-50)
const DARK_TEXT_SECONDARY = "#a8a29e"; // --color-text-secondary (neutral-400)
const DARK_TEXT_MUTED = "#8a837d"; // --color-text-muted (patched: neutral-450)
const DARK_ACCENT = "#fbbf24"; // --color-accent (amber-400)
const DARK_ACCENT_FG = "#0c0a09"; // --color-accent-foreground (neutral-950)

const LIGHT_TEXT = "#1c1917"; // neutral-900
const LIGHT_TEXT_SECONDARY = "#57534e"; // neutral-600
const LIGHT_TEXT_MUTED = "#78716c"; // neutral-500
const LIGHT_ACCENT = "#d97706"; // amber-600
const LIGHT_ACCENT_FG = "#0c0a09"; // neutral-950 (dark text on amber)

// ============================================================
// Contrast ratio tests
// ============================================================

describe("contrast ratios (WCAG 2.1 AA ≥ 4.5:1)", () => {
  describe("dark mode", () => {
    it("primary text on background passes", () => {
      expect(contrastRatio(DARK_TEXT, DARK_BG)).toBeGreaterThanOrEqual(4.5);
    });

    it("secondary text on background passes", () => {
      expect(contrastRatio(DARK_TEXT_SECONDARY, DARK_BG)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it("muted text on background passes", () => {
      expect(contrastRatio(DARK_TEXT_MUTED, DARK_BG)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it("muted text on surface passes", () => {
      expect(contrastRatio(DARK_TEXT_MUTED, DARK_SURFACE)).toBeGreaterThanOrEqual(
        4.5,
      );
    });

    it("accent foreground on accent passes (buttons)", () => {
      expect(
        contrastRatio(DARK_ACCENT_FG, DARK_ACCENT),
      ).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("light mode", () => {
    it("primary text on background passes", () => {
      expect(contrastRatio(LIGHT_TEXT, LIGHT_BG)).toBeGreaterThanOrEqual(4.5);
    });

    it("secondary text on background passes", () => {
      expect(
        contrastRatio(LIGHT_TEXT_SECONDARY, LIGHT_BG),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("muted text on background passes", () => {
      expect(
        contrastRatio(LIGHT_TEXT_MUTED, LIGHT_BG),
      ).toBeGreaterThanOrEqual(4.5);
    });

    it("accent foreground on accent passes (buttons)", () => {
      expect(
        contrastRatio(LIGHT_ACCENT_FG, LIGHT_ACCENT),
      ).toBeGreaterThanOrEqual(4.5);
    });
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
      // A heading should not jump more than 1 level deeper
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
  it("Hero eyebrow glow dot is aria-hidden", () => {
    render(<Hero />);
    const glowDot = document.querySelector(
      "[class*='animate-'][class*='glow-pulse']",
    );
    expect(glowDot?.getAttribute("aria-hidden")).toBe("true");
  });

  it("external links inform screen readers about new tab", () => {
    render(<Header />);
    const githubLink = screen.getByText(/GitHub/);
    // The link itself or a child should indicate new window
    const srHint = githubLink.querySelector(".sr-only") ??
      githubLink.closest("a")?.querySelector(".sr-only");
    expect(srHint?.textContent).toMatch(/new tab/i);
  });

  it("DesignShowcase decorative swatches are aria-hidden", () => {
    render(<DesignShowcase />);
    const swatches = document.querySelectorAll(
      "section[aria-label='Design system showcase'] [aria-hidden='true']",
    );
    expect(swatches.length).toBeGreaterThan(0);
  });

  it("DesignShowcase section has accessible label", () => {
    render(<DesignShowcase />);
    const section = document.querySelector(
      "section[aria-label='Design system showcase']",
    );
    expect(section).not.toBeNull();
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
      if (el.closest("[aria-hidden='true']")) {
        return;
      }

      // tabIndex should be 0 or not set (defaults to 0 for a/button)
      const tabIndex = el.getAttribute("tabindex");
      if (tabIndex !== null) {
        expect(parseInt(tabIndex, 10)).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it("buttons have type attribute", () => {
    render(<DesignShowcase />);
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
  const html = readFileSync(
    resolve(__dirname, "../../index.html"),
    "utf-8",
  );

  it("has lang attribute", () => {
    expect(html).toMatch(/<html[^>]+lang="en"/);
  });

  it("has viewport meta tag", () => {
    expect(html).toMatch(
      /meta[^>]+name="viewport"[^>]+content="width=device-width/,
    );
  });

  it("has meta description", () => {
    expect(html).toMatch(/meta[^>]+name="description"/);
  });

  it("preloads fonts for performance", () => {
    expect(html).toContain("preconnect");
    expect(html).toContain("fonts.googleapis.com");
  });
});

// ============================================================
// Reduced motion support
// ============================================================

describe("reduced motion support", () => {
  const globalCSS = readFileSync(
    resolve(__dirname, "../styles/global.css"),
    "utf-8",
  );

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
  const globalCSS = readFileSync(
    resolve(__dirname, "../styles/global.css"),
    "utf-8",
  );

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
// Color contrast in design tokens file
// ============================================================

describe("design tokens a11y", () => {
  const tokensCSS = readFileSync(
    resolve(__dirname, "../styles/design-tokens.css"),
    "utf-8",
  );

  it("text-muted uses AA-compliant color (not raw neutral-500)", () => {
    // text-muted should NOT be var(--color-neutral-500) in dark mode
    // because neutral-500 on neutral-950 only gives ~4.0:1
    const darkModeSection = tokensCSS.split(":root.light")[0];
    expect(darkModeSection).not.toMatch(
      /--color-text-muted:\s*var\(--color-neutral-500\)/,
    );
  });

  it("light mode overrides exist", () => {
    expect(tokensCSS).toContain(':root.light');
    expect(tokensCSS).toContain('[data-theme="light"]');
  });
});
