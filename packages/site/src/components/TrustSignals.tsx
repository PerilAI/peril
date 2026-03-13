import { useInView } from "../hooks/useInView";

export function TrustSignals() {
  const [sectionRef, inView] = useInView(0.3);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="px-[var(--sf-container-gutter)]"
      style={{ paddingTop: "var(--sf-section-padding-sm)", paddingBottom: "var(--sf-section-padding-sm)" }}
      aria-label="Integrations and trust signals"
    >
      <div className="max-w-[var(--sf-container-max)] mx-auto">
        <p
          className="text-center uppercase font-medium mb-4"
          style={{
            fontFamily: "var(--sf-font-mono)",
            fontSize: "var(--sf-text-caption)",
            letterSpacing: "var(--sf-tracking-overline)",
            color: "var(--sf-text-muted)",
            opacity: inView ? 1 : 0,
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          Works with any MCP-compatible agent
        </p>

        <p
          className="text-center uppercase font-medium"
          style={{
            fontSize: "var(--sf-text-small)",
            letterSpacing: "var(--sf-tracking-overline)",
            color: "var(--sf-text-muted)",
            opacity: inView ? 1 : 0,
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 300ms",
          }}
        >
          Trusted by 50+ teams during early access
        </p>

        {/* Subtle divider */}
        <div
          className="mt-12 mx-auto max-w-xs h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
            opacity: inView ? 1 : 0,
            transition: "opacity 800ms cubic-bezier(0.16, 1, 0.3, 1) 600ms",
          }}
        />
      </div>
    </section>
  );
}
