import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tokensCSS = readFileSync(
  resolve(__dirname, "../styles/design-tokens.css"),
  "utf-8",
);

describe("design tokens", () => {
  it("defines amber accent palette", () => {
    expect(tokensCSS).toContain("--color-amber-400");
    expect(tokensCSS).toContain("--color-amber-500");
    expect(tokensCSS).toContain("--color-amber-600");
  });

  it("defines warm neutral palette (not pure gray)", () => {
    expect(tokensCSS).toContain("--color-neutral-950");
    // Warm neutrals — stone-tinted, not pure gray
    expect(tokensCSS).toContain("#0c0a09");
  });

  it("defines semantic tokens for dark mode", () => {
    expect(tokensCSS).toContain("--color-background");
    expect(tokensCSS).toContain("--color-surface");
    expect(tokensCSS).toContain("--color-text");
    expect(tokensCSS).toContain("--color-accent");
    expect(tokensCSS).toContain("--color-accent-foreground");
    expect(tokensCSS).toContain("--color-accent-muted");
  });

  it("defines serif display font for headlines", () => {
    expect(tokensCSS).toContain("--font-display");
    expect(tokensCSS).toContain("DM Serif Display");
  });

  it("defines Inter for body text", () => {
    expect(tokensCSS).toContain("--font-body");
    expect(tokensCSS).toContain("Inter");
  });

  it("defines complete type scale", () => {
    expect(tokensCSS).toContain("--text-hero");
    expect(tokensCSS).toContain("--text-h1");
    expect(tokensCSS).toContain("--text-h2");
    expect(tokensCSS).toContain("--text-h3");
    expect(tokensCSS).toContain("--text-h4");
    expect(tokensCSS).toContain("--text-body");
    expect(tokensCSS).toContain("--text-small");
    expect(tokensCSS).toContain("--text-caption");
  });

  it("uses 8px grid spacing system", () => {
    expect(tokensCSS).toContain("--space-2: 0.5rem"); // 8px
    expect(tokensCSS).toContain("--space-4: 1rem"); // 16px
    expect(tokensCSS).toContain("--space-8: 2rem"); // 32px
  });

  it("defines glow effect tokens for annotation cursor", () => {
    expect(tokensCSS).toContain("--glow-sm");
    expect(tokensCSS).toContain("--glow-md");
    expect(tokensCSS).toContain("--glow-lg");
  });

  it("defines light mode overrides", () => {
    expect(tokensCSS).toContain('.light');
    expect(tokensCSS).toContain('[data-theme="light"]');
  });

  it("does not use blue as primary accent", () => {
    // Accent should be amber/gold, not blue
    const accentSection = tokensCSS.match(
      /--color-accent:\s*var\(--color-(\w+)/,
    );
    expect(accentSection).toBeTruthy();
    expect(accentSection![1]).toContain("amber");
  });
});
