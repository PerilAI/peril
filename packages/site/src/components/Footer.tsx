import { trackCTAClick } from "../analytics";
import { useInView } from "../hooks/useInView";

/* ─── Navigation Links ─────────────────────────────────── */

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  {
    href: "https://github.com/anthropics/peril",
    label: "GitHub",
    external: true,
  },
] as const;

/* ─── Closing CTA Section ──────────────────────────────── */

function ClosingCTA() {
  const [sectionRef, inView] = useInView(0.2);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="py-[var(--section-padding-y)] px-[var(--container-padding)]"
      aria-label="Get started with Peril"
    >
      <div
        className="max-w-[var(--container-narrow)] mx-auto text-center"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h2 className="text-[var(--text-h1)] font-[family-name:var(--font-display)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] mb-4">
          Ready to ship fixes faster?
        </h2>
        <p className="text-[var(--color-text-secondary)] text-[var(--text-body-lg)] max-w-md mx-auto mb-8">
          Turn visual feedback into agent-ready tasks. Free for local
          development.
        </p>
        <div
          className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(12px)",
            transition:
              "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms, transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 200ms",
          }}
        >
          <a
            href="#get-started"
            className="inline-flex items-center rounded-[var(--radius-md)] bg-accent px-7 py-3.5 text-base font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-md"
            onClick={() => trackCTAClick("Try Peril Free", "closing-cta")}
          >
            Try Peril Free
          </a>
          <a
            href="/docs"
            className="inline-flex items-center rounded-[var(--radius-md)] border border-border px-7 py-3.5 text-base font-medium text-text-secondary transition-all duration-[var(--duration-fast)] hover:border-text-secondary hover:bg-surface hover:text-text-primary"
            onClick={() => trackCTAClick("Read the Docs", "closing-cta")}
          >
            Read the Docs
          </a>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ───────────────────────────────────────────── */

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <>
      <ClosingCTA />

      <footer
        className="border-t border-border px-[var(--container-padding)] py-[var(--space-12)]"
        role="contentinfo"
      >
        <div className="max-w-[var(--container-max)] mx-auto flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 text-[var(--color-text)]">
            <span
              className="inline-block h-2 w-2 rounded-full bg-accent"
              aria-hidden="true"
            />
            <span className="font-[family-name:var(--font-display)] text-[var(--text-body-lg)]">
              Peril
            </span>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[var(--text-small)] text-[var(--color-text-secondary)] transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-text)]"
                    {...("external" in link && link.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Copyright */}
          <p className="text-[var(--text-caption)] text-[var(--color-text-muted)]">
            &copy; {year} Peril
          </p>
        </div>
      </footer>
    </>
  );
}
