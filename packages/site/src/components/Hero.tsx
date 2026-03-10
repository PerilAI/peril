export function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-20 pb-24">
      <div className="mx-auto max-w-[var(--container-narrow)] text-center">
        {/* Eyebrow */}
        <p className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-border bg-surface px-4 py-1.5 text-caption text-text-secondary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-[glow-pulse_2s_ease-in-out_infinite]" aria-hidden="true" />
          Now in public beta
        </p>

        {/* Headline — serif, hero scale */}
        <h1 className="font-display text-hero leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-text-primary">
          Visual feedback your{" "}
          <span className="text-accent">agents</span> understand
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 text-body-lg leading-[var(--leading-relaxed)] text-text-secondary max-w-xl mx-auto">
          Click any element, leave a comment, and your coding agent gets
          structured locators, screenshots, and context via MCP.
          No copy-pasting. No re-describing.
        </p>

        {/* Dual CTA */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <a
            href="#get-started"
            className="inline-flex items-center rounded-[var(--radius-md)] bg-accent px-6 py-3 text-base font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-md"
          >
            Try Peril Free
          </a>
          <a
            href="#how-it-works"
            className="inline-flex items-center rounded-[var(--radius-md)] border border-border px-6 py-3 text-base font-medium text-text-secondary transition-all duration-[var(--duration-fast)] hover:border-accent hover:text-text-primary"
          >
            See How It Works
          </a>
        </div>
      </div>
    </section>
  );
}
