import { useState } from "react";
import { trackCTAClick } from "../analytics";
import { useInView } from "../hooks/useInView";
import { Footer } from "./Footer";

/* ─── FAQ Data ─────────────────────────────────────────── */

const faqs = [
  {
    q: "Is Peril really free?",
    a: "Yes. Local development is free forever. We will charge for cloud and team features when they ship.",
  },
  {
    q: "What MCP agents does Peril work with?",
    a: "Any MCP-compatible agent: Claude Code, Cursor, Codex, Windsurf, and more.",
  },
  {
    q: "Do I need a backend?",
    a: "The local dev server is included. No cloud account needed.",
  },
  {
    q: "What happens to my annotations?",
    a: "Stored locally in the .peril/ directory. You own your data.",
  },
] as const;

/* ─── Free Tier Features ───────────────────────────────── */

const freeFeatures = [
  "Unlimited annotations",
  "All locator strategies",
  "Element + page screenshots",
  "MCP server included",
  "Works with any MCP agent",
  "React adapter included",
] as const;

/* ─── Team Tier Preview Features ───────────────────────── */

const teamFeatures = [
  "Everything in Free, plus:",
  "Cloud-hosted review backend",
  "Team collaboration",
  "Session replay integration",
  "CI/CD verification loop",
] as const;

/* ─── Integration Data (mirrored from TrustSignals) ───── */

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

/* ─── Checkmark Icon ───────────────────────────────────── */

function Check({ muted }: { muted?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 mt-0.5"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke={muted ? "var(--color-text-muted)" : "var(--color-accent)"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── FAQ Item ─────────────────────────────────────────── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-[1rem] font-semibold text-text-primary">
          {question}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`shrink-0 text-text-muted transition-transform duration-[var(--duration-normal)] ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[var(--duration-normal)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[0.9375rem] leading-[var(--leading-relaxed)] text-text-secondary">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Integration Badge (reused from TrustSignals) ────── */

function IntegrationBadge({ integration }: { integration: Integration }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-2.5 rounded-full border px-5 py-2.5 cursor-default select-none transition-all duration-300"
      style={{
        borderColor: hovered
          ? integration.hoverColor
          : "var(--color-border)",
        color: hovered
          ? integration.hoverColor
          : "var(--color-text-secondary)",
        backgroundColor: hovered
          ? `color-mix(in srgb, ${integration.hoverColor} 8%, transparent)`
          : "transparent",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        className="h-2 w-2 rounded-full transition-colors duration-300"
        style={{
          backgroundColor: hovered
            ? integration.hoverColor
            : "var(--color-text-muted)",
        }}
      />
      <span className="text-small font-medium whitespace-nowrap">
        {integration.name}
      </span>
    </div>
  );
}

/* ─── Main Pricing Page ────────────────────────────────── */

export function Pricing() {
  const [heroRef, heroInView] = useInView(0.2);
  const [cardsRef, cardsInView] = useInView(0.15);
  const [faqRef, faqInView] = useInView(0.15);
  const [badgesRef, badgesInView] = useInView(0.3);

  return (
    <main id="main">
      {/* ─── Hero ───────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className="pt-[140px] pb-[var(--space-12)] px-[var(--container-padding)]"
        aria-labelledby="pricing-heading"
      >
        <div
          className="max-w-[56rem] mx-auto text-center"
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h1
            id="pricing-heading"
            className="font-[family-name:var(--font-display)] text-[var(--text-h1)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-text-primary"
          >
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-[var(--text-body-lg)] leading-[var(--leading-relaxed)] text-text-secondary max-w-md mx-auto">
            Free for local development. Always.
          </p>
        </div>
      </section>

      {/* ─── Pricing Cards ──────────────────────────────── */}
      <section
        ref={cardsRef as React.RefObject<HTMLElement>}
        className="py-[var(--space-8)] px-[var(--container-padding)]"
        aria-label="Pricing tiers"
      >
        <div className="max-w-[56rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier — highlighted */}
          <div
            className="relative rounded-[var(--radius-lg)] border border-border-subtle bg-surface p-8 overflow-hidden"
            style={{
              opacity: cardsInView ? 1 : 0,
              transform: cardsInView ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
            }}
          >
            {/* Amber top-border gradient */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, var(--color-accent), transparent)",
              }}
              aria-hidden="true"
            />

            <p className="text-[1.5rem] font-bold text-text-primary">Free</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-[3rem] leading-none text-text-primary">
              $0
            </p>
            <p className="mt-1 text-[0.9375rem] text-text-secondary">
              forever for local development
            </p>

            <ul className="mt-6 space-y-3" role="list">
              {freeFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[0.9375rem] text-text-primary"
                >
                  <Check />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="#get-started"
              className="mt-8 flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-7 py-3.5 text-base font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-md"
              onClick={() => trackCTAClick("Get Started", "pricing-free")}
            >
              Get Started
            </a>
          </div>

          {/* Team Tier — coming soon */}
          <div
            className="relative rounded-[var(--radius-lg)] border border-dashed border-border-subtle bg-surface/60 p-8 overflow-hidden"
            style={{
              opacity: cardsInView ? 1 : 0,
              transform: cardsInView ? "translateY(0)" : "translateY(20px)",
              transition:
                "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 250ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 250ms",
            }}
          >
            <p className="text-[1.25rem] font-semibold text-text-secondary">
              Team
            </p>
            <p className="mt-2 text-[1.5rem] text-text-secondary">
              Coming soon
            </p>

            <ul className="mt-6 space-y-3" role="list">
              {teamFeatures.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 text-[0.9375rem] text-text-secondary"
                >
                  <Check muted />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="#waitlist"
              className="mt-8 flex items-center justify-center rounded-[var(--radius-md)] border border-border-subtle px-7 py-3.5 text-base font-medium text-text-secondary transition-all duration-[var(--duration-fast)] hover:border-text-secondary hover:bg-surface hover:text-text-primary"
              onClick={() =>
                trackCTAClick("Join the Waitlist", "pricing-team")
              }
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────── */}
      <section
        ref={faqRef as React.RefObject<HTMLElement>}
        className="py-[var(--section-padding-y)] px-[var(--container-padding)]"
        aria-labelledby="faq-heading"
      >
        <div
          className="max-w-[var(--container-narrow)] mx-auto"
          style={{
            opacity: faqInView ? 1 : 0,
            transform: faqInView ? "translateY(0)" : "translateY(20px)",
            transition:
              "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h2
            id="faq-heading"
            className="font-[family-name:var(--font-display)] text-[var(--text-h2)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-text-primary text-center mb-10"
          >
            Frequently asked questions
          </h2>
          <div>
            {faqs.map((faq) => (
              <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Integration Badges (repeated social proof) ── */}
      <section
        ref={badgesRef as React.RefObject<HTMLElement>}
        className="py-[var(--section-padding-y-sm)] px-[var(--container-padding)]"
        aria-label="Compatible integrations"
      >
        <div className="max-w-[var(--container-max)] mx-auto">
          <p
            className="text-center text-text-muted text-small tracking-[var(--tracking-wider)] uppercase font-medium mb-8"
            style={{
              opacity: badgesInView ? 1 : 0,
              transition:
                "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            Works with any MCP-compatible agent
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
            style={{
              opacity: badgesInView ? 1 : 0,
              transform: badgesInView ? "translateY(0)" : "translateY(8px)",
              transition:
                "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
            }}
          >
            {integrations.map((integration) => (
              <IntegrationBadge
                key={integration.name}
                integration={integration}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Closing CTA + Footer ───────────────────────── */}
      <Footer />
    </main>
  );
}
