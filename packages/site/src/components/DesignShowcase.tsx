/**
 * Temporary design system showcase — demonstrates tokens in use.
 * Will be replaced by actual marketing sections in later tickets.
 */
export function DesignShowcase() {
  return (
    <section className="border-t border-border px-6 py-24" aria-label="Design system showcase">
      <div className="mx-auto max-w-[var(--container-max)]">
        {/* Section: Typography */}
        <div className="mb-20">
          <p className="mb-4 text-caption font-medium uppercase tracking-[var(--tracking-wider)] text-accent">
            Typography
          </p>
          <h2 className="font-display text-h1 leading-[var(--leading-tight)] tracking-[var(--tracking-tight)]">
            DM Serif Display
          </h2>
          <p className="mt-4 text-body-lg leading-[var(--leading-relaxed)] text-text-secondary max-w-2xl">
            A distinctive serif headline font paired with Inter for body text.
            Breaks from the sans-serif monoculture while maintaining excellent
            readability.
          </p>

          <div className="mt-10 grid gap-4">
            <TypeSample label="Hero" className="font-display text-hero leading-[var(--leading-tight)]" />
            <TypeSample label="H1" className="font-display text-h1 leading-[var(--leading-tight)]" />
            <TypeSample label="H2" className="font-display text-h2 leading-[var(--leading-snug)]" />
            <TypeSample label="H3" className="font-display text-h3 leading-[var(--leading-snug)]" />
            <TypeSample label="H4" className="font-display text-h4 leading-[var(--leading-snug)]" />
            <TypeSample label="Body Large" className="text-body-lg leading-[var(--leading-relaxed)]" text="Inter 18px — used for lead paragraphs and hero sub-headlines." />
            <TypeSample label="Body" className="text-base leading-[var(--leading-normal)]" text="Inter 16px — the workhorse. Used for all general body content." />
            <TypeSample label="Small" className="text-sm leading-[var(--leading-normal)]" text="Inter 14px — secondary content, metadata, and supporting information." />
            <TypeSample label="Caption" className="text-caption leading-[var(--leading-normal)]" text="Inter 12px — labels, timestamps, and fine print." />
          </div>
        </div>

        {/* Section: Colors */}
        <div className="mb-20">
          <p className="mb-4 text-caption font-medium uppercase tracking-[var(--tracking-wider)] text-accent">
            Colors
          </p>
          <h2 className="font-display text-h2 leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
            Amber &amp; warmth
          </h2>
          <p className="mt-4 text-body-lg leading-[var(--leading-relaxed)] text-text-secondary max-w-2xl">
            A warm amber/gold accent on a near-black base. Not blue — distinctive and tied
            to the annotation glow interaction.
          </p>

          <div className="mt-10">
            <p className="mb-3 text-sm font-medium text-text-secondary">Accent ramp</p>
            <div className="flex gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="flex flex-col items-center gap-1.5">
                  <div
                    className="h-12 w-12 rounded-[var(--radius-md)]"
                    style={{ backgroundColor: `var(--color-amber-${shade})` }}
                    aria-hidden="true"
                  />
                  <span className="text-caption text-text-muted">{shade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-text-secondary">Neutral ramp</p>
            <div className="flex gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                <div key={shade} className="flex flex-col items-center gap-1.5">
                  <div
                    className="h-12 w-12 rounded-[var(--radius-md)] border border-border-subtle"
                    style={{ backgroundColor: `var(--color-neutral-${shade})` }}
                    aria-hidden="true"
                  />
                  <span className="text-caption text-text-muted">{shade}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <p className="mb-3 text-sm font-medium text-text-secondary">Semantic tokens</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <SemanticSwatch label="Background" className="bg-bg" />
              <SemanticSwatch label="Surface" className="bg-surface" />
              <SemanticSwatch label="Surface Elevated" className="bg-surface-elevated" />
              <SemanticSwatch label="Accent" className="bg-accent" />
            </div>
          </div>
        </div>

        {/* Section: Glow Effects */}
        <div className="mb-20">
          <p className="mb-4 text-caption font-medium uppercase tracking-[var(--tracking-wider)] text-accent">
            Effects
          </p>
          <h2 className="font-display text-h2 leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
            Glow system
          </h2>
          <p className="mt-4 text-body-lg leading-[var(--leading-relaxed)] text-text-secondary max-w-2xl">
            Amber glow effects tied to the annotation cursor interaction pattern.
            Three intensities for different interaction states.
          </p>

          <div className="mt-10 flex flex-wrap gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-[var(--radius-lg)] border border-accent bg-surface shadow-glow-sm" aria-hidden="true" />
              <span className="text-sm text-text-secondary">Glow SM</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-[var(--radius-lg)] border border-accent bg-surface shadow-glow-md" aria-hidden="true" />
              <span className="text-sm text-text-secondary">Glow MD</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-[var(--radius-lg)] border border-accent bg-surface shadow-glow-lg" aria-hidden="true" />
              <span className="text-sm text-text-secondary">Glow LG</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="h-20 w-20 rounded-[var(--radius-lg)] border border-accent bg-surface animate-[glow-pulse_2s_ease-in-out_infinite]" aria-hidden="true" />
              <span className="text-sm text-text-secondary">Glow Pulse</span>
            </div>
          </div>
        </div>

        {/* Section: Buttons */}
        <div>
          <p className="mb-4 text-caption font-medium uppercase tracking-[var(--tracking-wider)] text-accent">
            Components
          </p>
          <h2 className="font-display text-h2 leading-[var(--leading-snug)] tracking-[var(--tracking-tight)]">
            Buttons
          </h2>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center rounded-[var(--radius-md)] bg-accent px-6 py-3 text-base font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-md"
            >
              Primary CTA
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-border px-6 py-3 text-base font-medium text-text-secondary transition-all duration-[var(--duration-fast)] hover:border-accent hover:text-text-primary"
            >
              Secondary
            </button>
            <button
              type="button"
              className="inline-flex items-center rounded-[var(--radius-md)] px-6 py-3 text-base font-medium text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-accent"
            >
              Ghost
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TypeSample({
  label,
  className,
  text,
}: {
  label: string;
  className: string;
  text?: string;
}) {
  return (
    <div className="flex items-baseline gap-6 border-b border-border-subtle pb-4">
      <span className="w-24 shrink-0 text-caption font-medium uppercase tracking-[var(--tracking-wider)] text-text-muted">
        {label}
      </span>
      <span className={className}>{text ?? "The quick brown fox"}</span>
    </div>
  );
}

function SemanticSwatch({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`h-16 rounded-[var(--radius-md)] border border-border-subtle ${className}`}
        aria-hidden="true"
      />
      <span className="text-caption text-text-muted">{label}</span>
    </div>
  );
}
