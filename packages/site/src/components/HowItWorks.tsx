import { useInView } from "../hooks/useInView";

interface Step {
  number: number;
  title: string;
  description: string;
  color: string;
  visual: React.ReactNode;
}

function AnnotateVisual() {
  return (
    <div className="sf-code-block">
      <div className="flex items-center gap-2 mb-2" style={{ color: "var(--sf-text-muted)", fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#f59e0b" }} />
        <span>checkout-form.tsx</span>
      </div>
      <div className="space-y-1" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div style={{ color: "var(--sf-text-muted)" }}>&lt;Button variant=&quot;primary&quot;&gt;</div>
        <div style={{ color: "var(--sf-text-primary)", background: "var(--sf-accent-muted)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "var(--sf-radius-sm)", padding: "4px 8px" }}>
          Submit Order
        </div>
        <div style={{ color: "var(--sf-text-muted)" }}>&lt;/Button&gt;</div>
      </div>
    </div>
  );
}

function StructureVisual() {
  return (
    <div className="sf-code-block">
      <div className="space-y-0.5" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)", color: "var(--sf-text-muted)" }}>
        <div>{"{"}</div>
        <div className="pl-3">
          <span style={{ color: "#f59e0b" }}>&quot;selector&quot;</span>:{" "}
          <span style={{ color: "var(--sf-text-secondary)" }}>&quot;button.primary&quot;</span>
        </div>
        <div className="pl-3">
          <span style={{ color: "#f43f5e" }}>&quot;comment&quot;</span>:{" "}
          <span style={{ color: "var(--sf-text-secondary)" }}>&quot;Wrong color&quot;</span>
        </div>
        <div className="pl-3">
          <span style={{ color: "#8b5cf6" }}>&quot;screenshot&quot;</span>:{" "}
          <span style={{ color: "var(--sf-text-secondary)" }}>&quot;data:…&quot;</span>
        </div>
        <div>{"}"}</div>
      </div>
    </div>
  );
}

function ExecuteVisual() {
  return (
    <div className="sf-code-block">
      <div className="space-y-1" style={{ fontFamily: "var(--sf-font-mono)", fontSize: "var(--sf-text-caption)" }}>
        <div style={{ color: "var(--sf-text-muted)" }}>
          <span style={{ color: "#8b5cf6" }}>$</span> agent processing task…
        </div>
        <div style={{ color: "var(--sf-text-secondary)" }}>
          <span style={{ color: "var(--sf-success)" }}>✓</span> Located button.primary
        </div>
        <div style={{ color: "var(--sf-text-secondary)" }}>
          <span style={{ color: "var(--sf-success)" }}>✓</span> Applied fix in checkout-form.tsx
        </div>
        <div style={{ color: "var(--sf-success)" }}>
          ✓ PR #42 ready for review
        </div>
      </div>
    </div>
  );
}

const steps: Step[] = [
  {
    number: 1,
    title: "Annotate",
    description: "Click any element in your live app. Add a comment with category and severity — just like leaving a sticky note, but structured for machines.",
    color: "#f59e0b",
    visual: <AnnotateVisual />,
  },
  {
    number: 2,
    title: "Structure",
    description: "Peril captures locators, screenshots, DOM context, and your comment — all structured into a machine-readable payload.",
    color: "#f43f5e",
    visual: <StructureVisual />,
  },
  {
    number: 3,
    title: "Execute",
    description: "Any MCP-compatible agent receives the task and knows exactly where to look. No translation step, no lost context.",
    color: "#8b5cf6",
    visual: <ExecuteVisual />,
  },
];

function TimelineStep({ step, inView, index }: { step: Step; inView: boolean; index: number }) {
  const delay = 200 + index * 300;
  const isLast = index === steps.length - 1;

  return (
    <div className="relative flex gap-8 lg:gap-16">
      {/* Timeline line + node */}
      <div className="hidden md:flex flex-col items-center" style={{ width: "48px", flexShrink: 0 }}>
        <div
          className="w-4 h-4 rounded-full border-2 transition-all duration-[600ms]"
          style={{
            borderColor: inView ? step.color : "rgba(255,255,255,0.06)",
            background: inView ? step.color : "transparent",
            transitionDelay: `${delay}ms`,
          }}
        />
        {!isLast && (
          <div
            className="w-px flex-1"
            style={{ background: "rgba(255,255,255,0.06)" }}
          />
        )}
      </div>

      {/* Content: two columns */}
      <div
        className="flex-1 grid gap-8 lg:grid-cols-[2fr_3fr] pb-16 lg:pb-24"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: `opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        }}
      >
        {/* Left: step info */}
        <div>
          <div
            className="font-display font-[800] mb-2"
            style={{
              fontSize: "var(--sf-text-h1)",
              color: "rgba(255,255,255,0.08)",
              lineHeight: 1,
            }}
          >
            {String(step.number).padStart(2, "0")}
          </div>
          <h3
            className="font-display font-bold mb-3"
            style={{
              fontSize: "var(--sf-text-h2)",
              color: step.color,
              lineHeight: "var(--sf-leading-h2)",
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              fontSize: "var(--sf-text-body)",
              lineHeight: "var(--sf-leading-body)",
              color: "var(--sf-text-secondary)",
              maxWidth: "38ch",
            }}
          >
            {step.description}
          </p>
        </div>

        {/* Right: visual */}
        <div>{step.visual}</div>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const [sectionRef, inView] = useInView(0.15);

  return (
    <section
      id="how-it-works"
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="px-[var(--sf-container-gutter)]"
      style={{ paddingTop: "var(--sf-section-padding)", paddingBottom: "var(--sf-section-padding)" }}
      aria-labelledby="how-it-works-heading"
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
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="font-display font-[800]"
            style={{
              fontSize: "var(--sf-text-h1)",
              lineHeight: "var(--sf-leading-h1)",
              letterSpacing: "var(--sf-tracking-h1)",
              color: "var(--sf-text-primary)",
            }}
          >
            Three steps. Zero translation.
          </h2>
        </div>

        {/* Timeline */}
        <div>
          {steps.map((step, i) => (
            <TimelineStep key={step.number} step={step} inView={inView} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
