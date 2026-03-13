import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const tokensCSS = readFileSync(
  resolve(__dirname, "../styles/design-tokens.css"),
  "utf-8",
);

describe("design tokens", () => {
  it("defines Solar Flare background tokens", () => {
    expect(tokensCSS).toContain("--sf-bg-void: #06060e");
    expect(tokensCSS).toContain("--sf-bg-space: #0a0a14");
    expect(tokensCSS).toContain("--sf-bg-elevated: #10101c");
    expect(tokensCSS).toContain("--sf-bg-surface: #161625");
  });

  it("defines gradient arc", () => {
    expect(tokensCSS).toContain("--sf-gradient-arc");
    expect(tokensCSS).toContain("#f59e0b");
    expect(tokensCSS).toContain("#f43f5e");
    expect(tokensCSS).toContain("#8b5cf6");
  });

  it("defines amber accent", () => {
    expect(tokensCSS).toContain("--sf-accent: #f59e0b");
    expect(tokensCSS).toContain("--sf-accent-hover: #fbbf24");
    expect(tokensCSS).toContain("--sf-accent-pressed: #d97706");
  });

  it("defines text colors", () => {
    expect(tokensCSS).toContain("--sf-text-primary: #fafaf9");
    expect(tokensCSS).toContain("--sf-text-secondary: #a1a1aa");
    expect(tokensCSS).toContain("--sf-text-muted: #71717a");
    expect(tokensCSS).toContain("--sf-text-accent: #f59e0b");
  });

  it("defines Plus Jakarta Sans for headlines", () => {
    expect(tokensCSS).toContain("--sf-font-display");
    expect(tokensCSS).toContain("Plus Jakarta Sans");
  });

  it("defines Inter for body text", () => {
    expect(tokensCSS).toContain("--sf-font-body");
    expect(tokensCSS).toContain("Inter");
  });

  it("defines complete type scale", () => {
    expect(tokensCSS).toContain("--sf-text-hero");
    expect(tokensCSS).toContain("--sf-text-h1");
    expect(tokensCSS).toContain("--sf-text-h2");
    expect(tokensCSS).toContain("--sf-text-h3");
    expect(tokensCSS).toContain("--sf-text-body");
    expect(tokensCSS).toContain("--sf-text-small");
    expect(tokensCSS).toContain("--sf-text-caption");
  });

  it("defines backward-compatible aliases", () => {
    expect(tokensCSS).toContain("--color-background: var(--sf-bg-void)");
    expect(tokensCSS).toContain("--color-text: var(--sf-text-primary)");
    expect(tokensCSS).toContain("--font-display: var(--sf-font-display)");
  });

  it("does not define light mode overrides", () => {
    expect(tokensCSS).not.toContain(":root.light");
    expect(tokensCSS).not.toContain('[data-theme="light"]');
  });

  it("uses glow effect tokens", () => {
    expect(tokensCSS).toContain("--sf-glow-sm");
    expect(tokensCSS).toContain("--sf-glow-md");
    expect(tokensCSS).toContain("--sf-glow-lg");
  });
});
