import { useState } from "react";
import { useInView } from "../hooks/useInView";

/* ─── Integration Data ─────────────────────────────────── */

interface Integration {
  name: string;
  hoverColor: string;
}

const integrations: Integration[] = [
  { name: "Cursor", hoverColor: "#00b4d8" },
  { name: "Claude Code", hoverColor: "#d4a574" },
  { name: "VS Code", hoverColor: "#007acc" },
  { name: "Windsurf", hoverColor: "#00c9a7" },
  { name: "MCP", hoverColor: "var(--color-amber-400)" },
];

/* ─── Integration Badge ────────────────────────────────── */

function IntegrationBadge({
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
      className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 cursor-default select-none transition-all duration-300"
      style={{
        borderColor: hovered ? integration.hoverColor : "var(--color-border)",
        color: hovered ? integration.hoverColor : "var(--color-text-secondary)",
        backgroundColor: hovered ? `color-mix(in srgb, ${integration.hoverColor} 8%, transparent)` : "transparent",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `border-color 300ms ease, color 300ms ease, background-color 300ms ease, opacity 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 500ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="h-2 w-2 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: hovered ? integration.hoverColor : "var(--color-text-muted)",
        }}
      />
      <span className="text-[var(--text-small)] font-medium whitespace-nowrap">
        {integration.name}
      </span>
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

        {/* Integration badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {integrations.map((integration, i) => (
            <IntegrationBadge
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
