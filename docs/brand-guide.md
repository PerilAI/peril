# Peril -- Brand Identity Guide

**Date:** 2026-03-10
**Author:** CMO
**Issue:** PER-85

---

## 1. Brand Philosophy

Peril's brand is an extension of its voice: sharp, technical, confident, never flashy. We look like a tool built by engineers, because we are. The brand should feel precise and trustworthy, not corporate or trendy.

**Lean startup principle:** Don't invest heavily in brand identity before product-market fit. Establish the minimum visual identity needed for consistency, then evolve it as the product and audience mature.

This guide covers the essentials. A full brand system (custom illustrations, motion guidelines, comprehensive asset library) comes after the marketing site design system is finalized by the Frontend Engineer.

---

## 2. Brand Attributes

| Attribute | Expression |
|---|---|
| **Precise** | Clean lines, consistent spacing, no decoration for decoration's sake |
| **Technical** | Monospace accents, code-like elements, developer-native patterns |
| **Confident** | Bold typography, declarative messaging, no hedging |
| **Trustworthy** | Consistent application, professional quality, no gimmicks |
| **Developer-first** | Tools over toys, substance over style |

---

## 3. Logo

### 3.1 Logo Usage

The Peril logo has two forms:

1. **Wordmark:** "peril" in the headline typeface (lowercase)
2. **Icon:** A simplified mark for small contexts (favicon, social avatars)

### 3.2 Logo Rules

- **Clear space:** Minimum clear space around the logo equals the height of the "p" in "peril"
- **Minimum size:** Wordmark: 80px wide on screen. Icon: 16px square.
- **No modifications:** Don't stretch, rotate, recolor outside brand palette, add effects, or combine with other logos
- **Background:** Use on dark backgrounds (primary) or light backgrounds (secondary). Ensure minimum 4.5:1 contrast ratio.

### 3.3 Favicon

- 32x32 and 16x16 pixel versions of the icon mark
- Must be legible at both sizes
- Single color (accent color on transparent background)

---

## 4. Color Palette

### 4.1 Core Colors

Colors should align with the marketing site design system (in progress with Frontend Engineer). These are starting recommendations per the design research in `docs/marketing-site-research.md`.

**Primary dark backgrounds:**

| Name | Value | Usage |
|---|---|---|
| Background | `#0a0a0f` | Page background |
| Surface | `#12121a` | Cards, panels |
| Border | `#1e1e2e` | Subtle borders, separators |

**Accent color:**

| Name | Value | Usage |
|---|---|---|
| Accent | TBD (warm amber or distinctive violet) | CTAs, highlights, links, selection cursor |
| Accent hover | TBD (lighter variant) | Hover states |

**Note:** The accent color is a key brand decision. Per design research, avoid blue (too crowded -- Linear, Vercel, GitHub all use blue/violet). Consider a warm amber/gold or a distinctive violet that stands apart. Final decision with Frontend Engineer when design system is built.

**Text colors:**

| Name | Value | Usage |
|---|---|---|
| Primary text | `#f0f0f5` | Headlines, body text |
| Secondary text | `#8888a0` | Captions, labels, secondary info |
| Muted text | `#55556a` | Timestamps, metadata |

**Semantic colors:**

| Name | Value | Usage |
|---|---|---|
| Success | `#22c55e` | Resolved reviews, success states |
| Warning | `#eab308` | Caution states, severity "major" |
| Error | `#ef4444` | Error states, severity "critical" |
| Info | `#3b82f6` | Informational states |

### 4.2 Color Application Rules

1. **Dark mode is default.** All primary materials (site, docs, social cards) use dark backgrounds.
2. **Light mode is secondary.** Support light mode via the toggle, but design dark-first.
3. **4.5:1 contrast minimum** for all text on backgrounds (WCAG AA).
4. **Accent color is used sparingly.** CTAs, links, and key highlights only. Not backgrounds, not large areas.
5. **No gradients in body content.** Use solid colors. Gradients only for hero sections or decorative elements, per the design system.

---

## 5. Typography

### 5.1 Type System

Per design research, differentiate from the sans-serif monoculture:

| Role | Font | Weight | Usage |
|---|---|---|---|
| **Headlines** | TBD (serif or semi-serif, per Frontend Engineer) | Bold (700) | Hero, section heads, blog post titles |
| **Body** | Inter (or equivalent clean sans-serif) | Regular (400), Medium (500) | Body text, descriptions, UI labels |
| **Code** | JetBrains Mono (or equivalent) | Regular (400) | Code snippets, terminal output, install commands |

### 5.2 Type Scale

| Size | Usage |
|---|---|
| 48-64px | Hero headline |
| 32-40px | Section headlines |
| 24-28px | Sub-section headlines |
| 16-18px | Body text |
| 14px | Captions, labels |
| 12-13px | Code blocks, metadata |

### 5.3 Typography Rules

1. **One headline font + one body font + one code font.** Maximum three typefaces.
2. **Variable fonts preferred** for performance and smooth weight transitions.
3. **Line height:** 1.5 for body text, 1.2 for headlines.
4. **Maximum line width:** 65-75 characters for body text (readability).
5. **Left-aligned text** everywhere except centered hero headlines.

---

## 6. Imagery

### 6.1 Product Screenshots

Product screenshots are our primary visual asset. Rules:

- **Real product UI only.** Never use mockups or Figma screenshots that don't match the actual product.
- **Annotate when necessary.** Use arrows or highlights to draw attention, but keep annotations minimal.
- **Consistent viewport:** Capture at 1440x900 for desktop screenshots.
- **Dark mode default** for all product screenshots.
- **Clean state:** No personal data, no lorem ipsum, realistic-looking sample content.

### 6.2 Architecture Diagrams

- Use clean, minimal diagrams with brand colors
- Label everything clearly
- Flow direction: left-to-right or top-to-bottom
- Use consistent shapes: rounded rectangles for components, arrows for data flow
- No clip art, no 3D elements, no decorative icons

### 6.3 What We Don't Use

- Stock photos (especially people coding on laptops)
- Abstract 3D renders
- AI-generated decorative images
- Decorative illustrations that don't explain the product
- Screenshots of competitor products (in our own materials)

---

## 7. Social Media Assets

### 7.1 Social Cards (og:image)

Every page needs an og:image for social sharing:

| Page Type | Card Design |
|---|---|
| **Homepage** | Logo + tagline + product screenshot |
| **Blog post** | Title + author + subtle brand background |
| **Docs page** | "Peril Docs: {page title}" + brand background |
| **Changelog** | "Peril v{version}: {headline}" + brand background |

**Dimensions:** 1200x630px (standard og:image)

### 7.2 Twitter/X Assets

| Asset | Dimensions | Notes |
|---|---|---|
| Profile picture | 400x400px | Logo icon on brand background |
| Banner | 1500x500px | Product screenshot or tagline |
| Tweet images | 1200x675px | Product GIFs or screenshots |

### 7.3 GitHub Assets

| Asset | Notes |
|---|---|
| Social preview | 1280x640px, product screenshot + tagline |
| README banner | Full-width, subtle, includes logo + one-liner |

---

## 8. Voice Reference

Peril's brand voice is defined in detail in `docs/copywriting-guide.md`. Quick reference:

| We Sound Like | We Don't Sound Like |
|---|---|
| A sharp senior engineer | A marketing department |
| Confident and specific | Hedging and vague |
| Technical when it serves clarity | Jargon for jargon's sake |
| Peer-level | Condescending or salesy |
| Dry wit (sparingly) | Forced humor or enthusiasm |

**Banned words and phrases:** "revolutionary," "game-changer," "blazing fast," "leverage," "synergy," "disrupt," "next-generation," "cutting-edge," "best-in-class" (unless backed by data).

---

## 9. Co-Branding Guidelines

### 9.1 Integration Partner Logos

When showing integration partners (Claude Code, Codex, Cursor):

- Use official logos from partner brand guidelines
- Don't modify partner logos (no recoloring, no effects)
- Give equal visual weight to each partner logo
- Include "Works with" or "Integrates with" label, not "Powered by" or "Partner"

### 9.2 "Built with Peril" Badge

For users who want to show they use Peril:

- Provide a simple badge (SVG + PNG) in light and dark variants
- Link badge to the Peril site
- Don't require the badge -- it's optional
- Keep it small and unobtrusive

### 9.3 Open Source Badge

GitHub-style badges for READMEs:

```
[![Peril](https://img.shields.io/badge/reviewed_with-peril-{accent-color})](https://peril.dev)
```

---

## 10. Asset Management

### 10.1 Asset Location

All brand assets live in:

```
packages/site/public/brand/
├── logo/
│   ├── peril-wordmark-dark.svg
│   ├── peril-wordmark-light.svg
│   ├── peril-icon-dark.svg
│   ├── peril-icon-light.svg
│   └── peril-favicon.ico
├── social/
│   ├── og-default.png
│   ├── twitter-banner.png
│   └── github-social-preview.png
├── badges/
│   ├── built-with-peril-dark.svg
│   └── built-with-peril-light.svg
└── screenshots/
    └── (product screenshots for marketing use)
```

### 10.2 File Formats

| Use Case | Format |
|---|---|
| Logos (web) | SVG (vector, scalable) |
| Logos (print/external) | PNG at 2x resolution |
| Social cards | PNG at exact dimensions |
| Favicon | ICO (multi-size) + PNG |
| Screenshots | PNG at 2x resolution |
| GIFs/demos | GIF or MP4 (< 5MB) |

---

## 11. Brand Evolution Roadmap

| Phase | Scope | Depends On |
|---|---|---|
| **V1 (now)** | Minimum viable brand: colors, type, logo, og:images | This document |
| **V2 (post-launch)** | Design system tokens, component library, illustration style | Frontend Engineer design system (PER-45-49) |
| **V3 (cloud launch)** | Full brand system: motion guidelines, email templates, deck template | Product maturity, revenue |
| **Scale** | Brand refresh based on audience feedback and market position | PMF confirmed |

---

## 12. Lean Startup Brand Principles

1. **Brand is a promise, not a logo.** Peril's brand is defined by the quality of the product and the consistency of the experience, not by visual assets. Get the product right first.

2. **Consistency > creativity.** Using the same colors, fonts, and voice everywhere matters more than having a "creative" brand. Developers trust consistency.

3. **Don't over-invest before PMF.** A clean logo, consistent colors, and clear voice are sufficient until product-market fit. Save the brand refresh for when you know your audience.

4. **The code is the brand.** For developers, the npm package, the GitHub repo, and the documentation ARE the brand experience. These matter more than the social media profile picture.

5. **Every touchpoint matters.** Error messages, README formatting, issue response time, email tone. Brand consistency extends beyond visual assets to every interaction.

6. **Steal from good taste, not from competitors.** Learn from Linear, Vercel, and Stripe's brand discipline, but don't copy their specific visual identity. Peril should look like Peril.
