import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView";

/* ─── Step data ─────────────────────────────────────────── */

interface Step {
  number: number;
  headline: string;
  description: string;
  accentColor: string;
  accentGlow: string;
  icon: React.ReactNode;
  visual: React.ReactNode;
}

/* ─── SVG Icons ─────────────────────────────────────────── */

function AnnotateIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Cursor arrow */}
      <path
        d="M14 8L14 34L20.5 27.5L27.5 40L32 38L25 25L34 25L14 8Z"
        fill="var(--color-amber-400)"
        stroke="var(--color-amber-300)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Click ripple rings */}
      <circle
        cx="14"
        cy="8"
        r="4"
        stroke="var(--color-amber-400)"
        strokeWidth="1"
        opacity="0.3"
      />
      <circle
        cx="14"
        cy="8"
        r="7"
        stroke="var(--color-amber-400)"
        strokeWidth="0.75"
        opacity="0.15"
      />
    </svg>
  );
}

function StructureIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Document body */}
      <rect
        x="10"
        y="6"
        width="28"
        height="36"
        rx="3"
        stroke="var(--color-neutral-400)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Data lines */}
      <rect x="15" y="13" width="10" height="2" rx="1" fill="var(--color-neutral-400)" opacity="0.5" />
      <rect x="15" y="19" width="18" height="2" rx="1" fill="#64748b" />
      <rect x="15" y="24" width="14" height="2" rx="1" fill="#64748b" />
      <rect x="15" y="29" width="16" height="2" rx="1" fill="#64748b" />
      <rect x="15" y="34" width="8" height="2" rx="1" fill="#64748b" opacity="0.5" />
      {/* Bracket accents */}
      <path d="M32 17L35 17L35 27L32 27" stroke="#64748b" strokeWidth="1.5" fill="none" />
      <circle cx="35" cy="22" r="2" fill="#64748b" opacity="0.4" />
    </svg>
  );
}

function ExecuteIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Terminal window */}
      <rect
        x="6"
        y="8"
        width="36"
        height="32"
        rx="4"
        stroke="hsl(150, 50%, 45%)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Title bar dots */}
      <circle cx="13" cy="14" r="1.5" fill="hsl(150, 50%, 45%)" opacity="0.4" />
      <circle cx="18" cy="14" r="1.5" fill="hsl(150, 50%, 45%)" opacity="0.4" />
      <circle cx="23" cy="14" r="1.5" fill="hsl(150, 50%, 45%)" opacity="0.4" />
      {/* Divider */}
      <line x1="6" y1="19" x2="42" y2="19" stroke="hsl(150, 50%, 45%)" strokeWidth="0.75" opacity="0.3" />
      {/* Prompt + checkmark */}
      <path d="M13 26L16 26" stroke="hsl(150, 50%, 45%)" strokeWidth="1.5" strokeLinecap="round" />
      <text x="19" y="27" fill="hsl(150, 50%, 45%)" fontSize="8" fontFamily="var(--font-mono)" opacity="0.7">
        fix applied
      </text>
      {/* Checkmark */}
      <path
        d="M30 32L34 36L40 28"
        stroke="hsl(150, 50%, 45%)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── Step Visuals ──────────────────────────────────────── */

function AnnotateVisual() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-[var(--text-caption)] font-[family-name:var(--font-mono)]">
      <div className="flex items-center gap-2 mb-2 text-[var(--color-text-muted)]">
        <div className="w-2 h-2 rounded-full bg-[var(--color-amber-400)]" />
        <span>checkout-form.tsx</span>
      </div>
      <div className="space-y-1">
        <div className="px-2 py-1 rounded text-[var(--color-text-secondary)]">&lt;Button variant=&quot;primary&quot;&gt;</div>
        <div className="px-2 py-1 rounded border border-[var(--color-amber-400)] bg-[rgba(251,191,36,0.08)] text-[var(--color-text)] shadow-[var(--glow-sm)]">
          Submit Order
        </div>
        <div className="px-2 py-1 rounded text-[var(--color-text-secondary)]">&lt;/Button&gt;</div>
      </div>
    </div>
  );
}

function StructureVisual() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-[var(--text-caption)] font-[family-name:var(--font-mono)]">
      <div className="text-[#64748b] space-y-0.5">
        <div>{"{"}</div>
        <div className="pl-3">
          <span className="text-[var(--color-amber-400)]">&quot;selector&quot;</span>:{" "}
          <span className="text-[var(--color-text-secondary)]">&quot;button.primary&quot;</span>
        </div>
        <div className="pl-3">
          <span className="text-[var(--color-amber-400)]">&quot;comment&quot;</span>:{" "}
          <span className="text-[var(--color-text-secondary)]">&quot;Wrong color&quot;</span>
        </div>
        <div className="pl-3">
          <span className="text-[var(--color-amber-400)]">&quot;screenshot&quot;</span>:{" "}
          <span className="text-[var(--color-text-secondary)]">&quot;data:…&quot;</span>
        </div>
        <div>{"}"}</div>
      </div>
    </div>
  );
}

function ExecuteVisual() {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-3 text-[var(--text-caption)] font-[family-name:var(--font-mono)]">
      <div className="space-y-1">
        <div className="text-[var(--color-text-muted)]">
          <span className="text-[hsl(150,50%,45%)]">$</span> agent processing task…
        </div>
        <div className="text-[var(--color-text-secondary)]">
          <span className="text-[hsl(150,50%,45%)]">✓</span> Located button.primary
        </div>
        <div className="text-[var(--color-text-secondary)]">
          <span className="text-[hsl(150,50%,45%)]">✓</span> Applied fix in checkout-form.tsx
        </div>
        <div className="text-[hsl(150,50%,45%)]">
          ✓ PR #42 ready for review
        </div>
      </div>
    </div>
  );
}

/* ─── Connecting Arrow SVG ──────────────────────────────── */

function ConnectingArrow({ visible, delay }: { visible: boolean; delay: number }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    if (visible) {
      const timeout = setTimeout(() => {
        path.style.transition = `stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)`;
        path.style.strokeDashoffset = "0";
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      path.style.transition = "none";
      path.style.strokeDashoffset = `${length}`;
    }
  }, [visible, delay]);

  return (
    <svg
      className="hidden lg:block w-12 h-8 shrink-0 self-center"
      viewBox="0 0 48 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        ref={pathRef}
        d="M4 16 L36 16"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      {/* Arrow head */}
      <path
        d="M34 10 L42 16 L34 22"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity 300ms ease ${delay + 400}ms`,
        }}
      />
    </svg>
  );
}

/* ─── Vertical Connecting Line (mobile) ─────────────────── */

function VerticalConnector({ visible, delay }: { visible: boolean; delay: number }) {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    if (!line) return;
    line.style.strokeDasharray = "40";
    line.style.strokeDashoffset = "40";

    if (visible) {
      const timeout = setTimeout(() => {
        line.style.transition = `stroke-dashoffset 500ms cubic-bezier(0.16, 1, 0.3, 1)`;
        line.style.strokeDashoffset = "0";
      }, delay);
      return () => clearTimeout(timeout);
    } else {
      line.style.transition = "none";
      line.style.strokeDashoffset = "40";
    }
  }, [visible, delay]);

  return (
    <svg
      className="block lg:hidden w-8 h-10 mx-auto"
      viewBox="0 0 32 40"
      fill="none"
      aria-hidden="true"
    >
      <line
        ref={lineRef}
        x1="16"
        y1="2"
        x2="16"
        y2="30"
        stroke="var(--color-border)"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      <path
        d="M10 28 L16 36 L22 28"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        style={{
          opacity: visible ? 1 : 0,
          transition: `opacity 300ms ease ${delay + 300}ms`,
        }}
      />
    </svg>
  );
}

/* ─── Step Card ─────────────────────────────────────────── */

function StepCard({
  step,
  visible,
  delay,
}: {
  step: Step;
  visible: boolean;
  delay: number;
}) {
  return (
    <article
      className="flex-1 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-8 relative overflow-hidden"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {/* Accent top border gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${step.accentColor}, transparent)`,
          opacity: 0.4,
        }}
      />

      {/* Step number badge */}
      <div
        className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[var(--text-caption)] font-semibold mb-4"
        style={{
          backgroundColor: step.accentGlow,
          color: step.accentColor,
          border: `1px solid ${step.accentColor}`,
          opacity: 0.8,
        }}
      >
        {step.number}
      </div>

      {/* Icon */}
      <div className="mb-4">{step.icon}</div>

      {/* Headline */}
      <h3
        className="text-[1.25rem] font-semibold mb-2"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {step.headline}
      </h3>

      {/* Description */}
      <p className="text-[var(--color-text-secondary)] text-[0.9375rem] leading-relaxed mb-5">
        {step.description}
      </p>

      {/* Visual */}
      <div className="mt-auto">{step.visual}</div>
    </article>
  );
}

/* ─── Steps Data ────────────────────────────────────────── */

const steps: Step[] = [
  {
    number: 1,
    headline: "Click any element",
    description:
      "Select what's wrong in your live app. Add a comment with category and severity.",
    accentColor: "var(--color-amber-400)",
    accentGlow: "rgba(251, 191, 36, 0.12)",
    icon: <AnnotateIcon />,
    visual: <AnnotateVisual />,
  },
  {
    number: 2,
    headline: "Peril captures everything",
    description:
      "Locators, screenshots, DOM context, and your comment — structured for machines.",
    accentColor: "#64748b",
    accentGlow: "rgba(100, 116, 139, 0.12)",
    icon: <StructureIcon />,
    visual: <StructureVisual />,
  },
  {
    number: 3,
    headline: "Your agent fixes it",
    description:
      "Any MCP-compatible agent receives the task and knows exactly where to look.",
    accentColor: "hsl(150, 50%, 45%)",
    accentGlow: "rgba(56, 161, 105, 0.12)",
    icon: <ExecuteIcon />,
    visual: <ExecuteVisual />,
  },
];

/* ─── Main Component ────────────────────────────────────── */

export function HowItWorks() {
  const [sectionRef, inView] = useInView(0.15);

  return (
    <section
      id="how-it-works"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-[var(--section-padding-y)] px-[var(--container-padding)]"
      aria-labelledby="how-it-works-heading"
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
            id="how-it-works-heading"
            className="text-[var(--text-h1)] font-[family-name:var(--font-display)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] mb-4"
          >
            How Peril works
          </h2>
          <p className="text-[var(--color-text-secondary)] text-[var(--text-body-lg)] max-w-md mx-auto">
            Three steps. Zero translation.
          </p>
        </div>

        {/* Desktop: horizontal flow */}
        <div className="hidden lg:flex items-stretch gap-6">
          <StepCard step={steps[0]!} visible={inView} delay={200} />
          <ConnectingArrow visible={inView} delay={400} />
          <StepCard step={steps[1]!} visible={inView} delay={600} />
          <ConnectingArrow visible={inView} delay={800} />
          <StepCard step={steps[2]!} visible={inView} delay={1000} />
        </div>

        {/* Mobile: vertical flow */}
        <div className="flex lg:hidden flex-col gap-0">
          <StepCard step={steps[0]!} visible={inView} delay={200} />
          <VerticalConnector visible={inView} delay={400} />
          <StepCard step={steps[1]!} visible={inView} delay={600} />
          <VerticalConnector visible={inView} delay={800} />
          <StepCard step={steps[2]!} visible={inView} delay={1000} />
        </div>
      </div>
    </section>
  );
}
