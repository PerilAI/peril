import { useEffect, useRef, useState } from "react";

/* ─── useInView hook ────────────────────────────────────── */

function useInView(threshold = 0.3): [React.RefObject<HTMLElement | null>, boolean] {
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* ─── Integration Logos (monochrome SVG) ────────────────── */

interface LogoProps {
  className?: string;
}

function CursorLogo({ className }: LogoProps) {
  return (
    <svg
      width="120"
      height="28"
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cursor"
    >
      {/* Cursor icon */}
      <rect x="2" y="4" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M9 10L9 18L12.5 15L15.5 18.5L17.5 17L14.5 13.5L18 12L9 10Z" fill="currentColor" />
      {/* Text */}
      <text x="30" y="19" fill="currentColor" fontSize="14" fontFamily="var(--font-body)" fontWeight="500">
        Cursor
      </text>
    </svg>
  );
}

function ClaudeCodeLogo({ className }: LogoProps) {
  return (
    <svg
      width="150"
      height="28"
      viewBox="0 0 150 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Claude Code"
    >
      {/* Claude sparkle icon */}
      <circle cx="12" cy="14" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M12 7L13.5 11.5L18 12L13.5 13L12 18L10.5 13L6 12L10.5 11.5Z" fill="currentColor" opacity="0.8" />
      {/* Text */}
      <text x="28" y="19" fill="currentColor" fontSize="14" fontFamily="var(--font-body)" fontWeight="500">
        Claude Code
      </text>
    </svg>
  );
}

function VSCodeLogo({ className }: LogoProps) {
  return (
    <svg
      width="120"
      height="28"
      viewBox="0 0 120 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="VS Code"
    >
      {/* VS Code shield icon */}
      <path
        d="M4 8L10 4L20 12L10 20L4 16V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinejoin="round"
      />
      <path d="M10 4L20 12V20L10 20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M4 8L15 14L4 20" stroke="currentColor" strokeWidth="1" opacity="0.5" fill="none" />
      {/* Text */}
      <text x="28" y="19" fill="currentColor" fontSize="14" fontFamily="var(--font-body)" fontWeight="500">
        VS Code
      </text>
    </svg>
  );
}

function WindsurfLogo({ className }: LogoProps) {
  return (
    <svg
      width="130"
      height="28"
      viewBox="0 0 130 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Windsurf"
    >
      {/* Wave/wind icon */}
      <path
        d="M4 16C6 12 9 12 11 14C13 16 16 16 18 12C20 8 22 10 22 14"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M4 20C6 17 9 17 11 19C13 21 15 19 17 17"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Text */}
      <text x="30" y="19" fill="currentColor" fontSize="14" fontFamily="var(--font-body)" fontWeight="500">
        Windsurf
      </text>
    </svg>
  );
}

function MCPBadge({ className }: LogoProps) {
  return (
    <svg
      width="80"
      height="28"
      viewBox="0 0 80 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MCP"
    >
      {/* Connection nodes icon */}
      <circle cx="8" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="20" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="11" y1="12.5" x2="17.5" y2="9" stroke="currentColor" strokeWidth="1" />
      <line x1="11" y1="15.5" x2="17.5" y2="19" stroke="currentColor" strokeWidth="1" />
      {/* Text */}
      <text x="28" y="19" fill="currentColor" fontSize="14" fontFamily="var(--font-body)" fontWeight="500">
        MCP
      </text>
    </svg>
  );
}

/* ─── Logo Data ─────────────────────────────────────────── */

interface Integration {
  name: string;
  logo: (props: LogoProps) => React.ReactNode;
  hoverColor: string;
}

const integrations: Integration[] = [
  { name: "Cursor", logo: CursorLogo, hoverColor: "#00b4d8" },
  { name: "Claude Code", logo: ClaudeCodeLogo, hoverColor: "#d4a574" },
  { name: "VS Code", logo: VSCodeLogo, hoverColor: "#007acc" },
  { name: "Windsurf", logo: WindsurfLogo, hoverColor: "#00c9a7" },
  { name: "MCP", logo: MCPBadge, hoverColor: "var(--color-amber-400)" },
];

/* ─── Logo Item ─────────────────────────────────────────── */

function LogoItem({
  integration,
  visible,
  delay,
}: {
  integration: Integration;
  visible: boolean;
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center justify-center px-6 py-3 transition-colors duration-300 cursor-default"
      style={{
        color: hovered ? integration.hoverColor : "var(--color-text-muted)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `color 300ms ease, opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <integration.logo />
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */

export function TrustSignals() {
  const [sectionRef, inView] = useInView(0.3);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-[var(--section-padding-y-sm)] px-[var(--container-padding)]"
      aria-label="Integrations and trust signals"
    >
      <div className="max-w-[var(--container-max)] mx-auto">
        {/* Tagline */}
        <p
          className="text-center text-[var(--color-text-muted)] text-[var(--text-small)] tracking-[var(--tracking-wider)] uppercase font-medium mb-8"
          style={{
            opacity: inView ? 1 : 0,
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          Works with any MCP-compatible agent
        </p>

        {/* Logo strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-x-8">
          {integrations.map((integration, i) => (
            <LogoItem
              key={integration.name}
              integration={integration}
              visible={inView}
              delay={100 + i * 100}
            />
          ))}
        </div>

        {/* Subtle divider */}
        <div
          className="mt-12 mx-auto max-w-xs h-px"
          style={{
            background: "linear-gradient(90deg, transparent, var(--color-border), transparent)",
            opacity: inView ? 1 : 0,
            transition: "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
          }}
        />
      </div>
    </section>
  );
}
