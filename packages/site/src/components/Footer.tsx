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
  { href: "/docs/changelog", label: "Changelog" },
] as const;

/* ─── Closing CTA Section ──────────────────────────────── */

function ClosingCTA() {
  const [sectionRef, inView] = useInView(0.2);

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className="sf-aurora relative"
      style={{ paddingTop: "160px", paddingBottom: "160px" }}
      aria-label="Get started with Peril"
    >
      <div
        className="max-w-[var(--sf-container-narrow)] mx-auto text-center px-[var(--sf-container-gutter)]"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(20px)",
          transition:
            "opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <h2
          className="font-display font-[800] mb-4"
          style={{
            fontSize: "var(--sf-text-h1)",
            lineHeight: "var(--sf-leading-h1)",
            letterSpacing: "var(--sf-tracking-h1)",
            background: "var(--sf-gradient-arc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Ready to ship fixes faster?
        </h2>
        <p
          className="max-w-md mx-auto mb-8"
          style={{
            fontSize: "var(--sf-text-body-lg)",
            color: "var(--sf-text-secondary)",
          }}
        >
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
            className="sf-btn-primary"
            onClick={() => trackCTAClick("Try Peril Free", "closing-cta")}
          >
            Try Peril Free
          </a>
          <a
            href="/docs"
            className="sf-btn-secondary"
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
        role="contentinfo"
        style={{
          background: "var(--sf-bg-space)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
        className="px-[var(--sf-container-gutter)]"
      >
        <div className="max-w-[var(--sf-container-max)] mx-auto py-16 grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Left: brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--sf-accent)" }}
                aria-hidden="true"
              />
              <span
                className="font-display text-lg font-bold"
                style={{ color: "var(--sf-text-primary)" }}
              >
                Peril
              </span>
            </div>
            <p style={{ fontSize: "var(--sf-text-small)", color: "var(--sf-text-secondary)", maxWidth: "28ch" }}>
              Visual feedback your agents understand.
            </p>
            <p className="mt-4" style={{ fontSize: "var(--sf-text-caption)", color: "var(--sf-text-muted)" }}>
              &copy; {year} Peril
            </p>
          </div>

          {/* Center: nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="transition-colors duration-[var(--sf-duration-fast)]"
                    style={{ fontSize: "var(--sf-text-small)", color: "var(--sf-text-secondary)" }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--sf-text-primary)"; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--sf-text-secondary)"; }}
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

          {/* Right: install command */}
          <div>
            <p className="mb-3" style={{ fontSize: "var(--sf-text-caption)", color: "var(--sf-text-muted)", textTransform: "uppercase", letterSpacing: "var(--sf-tracking-overline)" }}>
              Get started
            </p>
            <div className="sf-code-block" style={{ fontSize: "var(--sf-text-mono)" }}>
              <span style={{ color: "var(--sf-text-muted)" }}>$</span>{" "}
              <span style={{ color: "var(--sf-text-primary)" }}>npm install</span>{" "}
              <span style={{ color: "var(--sf-accent)" }}>@anthropic/peril</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="py-6 text-center"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            fontSize: "var(--sf-text-caption)",
            color: "var(--sf-text-muted)",
          }}
        >
          Built for the agents that build your software.
        </div>
      </footer>
    </>
  );
}
