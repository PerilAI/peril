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

/* ─── Tier Features ───────────────────────────────────── */

const freeFeatures = [
  "Unlimited annotations",
  "All locator strategies",
  "Element + page screenshots",
  "MCP server included",
  "Works with any MCP agent",
  "React adapter included",
] as const;

const teamFeatures = [
  "Everything in Free, plus:",
  "Cloud-hosted review backend",
  "Team collaboration",
  "Session replay integration",
  "CI/CD verification loop",
] as const;

/* ─── Integration Badges ───────────────────────────────── */

const integrations = ["Cursor", "Claude Code", "VS Code", "Windsurf", "MCP"] as const;

/* ─── Checkmark Icon ───────────────────────────────────── */

function Check({ muted }: { muted?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
      <path
        d="M3.5 8.5L6.5 11.5L12.5 4.5"
        stroke={muted ? "var(--sf-text-muted)" : "var(--sf-success)"}
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
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-[1rem] font-semibold" style={{ color: "var(--sf-text-primary)" }}>
          {question}
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`shrink-0 transition-transform duration-[var(--sf-duration-normal)] ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--sf-text-muted)" }}
          aria-hidden="true"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[var(--sf-duration-normal)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="pb-5 text-[0.9375rem]" style={{ lineHeight: "var(--sf-leading-body)", color: "var(--sf-text-secondary)" }}>
            {answer}
          </p>
        </div>
      </div>
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
    <main id="main" className="sf-grain">
      {/* ─── Hero ───────────────────────────────────────── */}
      <section
        ref={heroRef as React.RefObject<HTMLElement>}
        className="pt-[140px] pb-[var(--sf-space-12)] px-[var(--sf-container-gutter)]"
        aria-labelledby="pricing-heading"
      >
        <div
          className="max-w-[56rem] mx-auto text-center"
          style={{
            opacity: heroInView ? 1 : 0,
            transform: heroInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h1
            id="pricing-heading"
            className="font-display font-[800]"
            style={{
              fontSize: "var(--sf-text-h1)",
              lineHeight: "var(--sf-leading-h1)",
              letterSpacing: "var(--sf-tracking-h1)",
              color: "var(--sf-text-primary)",
            }}
          >
            Simple, transparent pricing
          </h1>
          <p className="mt-4 max-w-md mx-auto" style={{ fontSize: "var(--sf-text-body-lg)", lineHeight: "var(--sf-leading-body)", color: "var(--sf-text-secondary)" }}>
            Free for local development. Always.
          </p>
        </div>
      </section>

      {/* ─── Pricing Cards ──────────────────────────────── */}
      <section
        ref={cardsRef as React.RefObject<HTMLElement>}
        className="py-[var(--sf-space-8)] px-[var(--sf-container-gutter)]"
        aria-label="Pricing tiers"
      >
        <div className="max-w-[56rem] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Tier — featured with gradient border */}
          <div
            className="sf-card-featured"
            style={{
              opacity: cardsInView ? 1 : 0,
              transform: cardsInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
            }}
          >
            <p className="text-[1.5rem] font-bold" style={{ color: "var(--sf-text-primary)" }}>Free</p>
            <p className="mt-2 font-display" style={{ fontSize: "var(--sf-text-hero)", lineHeight: 1, color: "var(--sf-text-primary)" }}>
              $0
            </p>
            <p className="mt-1 text-[0.9375rem]" style={{ color: "var(--sf-text-muted)" }}>
              forever for local development
            </p>

            <ul className="mt-6 space-y-3" role="list">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[0.9375rem]" style={{ color: "var(--sf-text-primary)" }}>
                  <Check />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="#get-started"
              className="sf-btn-primary mt-8 w-full text-base"
              style={{ display: "flex", justifyContent: "center" }}
              onClick={() => trackCTAClick("Get Started", "pricing-free")}
            >
              Get Started
            </a>
          </div>

          {/* Team Tier — glass card */}
          <div
            className="sf-card"
            style={{
              opacity: cardsInView ? 1 : 0,
              transform: cardsInView ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 250ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 250ms",
            }}
          >
            <p className="text-[1.25rem] font-semibold" style={{ color: "var(--sf-text-secondary)" }}>
              Team
            </p>
            <p className="mt-2 text-[1.5rem]" style={{ color: "var(--sf-text-muted)" }}>
              Coming soon
            </p>

            <ul className="mt-6 space-y-3" role="list">
              {teamFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-[0.9375rem]" style={{ color: "var(--sf-text-secondary)" }}>
                  <Check muted />
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href="#waitlist"
              className="sf-btn-secondary mt-8 w-full text-base"
              style={{ display: "flex", justifyContent: "center" }}
              onClick={() => trackCTAClick("Join the Waitlist", "pricing-team")}
            >
              Join the Waitlist
            </a>
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────── */}
      <section
        ref={faqRef as React.RefObject<HTMLElement>}
        className="px-[var(--sf-container-gutter)]"
        style={{ paddingTop: "var(--sf-section-padding)", paddingBottom: "var(--sf-section-padding)" }}
        aria-labelledby="faq-heading"
      >
        <div
          className="sf-card max-w-[var(--sf-container-narrow)] mx-auto"
          style={{
            opacity: faqInView ? 1 : 0,
            transform: faqInView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <h2
            id="faq-heading"
            className="font-display font-bold text-center mb-10"
            style={{
              fontSize: "var(--sf-text-h2)",
              lineHeight: "var(--sf-leading-h2)",
              letterSpacing: "var(--sf-tracking-h2)",
              color: "var(--sf-text-primary)",
            }}
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

      {/* ─── Integration Badges ──────────────────────────── */}
      <section
        ref={badgesRef as React.RefObject<HTMLElement>}
        className="px-[var(--sf-container-gutter)]"
        style={{ paddingTop: "var(--sf-section-padding-sm)", paddingBottom: "var(--sf-section-padding-sm)" }}
        aria-label="Compatible integrations"
      >
        <div className="max-w-[var(--sf-container-max)] mx-auto">
          <p
            className="text-center uppercase font-medium mb-8"
            style={{
              fontSize: "var(--sf-text-small)",
              letterSpacing: "var(--sf-tracking-overline)",
              color: "var(--sf-text-muted)",
              opacity: badgesInView ? 1 : 0,
              transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            Works with any MCP-compatible agent
          </p>
          <div
            className="flex flex-wrap items-center justify-center gap-3 md:gap-4"
            style={{
              opacity: badgesInView ? 1 : 0,
              transform: badgesInView ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 100ms",
            }}
          >
            {integrations.map((name) => (
              <span key={name} className="sf-pill">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
