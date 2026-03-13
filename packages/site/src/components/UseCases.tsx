import { useCallback, useRef } from "react";
import { useInView } from "../hooks/useInView";

/* ─── SVG Icons ─────────────────────────────────────────── */

function BugReportIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <ellipse cx="20" cy="22" rx="9" ry="11" stroke="var(--sf-accent)" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="11" r="4" stroke="var(--sf-accent)" strokeWidth="1.5" fill="none" />
      <path d="M17 8L13 4M23 8L27 4" stroke="var(--sf-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 18L7 15M11 24L7 26M11 30L8 34M29 18L33 15M29 24L33 26M29 30L32 34" stroke="var(--sf-accent)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="20" cy="22" r="5" stroke="var(--sf-accent-hover)" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
    </svg>
  );
}

function DesignFeedbackIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="6" y="6" width="28" height="28" rx="3" stroke="#8b5cf6" strokeWidth="1.5" fill="none" />
      <rect x="10" y="10" width="10" height="5" rx="1" fill="#8b5cf6" opacity="0.25" />
      <rect x="10" y="18" width="20" height="3" rx="1" fill="#8b5cf6" opacity="0.15" />
      <rect x="10" y="24" width="14" height="3" rx="1" fill="#8b5cf6" opacity="0.15" />
      <circle cx="30" cy="12" r="5" fill="var(--sf-accent)" opacity="0.9" />
      <path d="M28 12L29.5 13.5L33 10" stroke="var(--sf-text-on-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AccessibilityIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="15" stroke="var(--sf-success)" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="13" r="2.5" fill="var(--sf-success)" />
      <line x1="20" y1="16" x2="20" y2="25" stroke="var(--sf-success)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 20L20 18L27 20" stroke="var(--sf-success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M20 25L15 32M20 25L25 32" stroke="var(--sf-success)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Visual Blocks ────────────────────────────────────── */

function BugReportVisual() {
  return (
    <div className="sf-code-block">
      <div className="flex items-center gap-2 mb-2" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--sf-accent)" }} />
        <span style={{ color: "var(--sf-text-muted)" }}>annotation #12</span>
      </div>
      <div className="space-y-1.5" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-accent)" }}>→</span>
          <span style={{ color: "var(--sf-text-secondary)" }}>"Submit button unresponsive on mobile"</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-success)" }}>✓</span>
          <span style={{ color: "var(--sf-text-secondary)" }}>Agent fixed touch target in <span style={{ color: "var(--sf-text-primary)" }}>checkout.tsx:42</span></span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-success)" }}>✓</span>
          <span style={{ color: "var(--sf-success)" }}>PR #87 merged</span>
        </div>
      </div>
    </div>
  );
}

function DesignFeedbackVisual() {
  return (
    <div className="sf-code-block">
      <div className="flex items-center gap-2 mb-2" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#8b5cf6" }} />
        <span style={{ color: "var(--sf-text-muted)" }}>design review</span>
      </div>
      <div className="space-y-1.5" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "#8b5cf6" }}>→</span>
          <span style={{ color: "var(--sf-text-secondary)" }}>"Header spacing too tight, needs 24px gap"</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-success)" }}>✓</span>
          <span style={{ color: "var(--sf-text-secondary)" }}>Updated <span style={{ color: "var(--sf-text-primary)" }}>gap-4</span> → <span style={{ color: "var(--sf-text-primary)" }}>gap-6</span></span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-success)" }}>✓</span>
          <span style={{ color: "var(--sf-success)" }}>PR #91 ready for review</span>
        </div>
      </div>
    </div>
  );
}

function AccessibilityVisual() {
  return (
    <div className="sf-code-block">
      <div className="flex items-center gap-2 mb-2" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--sf-success)" }} />
        <span style={{ color: "var(--sf-text-muted)" }}>a11y audit</span>
      </div>
      <div className="space-y-1.5" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-accent)" }}>!</span>
          <span style={{ color: "var(--sf-text-secondary)" }}>3 contrast violations flagged</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-success)" }}>✓</span>
          <span style={{ color: "var(--sf-text-secondary)" }}>All fixed to <span style={{ color: "var(--sf-text-primary)" }}>4.5:1+</span> ratio</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="shrink-0" style={{ color: "var(--sf-success)" }}>✓</span>
          <span style={{ color: "var(--sf-success)" }}>WCAG AA compliant</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Use Case Data ────────────────────────────────────── */

interface UseCase {
  headline: string;
  outcome: string;
  description: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

const useCases: UseCase[] = [
  {
    headline: "Bug reports",
    outcome: "Click the bug, describe it, your agent fixes it",
    description: "Spot a broken button or layout glitch? Click it, leave a note, and your coding agent delivers a fix — no ticket triage, no context switching.",
    icon: <BugReportIcon />,
    visual: <BugReportVisual />,
  },
  {
    headline: "Design feedback",
    outcome: "Annotate what's wrong, get a PR back",
    description: "Mark spacing issues, wrong colors, or misaligned elements directly on the live page. Your agent reads the annotation and opens a PR with the exact changes.",
    icon: <DesignFeedbackIcon />,
    visual: <DesignFeedbackVisual />,
  },
  {
    headline: "Accessibility reviews",
    outcome: "Flag WCAG issues visually, get automated fixes",
    description: "Highlight contrast failures, missing alt text, or keyboard traps in context. Your agent receives structured data and knows exactly what to remediate.",
    icon: <AccessibilityIcon />,
    visual: <AccessibilityVisual />,
  },
];

/* ─── Bento Card with Mouse Bloom ──────────────────────── */

function BentoCard({
  useCase,
  visible,
  delay,
  className = "",
}: {
  useCase: UseCase;
  visible: boolean;
  delay: number;
  className?: string;
}) {
  const cardRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  }, []);

  return (
    <article
      ref={cardRef}
      className={`sf-card flex flex-col ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        ["--mouse-x" as string]: "50%",
        ["--mouse-y" as string]: "50%",
      }}
      onMouseMove={handleMouseMove}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="shrink-0">{useCase.icon}</div>
        <h3
          className="font-display font-bold"
          style={{ fontSize: "var(--sf-text-h3)", color: "var(--sf-text-primary)" }}
        >
          {useCase.headline}
        </h3>
      </div>

      <p className="font-medium mb-3 leading-snug" style={{
        fontSize: "var(--sf-text-body)",
        background: "var(--sf-gradient-arc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>
        {useCase.outcome}
      </p>

      <p style={{ fontSize: "var(--sf-text-small)", lineHeight: "var(--sf-leading-body)", color: "var(--sf-text-secondary)" }} className="mb-6">
        {useCase.description}
      </p>

      <div className="mt-auto">{useCase.visual}</div>
    </article>
  );
}

/* ─── Stat Card ────────────────────────────────────────── */

function StatCard({ visible, delay }: { visible: boolean; delay: number }) {
  return (
    <div
      className="sf-card flex flex-col items-center justify-center text-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      <div style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-h1)", fontWeight: 800, color: "var(--sf-text-primary)" }}>
        99.7%
      </div>
      <p style={{ fontSize: "var(--sf-text-small)", color: "var(--sf-text-muted)", marginTop: "var(--sf-space-2)" }}>
        locator accuracy
      </p>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────── */

export function UseCases() {
  const [sectionRef, inView] = useInView(0.1);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="px-[var(--sf-container-gutter)]"
      style={{ paddingTop: "var(--sf-section-padding)", paddingBottom: "var(--sf-section-padding)" }}
      aria-labelledby="use-cases-heading"
    >
      <div className="max-w-[var(--sf-container-max)] mx-auto">
        {/* Section Header — left-aligned */}
        <div
          className="mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <p
            className="uppercase font-medium mb-4"
            style={{
              fontFamily: "var(--sf-font-mono)",
              fontSize: "var(--sf-text-caption)",
              letterSpacing: "var(--sf-tracking-overline)",
              color: "var(--sf-text-accent)",
            }}
          >
            Use cases
          </p>
          <h2
            id="use-cases-heading"
            className="font-display font-[800]"
            style={{
              fontSize: "var(--sf-text-h1)",
              lineHeight: "var(--sf-leading-h1)",
              letterSpacing: "var(--sf-tracking-h1)",
              color: "var(--sf-text-primary)",
            }}
          >
            What you can do with Peril
          </h2>
        </div>

        {/* Bento Row 1: 2/3 + 1/3 */}
        <div className="sf-bento-primary mb-4">
          <BentoCard useCase={useCases[0]!} visible={inView} delay={200} />
          <BentoCard useCase={useCases[1]!} visible={inView} delay={400} />
        </div>

        {/* Bento Row 2: 1/3 + 2/3 */}
        <div className="sf-bento-tertiary">
          <BentoCard useCase={useCases[2]!} visible={inView} delay={600} />
          <StatCard visible={inView} delay={800} />
        </div>
      </div>
    </section>
  );
}
