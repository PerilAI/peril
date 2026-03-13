import { useInView } from "../hooks/useInView";

const STATS = [
  { value: "127", label: "teams" },
  { value: "14,000", label: "annotations" },
  { value: "8,400", label: "agent tasks" },
  { value: "99.7%", label: "locator accuracy" },
] as const;

export function SocialProof() {
  const [sectionRef, inView] = useInView(0.3);

  return (
    <section
      id="social-proof"
      ref={sectionRef as React.RefObject<HTMLElement>}
      style={{
        background: "var(--sf-bg-elevated)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingTop: "var(--sf-space-16)",
        paddingBottom: "var(--sf-space-16)",
      }}
      className="px-[var(--sf-container-gutter)]"
    >
      <div
        className="max-w-[var(--sf-container-max)] mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-12"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {STATS.map((stat, i) => (
          <div key={stat.label} className="flex items-center gap-3">
            {i > 0 && (
              <span
                className="hidden md:block w-1 h-1 rounded-full"
                style={{ background: "var(--sf-text-muted)" }}
                aria-hidden="true"
              />
            )}
            <div className="text-center md:text-left">
              <span
                style={{
                  fontFamily: "var(--sf-font-mono)",
                  fontSize: "var(--sf-text-h2)",
                  fontWeight: 700,
                  color: "var(--sf-text-primary)",
                }}
              >
                {stat.value}
              </span>
              <span
                className="ml-2"
                style={{
                  fontSize: "var(--sf-text-small)",
                  color: "var(--sf-text-muted)",
                }}
              >
                {stat.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
