import { useInView } from "../hooks/useInView";

/* ─── SVG Icons ─────────────────────────────────────────── */

function BugReportIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Bug body */}
      <ellipse
        cx="20"
        cy="22"
        rx="9"
        ry="11"
        stroke="var(--color-amber-400)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Bug head */}
      <circle
        cx="20"
        cy="11"
        r="4"
        stroke="var(--color-amber-400)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Antennae */}
      <path
        d="M17 8L13 4M23 8L27 4"
        stroke="var(--color-amber-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Legs */}
      <path
        d="M11 18L7 15M11 24L7 26M11 30L8 34M29 18L33 15M29 24L33 26M29 30L32 34"
        stroke="var(--color-amber-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Crosshair overlay */}
      <circle
        cx="20"
        cy="22"
        r="5"
        stroke="var(--color-amber-300)"
        strokeWidth="1"
        strokeDasharray="3 2"
        opacity="0.5"
      />
    </svg>
  );
}

function DesignFeedbackIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Artboard frame */}
      <rect
        x="6"
        y="6"
        width="28"
        height="28"
        rx="3"
        stroke="hsl(260, 55%, 60%)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Layout blocks */}
      <rect x="10" y="10" width="10" height="5" rx="1" fill="hsl(260, 55%, 60%)" opacity="0.25" />
      <rect x="10" y="18" width="20" height="3" rx="1" fill="hsl(260, 55%, 60%)" opacity="0.15" />
      <rect x="10" y="24" width="14" height="3" rx="1" fill="hsl(260, 55%, 60%)" opacity="0.15" />
      {/* Annotation pin */}
      <circle cx="30" cy="12" r="5" fill="var(--color-amber-400)" opacity="0.9" />
      <path
        d="M28 12L29.5 13.5L33 10"
        stroke="var(--color-neutral-950)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Circle */}
      <circle
        cx="20"
        cy="20"
        r="15"
        stroke="hsl(150, 50%, 45%)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Person figure */}
      <circle cx="20" cy="13" r="2.5" fill="hsl(150, 50%, 45%)" />
      {/* Body */}
      <line
        x1="20"
        y1="16"
        x2="20"
        y2="25"
        stroke="hsl(150, 50%, 45%)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Arms */}
      <path
        d="M13 20L20 18L27 20"
        stroke="hsl(150, 50%, 45%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Legs */}
      <path
        d="M20 25L15 32M20 25L25 32"
        stroke="hsl(150, 50%, 45%)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Use Case Data ─────────────────────────────────────── */

interface UseCase {
  headline: string;
  outcome: string;
  description: string;
  accentColor: string;
  accentGlow: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

/* ─── Use Case Visuals ──────────────────────────────────── */

function BugReportVisual() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-[var(--text-caption)] font-[family-name:var(--font-mono)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-amber-400)]" />
        <span className="text-[var(--color-text-muted)]">annotation #12</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-[var(--color-amber-400)] shrink-0">→</span>
          <span className="text-[var(--color-text-secondary)]">"Submit button unresponsive on mobile"</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[hsl(150,50%,45%)] shrink-0">✓</span>
          <span className="text-[var(--color-text-secondary)]">Agent fixed touch target in <span className="text-[var(--color-text)]">checkout.tsx:42</span></span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[hsl(150,50%,45%)] shrink-0">✓</span>
          <span className="text-[hsl(150,50%,45%)]">PR #87 merged</span>
        </div>
      </div>
    </div>
  );
}

function DesignFeedbackVisual() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-[var(--text-caption)] font-[family-name:var(--font-mono)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(260,55%,60%)]" />
        <span className="text-[var(--color-text-muted)]">design review</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-[hsl(260,55%,60%)] shrink-0">→</span>
          <span className="text-[var(--color-text-secondary)]">"Header spacing too tight, needs 24px gap"</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[hsl(150,50%,45%)] shrink-0">✓</span>
          <span className="text-[var(--color-text-secondary)]">Updated <span className="text-[var(--color-text)]">gap-4</span> → <span className="text-[var(--color-text)]">gap-6</span></span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[hsl(150,50%,45%)] shrink-0">✓</span>
          <span className="text-[hsl(150,50%,45%)]">PR #91 ready for review</span>
        </div>
      </div>
    </div>
  );
}

function AccessibilityVisual() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-[var(--text-caption)] font-[family-name:var(--font-mono)]">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-[hsl(150,50%,45%)]" />
        <span className="text-[var(--color-text-muted)]">a11y audit</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-[var(--color-amber-400)] shrink-0">!</span>
          <span className="text-[var(--color-text-secondary)]">3 contrast violations flagged</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[hsl(150,50%,45%)] shrink-0">✓</span>
          <span className="text-[var(--color-text-secondary)]">All fixed to <span className="text-[var(--color-text)]">4.5:1+</span> ratio</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[hsl(150,50%,45%)] shrink-0">✓</span>
          <span className="text-[hsl(150,50%,45%)]">WCAG AA compliant</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Use Cases ─────────────────────────────────────────── */

const useCases: UseCase[] = [
  {
    headline: "Bug reports",
    outcome: "Click the bug, describe it, your agent fixes it",
    description:
      "Spot a broken button or layout glitch? Click it, leave a note, and your coding agent delivers a fix — no ticket triage, no context switching.",
    accentColor: "var(--color-amber-400)",
    accentGlow: "rgba(251, 191, 36, 0.10)",
    icon: <BugReportIcon />,
    visual: <BugReportVisual />,
  },
  {
    headline: "Design feedback",
    outcome: "Annotate what's wrong, get a PR back",
    description:
      "Mark spacing issues, wrong colors, or misaligned elements directly on the live page. Your agent reads the annotation and opens a PR with the exact changes.",
    accentColor: "hsl(260, 55%, 60%)",
    accentGlow: "rgba(124, 90, 199, 0.10)",
    icon: <DesignFeedbackIcon />,
    visual: <DesignFeedbackVisual />,
  },
  {
    headline: "Accessibility reviews",
    outcome: "Flag WCAG issues visually, get automated fixes",
    description:
      "Highlight contrast failures, missing alt text, or keyboard traps in context. Your agent receives structured data and knows exactly what to remediate.",
    accentColor: "hsl(150, 50%, 45%)",
    accentGlow: "rgba(56, 161, 105, 0.10)",
    icon: <AccessibilityIcon />,
    visual: <AccessibilityVisual />,
  },
];

/* ─── Use Case Card ─────────────────────────────────────── */

function UseCaseCard({
  useCase,
  visible,
  delay,
}: {
  useCase: UseCase;
  visible: boolean;
  delay: number;
}) {
  return (
    <article
      className="group relative rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 flex flex-col overflow-hidden transition-[border-color] duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, border-color 300ms ease`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = useCase.accentColor;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "";
      }}
    >
      {/* Accent top edge */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${useCase.accentColor}, transparent)`,
          opacity: 0.35,
        }}
      />

      {/* Icon + headline row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="shrink-0">{useCase.icon}</div>
        <h3
          className="text-[var(--text-h4)] font-semibold"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {useCase.headline}
        </h3>
      </div>

      {/* Outcome tagline */}
      <p
        className="text-[var(--text-body)] font-medium mb-3 leading-snug"
        style={{ color: useCase.accentColor }}
      >
        {useCase.outcome}
      </p>

      {/* Description */}
      <p className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed mb-6">
        {useCase.description}
      </p>

      {/* Visual */}
      <div className="mt-auto">{useCase.visual}</div>
    </article>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export function UseCases() {
  const [sectionRef, inView] = useInView(0.1);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-[var(--section-padding-y)] px-[var(--container-padding)]"
      aria-labelledby="use-cases-heading"
    >
      <div className="max-w-[var(--container-max)] mx-auto">
        {/* Section Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h2
            id="use-cases-heading"
            className="text-[var(--text-h1)] font-[family-name:var(--font-display)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] mb-4"
          >
            What you can do with Peril
          </h2>
          <p className="text-[var(--color-text-secondary)] text-[var(--text-body-lg)] max-w-lg mx-auto">
            Every visual annotation becomes a structured task your agent can act on immediately.
          </p>
        </div>

        {/* Use case cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {useCases.map((uc, i) => (
            <UseCaseCard
              key={uc.headline}
              useCase={uc}
              visible={inView}
              delay={200 + i * 200}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
