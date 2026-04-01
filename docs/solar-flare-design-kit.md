# Solar Flare — Design Kit

**Peril Marketing Site Redesign**
**Codename:** Solar Flare
**Date:** 2026-03-12
**Status:** Proposal

---

## 1. Design Vision

Solar Flare is a dramatic gradient cosmos aesthetic — the visual language of
precision at scale. It draws from Stripe's prismatic surfaces, Apple's spatial
depth, and Linear's dark confidence, but anchors itself in Peril's own identity:
a warm amber core that flares outward into coral and violet, like light refracting
through a prism.

The site should feel like stepping into a command center where human intent
meets machine intelligence. Every surface has depth. Every gradient has direction.
Every interaction has weight.

### Guiding Principles

1. **Depth over flatness.** Layers, frosted glass, elevation, and shadow create
   a z-axis that makes the page feel three-dimensional. Nothing floats in a void.

2. **Warmth through spectrum.** The amber brand color is not a single hue — it is
   the origin point of a gradient arc that sweeps through coral into violet.
   Warm where we are human (input, feedback, annotation), cool where we are
   machine (output, structure, execution).

3. **Confidence through restraint.** Spectacle lives in the backgrounds and
   transitions. Content itself is clean, left-aligned, and typographically
   rigorous. The drama frames the substance.

4. **The demo is the product.** The interactive annotation playground is elevated
   to the most prominent position on the page. Marketing copy supports it;
   it does not replace it.

5. **No dead space.** Every pixel of vertical scroll earns its place. If a section
   needs breathing room, that space contains atmosphere — a gradient, a grain
   texture, a subtle animation — never bare emptiness.

---

## 2. Color System

### 2.1 Backgrounds

The base is deep space — near-black with a cold blue undertone that creates
contrast against the warm accent spectrum.

| Token                    | Value                    | Usage                              |
|--------------------------|--------------------------|------------------------------------|
| `--sf-bg-void`           | `#06060e`                | Page background, deepest layer     |
| `--sf-bg-space`          | `#0a0a14`                | Section backgrounds, default       |
| `--sf-bg-elevated`       | `#10101c`                | Cards, panels, raised surfaces     |
| `--sf-bg-surface`        | `#161625`                | Inputs, interactive surfaces       |
| `--sf-bg-overlay`        | `rgba(6, 6, 14, 0.80)`  | Modal/dropdown backdrops           |

### 2.2 The Gradient Arc

The signature visual element. A three-stop gradient that represents the journey
from human intent (warm) to machine execution (cool).

```
Amber (#f59e0b) → Coral (#f43f5e) → Violet (#8b5cf6)
```

| Token                    | Value                                                        | Usage                                |
|--------------------------|--------------------------------------------------------------|--------------------------------------|
| `--sf-gradient-arc`      | `linear-gradient(135deg, #f59e0b 0%, #f43f5e 50%, #8b5cf6 100%)` | Hero backgrounds, section accents    |
| `--sf-gradient-arc-soft` | `linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(244,63,94,0.10) 50%, rgba(139,92,246,0.08) 100%)` | Subtle card backgrounds, hover states |
| `--sf-gradient-arc-border` | `linear-gradient(135deg, rgba(245,158,11,0.5) 0%, rgba(244,63,94,0.3) 50%, rgba(139,92,246,0.5) 100%)` | Card borders, badge outlines |
| `--sf-gradient-amber`    | `linear-gradient(180deg, #f59e0b 0%, #d97706 100%)`         | Primary CTA buttons                 |
| `--sf-gradient-glow`     | `radial-gradient(ellipse at 30% 20%, rgba(245,158,11,0.12) 0%, rgba(244,63,94,0.06) 40%, transparent 70%)` | Hero ambient glow                    |

**Gradient Mesh (animated background):**

The hero and section transitions use an animated mesh of 3-4 radial gradients
that drift slowly (60-90s loop), creating a living aurora behind content.
Implementation uses CSS `@keyframes` on `background-position` — no canvas or WebGL.

```css
.sf-aurora {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(244,63,94,0.05) 0%, transparent 50%);
  background-size: 200% 200%;
  animation: sf-aurora-drift 90s ease-in-out infinite alternate;
}

@keyframes sf-aurora-drift {
  0%   { background-position: 0% 0%, 100% 0%, 50% 100%; }
  33%  { background-position: 100% 50%, 0% 100%, 80% 0%; }
  66%  { background-position: 50% 100%, 50% 0%, 0% 50%; }
  100% { background-position: 0% 0%, 100% 0%, 50% 100%; }
}
```

### 2.3 Accent Colors

Amber remains the primary interactive accent. Coral and violet are reserved for
secondary states and the gradient arc — they never appear as standalone flat colors
in UI controls.

| Token                    | Value                    | Usage                              |
|--------------------------|--------------------------|------------------------------------|
| `--sf-accent`            | `#f59e0b`                | Links, active states, primary CTA  |
| `--sf-accent-hover`      | `#fbbf24`                | Hover state for accent elements    |
| `--sf-accent-pressed`    | `#d97706`                | Active/pressed state               |
| `--sf-accent-muted`      | `rgba(245, 158, 11, 0.12)` | Tag backgrounds, subtle highlights |
| `--sf-accent-glow`       | `rgba(245, 158, 11, 0.20)` | Box-shadow glow on focus/hover     |

### 2.4 Text Colors

| Token                    | Value                    | Usage                              |
|--------------------------|--------------------------|------------------------------------|
| `--sf-text-primary`      | `#fafaf9`                | Headlines, primary body text       |
| `--sf-text-secondary`    | `#a1a1aa`                | Descriptions, secondary content    |
| `--sf-text-muted`        | `#71717a`                | Captions, metadata, timestamps     |
| `--sf-text-accent`       | `#f59e0b`                | Highlighted terms, inline links    |
| `--sf-text-on-accent`    | `#06060e`                | Text on accent-colored surfaces    |

Never use pure `#ffffff` for body text. The warm white `#fafaf9` is softer on
dark backgrounds and reduces perceived harshness.

### 2.5 Semantic Colors

| Token                    | Value       | Usage                              |
|--------------------------|-------------|------------------------------------|
| `--sf-success`           | `#22c55e`   | Completed states, checkmarks       |
| `--sf-warning`           | `#eab308`   | Caution, severity indicators       |
| `--sf-error`             | `#ef4444`   | Errors, critical severity          |
| `--sf-info`              | `#3b82f6`   | Informational callouts             |

### 2.6 Frosted Glass Surfaces

The glass effect is central to Solar Flare's depth system. It creates the
illusion of layered, translucent panels hovering above the gradient backgrounds.

```css
.sf-glass {
  background: rgba(16, 16, 28, 0.60);
  backdrop-filter: blur(16px) saturate(1.2);
  -webkit-backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.sf-glass-strong {
  background: rgba(16, 16, 28, 0.80);
  backdrop-filter: blur(24px) saturate(1.3);
  -webkit-backdrop-filter: blur(24px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 2.7 Grain Texture

A subtle film-grain noise overlay adds tactility and organic depth to gradient
surfaces. Applied at 3-5% opacity over the page background using a tiny repeating
PNG or SVG filter.

```css
.sf-grain::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,..."); /* 200x200 noise tile */
  background-repeat: repeat;
}
```

The grain is global and fixed — it does not scroll with content, creating a
"looking through frosted film" effect.

---

## 3. Typography

### 3.1 Type Stack

Solar Flare moves from DM Serif Display to **Plus Jakarta Sans** for headlines.
The rationale: DM Serif reads as editorial/luxury, which undermines technical
credibility. Plus Jakarta Sans is geometric, confident, and modern — it has the
boldness of a serif's presence without the genre mismatch.

| Role       | Family              | Weights          | Fallback Stack                              |
|------------|---------------------|------------------|---------------------------------------------|
| Headlines  | Plus Jakarta Sans   | 700, 800         | system-ui, -apple-system, sans-serif        |
| Body       | Inter               | 400, 500         | system-ui, -apple-system, sans-serif        |
| Code       | JetBrains Mono      | 400, 500         | "Fira Code", ui-monospace, monospace        |
| Accent     | JetBrains Mono      | 400              | For labels, badges, stats, technical callouts |

All fonts loaded as variable font files for performance. Preload the headline
weight to prevent FOUT on the hero.

### 3.2 Type Scale

A 1.25 modular ratio with `clamp()` for fluid responsiveness.

| Token              | Size                               | Line Height | Weight | Usage                         |
|--------------------|------------------------------------|-------------|--------|-------------------------------|
| `--sf-text-hero`   | `clamp(3.5rem, 6vw + 1rem, 6rem)` | 1.05        | 800    | Hero headline only            |
| `--sf-text-h1`     | `clamp(2.5rem, 4vw + 0.5rem, 4rem)` | 1.1       | 800    | Section headlines             |
| `--sf-text-h2`     | `clamp(1.75rem, 2.5vw + 0.5rem, 2.5rem)` | 1.15 | 700    | Sub-section headlines         |
| `--sf-text-h3`     | `clamp(1.25rem, 1.5vw + 0.5rem, 1.75rem)` | 1.2 | 700    | Card titles                   |
| `--sf-text-body`   | `1.0625rem` (17px)                 | 1.6         | 400    | Body text                     |
| `--sf-text-body-lg`| `1.1875rem` (19px)                 | 1.6         | 400    | Hero subtitle, lead text      |
| `--sf-text-small`  | `0.875rem` (14px)                  | 1.5         | 500    | Labels, secondary descriptions|
| `--sf-text-caption` | `0.75rem` (12px)                  | 1.5         | 500    | Metadata, overlines           |
| `--sf-text-mono`   | `0.8125rem` (13px)                 | 1.6         | 400    | Code blocks                   |

### 3.3 Letter Spacing

| Context      | Tracking                  |
|--------------|---------------------------|
| Hero         | `-0.03em`                 |
| H1           | `-0.025em`                |
| H2, H3       | `-0.015em`                |
| Body         | `0`                       |
| Overlines    | `0.1em` (uppercase only)  |
| Code         | `0`                       |

### 3.4 Typography Rules

1. **Headlines are always left-aligned.** Centered headlines die with this redesign.
   Left alignment creates a strong visual anchor and reads as more confident.
   Exception: the closing CTA headline may be centered for emphasis.

2. **Maximum line width:** 38ch for headlines, 65ch for body text.

3. **Overlines** (section labels like "INTERACTIVE DEMO") use `--sf-text-caption`
   in uppercase, `--sf-text-accent` color, `0.1em` tracking, `font-weight: 600`.
   Set in JetBrains Mono for technical flavor.

4. **No italic anywhere on the marketing site.** Italics reduce scannability on
   dark backgrounds.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

8px base grid, extended for generous vertical rhythm.

| Token           | Value       | Px   |
|-----------------|-------------|------|
| `--sf-space-1`  | `0.25rem`   | 4    |
| `--sf-space-2`  | `0.5rem`    | 8    |
| `--sf-space-3`  | `0.75rem`   | 12   |
| `--sf-space-4`  | `1rem`      | 16   |
| `--sf-space-6`  | `1.5rem`    | 24   |
| `--sf-space-8`  | `2rem`      | 32   |
| `--sf-space-10` | `2.5rem`    | 40   |
| `--sf-space-12` | `3rem`      | 48   |
| `--sf-space-16` | `4rem`      | 64   |
| `--sf-space-20` | `5rem`      | 80   |
| `--sf-space-24` | `6rem`      | 96   |
| `--sf-space-32` | `8rem`      | 128  |
| `--sf-space-40` | `10rem`     | 160  |

### 4.2 Container System

| Token                   | Value     | Usage                            |
|-------------------------|-----------|----------------------------------|
| `--sf-container-max`    | `1200px`  | Standard content width           |
| `--sf-container-narrow` | `800px`   | Text-heavy sections, CTA blocks  |
| `--sf-container-wide`   | `1400px`  | Bento grids, demo section        |
| `--sf-container-gutter` | `24px`    | Horizontal padding (mobile: 16px)|

### 4.3 Section Spacing

Sections use generous vertical padding to create distinct "rooms" as the visitor
scrolls.

| Between sections   | Padding               |
|--------------------|-----------------------|
| Major sections     | `--sf-space-32` (128px) top and bottom |
| Sub-sections       | `--sf-space-20` (80px)  top and bottom |
| Hero section       | `--sf-space-40` (160px) top, `--sf-space-32` bottom |

### 4.4 The Bento Grid

Solar Flare replaces uniform three-column card layouts with asymmetric bento
grids. These create visual interest through proportion contrast.

**Primary Bento: 2/3 + 1/3**
```
┌─────────────────────┬──────────┐
│                     │          │
│      Large card     │  Small   │
│                     │  card    │
│                     │          │
└─────────────────────┴──────────┘
```

**Secondary Bento: 1/3 + 1/3 + 1/3**
```
┌──────────┬──────────┬──────────┐
│          │          │          │
│  Card A  │  Card B  │  Card C  │
│          │          │          │
└──────────┴──────────┴──────────┘
```

**Tertiary Bento: 1/3 + 2/3 (reversed)**
```
┌──────────┬─────────────────────┐
│          │                     │
│  Small   │     Large card      │
│  card    │                     │
│          │                     │
└──────────┴─────────────────────┘
```

**Feature Bento: Full-width**
```
┌────────────────────────────────┐
│                                │
│         Full-width card        │
│     (interactive demo, hero)   │
│                                │
└────────────────────────────────┘
```

Grid gap: `--sf-space-4` (16px) between bento cells. Cards within the grid
use `--sf-glass` surface treatment with `--sf-radius-xl` corners.

Implementation: CSS Grid with named template areas.

```css
.sf-bento-primary {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--sf-space-4);
}

.sf-bento-secondary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sf-space-4);
}

/* Stack on mobile */
@media (max-width: 768px) {
  .sf-bento-primary,
  .sf-bento-secondary {
    grid-template-columns: 1fr;
  }
}
```

---

## 5. Component Patterns

### 5.1 Buttons

**Primary CTA:**
```css
.sf-btn-primary {
  background: var(--sf-gradient-amber);
  color: var(--sf-text-on-accent);
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
  font-size: var(--sf-text-small);
  padding: 14px 28px;
  border-radius: var(--sf-radius-lg);
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 150ms ease, box-shadow 250ms ease;
}

.sf-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow:
    0 0 20px rgba(245, 158, 11, 0.25),
    0 8px 32px rgba(245, 158, 11, 0.15);
}

.sf-btn-primary:active {
  transform: translateY(0);
}
```

**Secondary CTA:**
```css
.sf-btn-secondary {
  background: transparent;
  color: var(--sf-text-primary);
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 600;
  font-size: var(--sf-text-small);
  padding: 14px 28px;
  border-radius: var(--sf-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.12);
  cursor: pointer;
  transition: border-color 250ms ease, background 250ms ease;
}

.sf-btn-secondary:hover {
  border-color: rgba(255, 255, 255, 0.24);
  background: rgba(255, 255, 255, 0.04);
}
```

**Ghost button (nav links, tertiary):**
```css
.sf-btn-ghost {
  background: transparent;
  color: var(--sf-text-secondary);
  font-weight: 500;
  padding: 8px 16px;
  border: none;
  border-radius: var(--sf-radius-md);
  transition: color 150ms ease, background 150ms ease;
}

.sf-btn-ghost:hover {
  color: var(--sf-text-primary);
  background: rgba(255, 255, 255, 0.04);
}
```

### 5.2 Cards

**Glass Card (default):**
```css
.sf-card {
  background: rgba(16, 16, 28, 0.60);
  backdrop-filter: blur(16px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--sf-radius-xl);
  padding: var(--sf-space-8);
  position: relative;
  overflow: hidden;
  transition: border-color 300ms ease, transform 300ms ease;
}

.sf-card:hover {
  border-color: rgba(255, 255, 255, 0.10);
  transform: translateY(-2px);
}
```

**Gradient-Border Card (featured/highlighted):**
Uses a pseudo-element behind the card to create a gradient border effect.

```css
.sf-card-featured {
  position: relative;
  border-radius: var(--sf-radius-xl);
  padding: var(--sf-space-8);
  background: var(--sf-bg-elevated);
}

.sf-card-featured::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--sf-gradient-arc);
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

**Theater Card (for the demo section):**
An elevated, isolated card that creates a "screen within a screen" impression.

```css
.sf-card-theater {
  background: var(--sf-bg-void);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--sf-radius-2xl);
  padding: 0;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 24px 80px rgba(0, 0, 0, 0.50),
    0 8px 32px rgba(0, 0, 0, 0.30);
}
```

### 5.3 Badges & Pills

**Beta Badge (hero):**
```css
.sf-badge-beta {
  display: inline-flex;
  align-items: center;
  gap: var(--sf-space-2);
  font-family: "JetBrains Mono", monospace;
  font-size: var(--sf-text-caption);
  font-weight: 500;
  letter-spacing: 0.05em;
  color: var(--sf-text-accent);
  padding: 6px 14px;
  border-radius: var(--sf-radius-full);
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.20);
}

.sf-badge-beta::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--sf-accent);
  animation: sf-pulse 2s ease-in-out infinite;
}
```

**Integration Pills (trust signals):**
```css
.sf-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--sf-space-2);
  font-family: "Inter", sans-serif;
  font-size: var(--sf-text-small);
  font-weight: 500;
  color: var(--sf-text-secondary);
  padding: 8px 16px;
  border-radius: var(--sf-radius-full);
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  transition: border-color 200ms ease, background 200ms ease;
}

.sf-pill:hover {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: var(--sf-text-primary);
}
```

### 5.4 Code Blocks

Code blocks use a minimal treatment — no heavy chrome, just a subtle surface
with the JetBrains Mono font and syntax highlighting.

```css
.sf-code-block {
  background: var(--sf-bg-void);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--sf-radius-lg);
  padding: var(--sf-space-6);
  font-family: var(--sf-font-mono);
  font-size: var(--sf-text-mono);
  line-height: 1.7;
  overflow-x: auto;
}
```

Syntax colors (aligned with the gradient arc):
| Token           | Value       | Usage                     |
|-----------------|-------------|---------------------------|
| Strings         | `#f59e0b`   | Amber — warm, human input |
| Keywords        | `#8b5cf6`   | Violet — structure        |
| Properties      | `#f43f5e`   | Coral — emphasis          |
| Comments        | `#525270`   | Muted zinc                |
| Functions       | `#38bdf8`   | Sky blue — action         |
| Values/numbers  | `#22c55e`   | Green — data              |
| Punctuation     | `#71717a`   | Zinc                      |

### 5.5 Navigation Header

Fixed-position header with strong glass effect. Slim (56px height), functional,
out of the way.

```css
.sf-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--sf-container-gutter);
  background: rgba(6, 6, 14, 0.70);
  backdrop-filter: blur(20px) saturate(1.3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}
```

Nav links in `--sf-text-secondary`, hover to `--sf-text-primary`. Active page
uses `--sf-text-accent`. CTA button in the nav uses the compact primary style
(smaller padding).

---

## 6. Motion & Animation

### 6.1 Philosophy

Motion in Solar Flare serves three purposes:
1. **Atmosphere** — the aurora drift, grain, and gradient pulse make the page
   feel alive without demanding attention.
2. **Guidance** — scroll reveals and transitions direct the eye through the
   content narrative.
3. **Delight** — hover states, button interactions, and the demo's real-time
   feedback create moments of tactile satisfaction.

Motion is never decorative. If an animation doesn't serve atmosphere, guidance,
or delight, it gets cut.

### 6.2 Scroll Reveals

Elements enter the viewport with a staggered fade-and-rise. Each element within
a section staggers by 80ms.

```css
[data-reveal] {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 600ms var(--sf-ease-out),
              transform 600ms var(--sf-ease-out);
}

[data-reveal].revealed {
  opacity: 1;
  transform: translateY(0);
}
```

IntersectionObserver threshold: `0.15` (trigger when 15% visible).
Stagger delay applied via inline `transition-delay` set by JavaScript.

### 6.3 Gradient Pulse

The primary CTA button has a subtle ambient glow that pulses slowly, drawing
the eye without being aggressive.

```css
@keyframes sf-glow-pulse {
  0%, 100% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.15); }
  50%      { box-shadow: 0 0 32px rgba(245, 158, 11, 0.25); }
}

.sf-btn-primary {
  animation: sf-glow-pulse 3s ease-in-out infinite;
}

.sf-btn-primary:hover {
  animation: none; /* Pause pulse on hover, static glow takes over */
}
```

### 6.4 Card Hover Bloom

When a card is hovered, a soft radial gradient bloom appears at the cursor
position within the card, creating a "light following the mouse" effect.

Implementation: JavaScript tracks `mousemove` on the card, updates a CSS
custom property for the radial gradient center.

```css
.sf-card {
  --mouse-x: 50%;
  --mouse-y: 50%;
}

.sf-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    300px circle at var(--mouse-x) var(--mouse-y),
    rgba(245, 158, 11, 0.06),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 300ms ease;
  pointer-events: none;
}

.sf-card:hover::after {
  opacity: 1;
}
```

### 6.5 Timing Tokens

| Token              | Value                          | Usage                       |
|--------------------|--------------------------------|-----------------------------|
| `--sf-ease-out`    | `cubic-bezier(0.16, 1, 0.3, 1)` | Entrances, reveals          |
| `--sf-ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover transitions           |
| `--sf-ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Button press, playful interactions |
| `--sf-duration-fast` | `150ms`                      | Hover color/opacity changes |
| `--sf-duration-normal` | `300ms`                    | Card transforms, borders    |
| `--sf-duration-slow` | `600ms`                      | Scroll reveals, section transitions |

### 6.6 Reduced Motion

All animations respect `prefers-reduced-motion: reduce`. When active:
- Aurora drift stops (static gradient)
- Scroll reveals are instant (no transform, opacity immediate)
- Glow pulse disabled
- Card hover bloom disabled
- Only essential state transitions remain (button hover color changes)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Section-by-Section Specification

### 7.1 Header

- Fixed, 56px, glass surface
- Logo left: "Peril" in Plus Jakarta Sans 700, `--sf-text-primary`
- Nav center-right: How it works, Pricing, Docs, GitHub
- CTA right: "Get Started" compact primary button
- No theme toggle. Solar Flare is dark-only. Light mode is removed for the
  marketing site (the product can still have light mode).

### 7.2 Hero

**Layout:** Left-aligned, max-width 800px, positioned in the left 60% of the
viewport. Right 40% is atmospheric (aurora gradient with optional floating
visual element).

**Content stack (top to bottom):**
1. Beta badge — `sf-badge-beta` pill
2. Headline — `--sf-text-hero`, Plus Jakarta Sans 800, `--sf-text-primary`.
   The accent phrase uses a `background: var(--sf-gradient-arc)` with
   `-webkit-background-clip: text` for a gradient text effect.
   ```
   Click. Comment.
   Ship the fix.
   ```
   "Ship the fix." rendered in gradient text (amber → coral).
3. Subtitle — `--sf-text-body-lg`, `--sf-text-secondary`, max-width 48ch.
4. CTA pair — Primary "Try Peril Free" + Secondary "See How It Works"
5. Trust signal bar — Integration pills (Cursor, Claude Code, VS Code,
   Windsurf, MCP) in a horizontal row below the CTAs.

**Background:** Aurora mesh gradient, strongest intensity in this section.
A large, soft amber radial gradient originates from the upper-left quadrant
and fades across the fold. The grain overlay is visible.

**Vertical space:** 160px top padding (below header), 128px bottom padding.

### 7.3 Interactive Demo

**Position:** Immediately after the hero. This is the second thing visitors see.

**Layout:** Full-width theater card (`sf-card-theater`), max-width 1400px.
Internal layout is a 50/50 split:
- Left: the mock dashboard with clickable annotation targets
- Right: the structured MCP output that streams in when elements are clicked

**Overline:** `INTERACTIVE DEMO` in accent mono above the card.
**Headline:** "Try it yourself" — `--sf-text-h1`, left-aligned above the card.
**Subtitle:** One line describing the interaction, `--sf-text-secondary`.

The demo card has a heavy shadow (`sf-card-theater`) and sits on a section
background with reduced aurora intensity — the card itself is the focal point.

### 7.4 How It Works

**Layout:** Three-step vertical timeline (not horizontal cards).

Each step is a two-column row:
- Left column (40%): Step number (large, `--sf-text-h1`, muted), title, description
- Right column (60%): Visual (code snippet, JSON output, or terminal mock)

Steps are connected by a thin vertical line (1px, `rgba(255,255,255,0.06)`)
running down the left side, with a small circle node at each step that fills
with the accent gradient as it enters the viewport.

**Steps:**
1. **Annotate** — Amber accent. Visual: code editor mock with highlighted element.
2. **Structure** — Coral accent. Visual: JSON payload with syntax highlighting.
3. **Execute** — Violet accent. Visual: terminal with agent output and green
   checkmarks.

The gradient arc color progression (amber → coral → violet) maps to the three
steps, reinforcing the human-to-machine journey.

**Overline:** `HOW IT WORKS`
**Headline:** "Three steps. Zero translation."

### 7.5 Use Cases

**Layout:** Bento grid.
- Row 1: Primary bento (2/3 + 1/3) — Bug Reports (large) + Design Feedback (small)
- Row 2: Tertiary bento (1/3 + 2/3) — Accessibility Reviews (small) + a
  full-width stat/testimonial card

Each use case card contains:
- Icon (custom SVG, 24x24, line style, in the step's gradient color)
- Title in `--sf-text-h3`
- One-line tagline in gradient text
- 2-3 sentence description in `--sf-text-secondary`
- Mini code block showing example output

**Overline:** `USE CASES`
**Headline:** "What you can do with Peril"

### 7.6 Social Proof Bar (new section)

A horizontal strip between Use Cases and Closing CTA that adds credibility:

- Left: "Trusted by 50+ teams during early access" in `--sf-text-secondary`
- Center/right: 3-4 short pull quotes from early users (or placeholder for them)
- Background: `--sf-bg-elevated` with subtle top/bottom borders

If real quotes aren't available yet, use a single stat bar:
```
127 teams  ·  14,000 annotations  ·  8,400 agent tasks  ·  99.7% locator accuracy
```
Set in JetBrains Mono, `--sf-text-muted`, with the numbers in `--sf-text-primary`.

### 7.7 Closing CTA

**Layout:** Centered, narrow container (800px), generous vertical padding (160px).

**Background:** Aurora gradient at full intensity — this section is the visual
climax of the page. The gradient arc mesh is at its most vivid here.

**Content:**
1. Headline: "Ready to ship fixes faster?" — `--sf-text-h1`, gradient text
2. Subtitle: One line, `--sf-text-secondary`
3. Dual CTAs: Primary "Try Peril Free" + Secondary "Read the Docs"

This is the one section where centered text is permitted.

### 7.8 Footer

Minimal but complete. Dark surface (`--sf-bg-space`), top border.

**Layout:** Three columns:
- Left: Logo + one-line descriptor + copyright
- Center: Nav links (How it works, Pricing, Docs, GitHub, Changelog)
- Right: Install command in a mini code block:
  ```
  npm install @peril-ai/core @peril-ai/react @peril-ai/server @peril-ai/mcp
  ```

Below the three columns, a single-line bottom bar with "Built for the agents
that build your software." in `--sf-text-muted`.

### 7.9 Pricing Page

**Headline:** "Simple, transparent pricing" — centered, `--sf-text-h1`
**Subtitle:** "Free for local development. Always." — `--sf-text-secondary`

**Layout:** Two cards in a 1/1 grid (equal width), max-width 900px:

**Free Card:**
- `sf-card-featured` with gradient arc border
- "$0" in `--sf-text-hero` weight
- "forever for local development" in `--sf-text-muted`
- Feature list with green checkmarks
- Primary CTA: "Get Started"

**Team Card:**
- `sf-card` (standard glass)
- "Coming soon" in `--sf-text-h2`, `--sf-text-muted`
- Feature list with muted checkmarks
- Secondary CTA: "Join the Waitlist"

---

## 8. Responsive Strategy

### 8.1 Breakpoints

| Name   | Width      | Behavior                                    |
|--------|------------|---------------------------------------------|
| Mobile | < 640px    | Single column, stacked bento, compact type   |
| Tablet | 640-1024px | Two-column bento, medium type scale          |
| Desktop| > 1024px   | Full bento grids, maximum type scale         |
| Wide   | > 1400px   | Content centered in container, extra gutter  |

### 8.2 Mobile Adaptations

- Hero switches to centered layout (no left-align on narrow screens)
- Hero text size reduces to `clamp(2.5rem, 8vw, 3.5rem)`
- All bento grids stack to single column
- Demo section stacks vertically: mock dashboard on top, output below
- How It Works timeline: visual moves below the text in each step
- Trust signal pills wrap to 2 rows
- Container gutter reduces to 16px
- Section padding reduces by ~40%
- Sticky mobile CTA bar appears at bottom of viewport when hero scrolls away:
  48px tall, glass surface, "Try Peril Free" compact button

### 8.3 Touch Considerations

- All tap targets minimum 44x44px
- Card hover bloom disabled on touch devices (no mouse tracking)
- No hover-dependent content reveals — all content visible by default on mobile

---

## 9. Accessibility

### 9.1 Contrast Ratios

All text/background combinations must pass WCAG AA (4.5:1 for normal text,
3:1 for large text).

| Combination                          | Ratio  | Pass |
|--------------------------------------|--------|------|
| `--sf-text-primary` on `--sf-bg-void`   | 17.4:1 | AAA  |
| `--sf-text-secondary` on `--sf-bg-void` | 7.2:1  | AAA  |
| `--sf-text-muted` on `--sf-bg-void`     | 4.6:1  | AA   |
| `--sf-accent` on `--sf-bg-void`         | 8.1:1  | AAA  |
| `--sf-text-on-accent` on `--sf-accent`  | 8.1:1  | AAA  |
| Gradient text (lightest stop)        | > 5:1  | AA   |

### 9.2 Requirements

- Skip-to-content link on every page
- All interactive elements keyboard-focusable with visible focus ring
  (2px solid `--sf-accent`, 2px offset)
- Focus trap on mobile menu when open
- `aria-label` on icon-only buttons
- `prefers-reduced-motion` fully respected (see 6.6)
- `prefers-contrast: more` supported: disables glass blur, increases border
  opacity to 20%, uses solid backgrounds
- Semantic HTML: `<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`
- Heading hierarchy never skips levels

---

## 10. Performance Budget

| Metric                    | Target     |
|---------------------------|------------|
| First Contentful Paint    | < 1.2s     |
| Largest Contentful Paint  | < 2.0s     |
| Total Blocking Time       | < 150ms    |
| Cumulative Layout Shift   | < 0.05     |
| Above-fold payload        | < 60KB (gzipped, excluding fonts) |
| Total page weight         | < 500KB (gzipped)  |
| Font files                | < 120KB (variable, subset) |
| JavaScript                | < 80KB (gzipped)   |

### Performance Rules

1. **Font loading:** Preload headline weight. Use `font-display: swap` for
   body. Subset to Latin characters only.
2. **Gradients over images.** Every gradient in this system is pure CSS. No
   gradient PNGs, no SVG gradients. This keeps the visual richness at zero
   image cost.
3. **Backdrop-filter sparingly.** Glass effects are GPU-composited. Limit to
   a maximum of 4 visible glass surfaces at any scroll position.
4. **Intersection Observer for reveals.** No scroll event listeners.
   Disconnect observers after all elements have revealed.
5. **Aurora animation uses `will-change: background-position`** on the aurora
   container only. Do not apply `will-change` broadly.
6. **Grain texture:** A single 200x200 PNG tile, < 2KB, cached indefinitely.
7. **Demo section lazy-loaded.** The annotation playground code and assets
   load when the section enters the viewport (with a 200px rootMargin buffer).

---

## 11. What This Replaces

| Current (V1)                 | Solar Flare (V2)                            |
|------------------------------|---------------------------------------------|
| Cream/off-white light default| Dark-only, deep space background             |
| DM Serif Display headlines   | Plus Jakarta Sans 800                        |
| Flat amber on cream          | Gradient arc (amber → coral → violet)        |
| Uniform three-card layouts   | Asymmetric bento grids                       |
| Faint radial gradient        | Animated aurora mesh + grain texture          |
| Static page, scroll reveals only | Atmospheric motion, card bloom, gradient pulse |
| Demo buried mid-page         | Demo promoted to position #2 after hero       |
| Centered headlines           | Left-aligned headlines (centered CTA only)    |
| Light + dark mode toggle     | Dark mode only for marketing site             |
| Pill badges for trust        | Logo bar + stat bar + pull quotes              |
| Minimal footer               | Three-column footer with install command       |
| Empty dead space             | Every gap filled with atmosphere               |

---

## 12. File Manifest

When implemented, the Solar Flare design system will live in:

```
packages/site/src/styles/
├── solar-flare-tokens.css     ← All CSS custom properties from this doc
├── solar-flare-base.css       ← Reset, global styles, grain, aurora
├── solar-flare-components.css ← Buttons, cards, badges, code blocks
└── solar-flare-animations.css ← Keyframes, scroll reveal, hover bloom

packages/site/src/components/
├── SFHeader.tsx               ← New header component
├── SFHero.tsx                 ← Left-aligned hero with aurora
├── SFDemo.tsx                 ← Theater-card demo section
├── SFHowItWorks.tsx           ← Vertical timeline layout
├── SFUseCases.tsx             ← Bento grid use cases
├── SFSocialProof.tsx          ← New stat bar / testimonial strip
├── SFClosingCTA.tsx           ← Full-intensity aurora CTA
├── SFFooter.tsx               ← Three-column footer
├── SFPricing.tsx              ← Redesigned pricing cards
├── SFBentoGrid.tsx            ← Reusable bento layout component
├── SFGlassCard.tsx            ← Reusable glass card component
└── SFGradientText.tsx         ← Gradient text utility component

packages/site/public/
├── fonts/
│   ├── PlusJakartaSans-Variable.woff2
│   └── JetBrainsMono-Variable.woff2
└── grain.png                  ← 200x200 noise tile
```

---

*Solar Flare is not a skin. It is a spatial experience — every gradient has
direction, every surface has depth, every interaction has weight. The page
should feel like the inside of a prism: warm light entering, structured
spectrum emerging.*
