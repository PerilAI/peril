/**
 * ProductFrame — Static mockup of the Peril overlay in action.
 *
 * Shows a sample app UI inside a browser chrome frame with:
 * - A highlighted element (pricing card) with amber glow border
 * - A floating comment bubble
 * - Structured MCP output panel
 *
 * This is a placeholder — PER-48 will replace it with an animated micro-demo.
 */
export function ProductFrame() {
  return (
    <div className="rounded-[var(--radius-xl)] border border-border-subtle bg-surface overflow-hidden shadow-lg shadow-black/20">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-elevated px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-neutral-700" />
          <span className="h-3 w-3 rounded-full bg-neutral-700" />
          <span className="h-3 w-3 rounded-full bg-neutral-700" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="rounded-[var(--radius-md)] bg-bg/60 border border-border-subtle px-4 py-1 text-caption text-text-muted font-mono max-w-[280px] w-full text-center truncate">
            localhost:3000/settings
          </div>
        </div>
        <div className="w-[54px]" /> {/* Balance the dots */}
      </div>

      {/* App content area */}
      <div className="relative p-6 sm:p-8 bg-bg min-h-[320px] sm:min-h-[400px]">
        {/* Sample app UI — settings page */}
        <div className="grid gap-6 sm:grid-cols-[1fr_280px]">
          {/* Left: settings content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 rounded-[var(--radius-md)] bg-surface-elevated" />
              <div>
                <div className="h-3 w-32 rounded bg-surface-elevated mb-1.5" />
                <div className="h-2 w-48 rounded bg-border-subtle" />
              </div>
            </div>

            {/* Nav skeleton */}
            <div className="flex gap-4 mb-6 border-b border-border-subtle pb-3">
              <div className="h-2.5 w-16 rounded bg-accent/40" />
              <div className="h-2.5 w-16 rounded bg-border-subtle" />
              <div className="h-2.5 w-20 rounded bg-border-subtle" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-4">
              <div>
                <div className="h-2 w-20 rounded bg-border-subtle mb-2" />
                <div className="h-9 rounded-[var(--radius-md)] border border-border-subtle bg-surface" />
              </div>
              <div>
                <div className="h-2 w-24 rounded bg-border-subtle mb-2" />
                <div className="h-9 rounded-[var(--radius-md)] border border-border-subtle bg-surface" />
              </div>
              <div className="h-9 w-24 rounded-[var(--radius-md)] bg-surface-elevated" />
            </div>
          </div>

          {/* Right: the pricing card being annotated */}
          <div className="relative">
            {/* Annotated element — amber glow highlight */}
            <div className="rounded-[var(--radius-lg)] border-2 border-accent bg-surface p-5 shadow-glow-md">
              <div className="h-2.5 w-12 rounded bg-accent/60 mb-3" />
              <div className="font-display text-h3 text-text-primary mb-1">$29</div>
              <div className="h-2 w-24 rounded bg-border-subtle mb-4" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-accent text-sm">&#10003;</span>
                  <div className="h-2 w-28 rounded bg-border-subtle" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent text-sm">&#10003;</span>
                  <div className="h-2 w-24 rounded bg-border-subtle" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-accent text-sm">&#10003;</span>
                  <div className="h-2 w-32 rounded bg-border-subtle" />
                </div>
              </div>
              <div className="mt-4 h-8 rounded-[var(--radius-md)] bg-accent/20 border border-accent/30" />
            </div>

            {/* Comment bubble */}
            <div className="absolute -top-3 -right-3 sm:-right-4 rounded-[var(--radius-lg)] border border-border bg-surface-elevated px-4 py-3 shadow-lg shadow-black/30 max-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded-full bg-accent/30 flex items-center justify-center">
                  <span className="text-accent text-[10px] font-bold">J</span>
                </div>
                <span className="text-caption text-text-muted">Just now</span>
              </div>
              <p className="text-sm text-text-primary leading-snug">
                Price feels too high for the starter tier — can we test $19?
              </p>
            </div>
          </div>
        </div>

        {/* MCP output strip at bottom */}
        <div className="mt-6 rounded-[var(--radius-md)] border border-border-subtle bg-surface-elevated p-4 font-mono text-caption">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="text-accent font-medium">MCP Output</span>
            <span className="text-text-muted">— structured task for your agent</span>
          </div>
          <div className="text-text-secondary space-y-0.5 overflow-hidden">
            <div>
              <span className="text-text-muted">{"{"}</span>
              <span className="text-accent">"locator"</span>
              <span className="text-text-muted">: </span>
              <span className="text-amber-200">"[data-testid='pricing-card-starter']"</span>
              <span className="text-text-muted">,</span>
            </div>
            <div className="pl-2">
              <span className="text-accent">"comment"</span>
              <span className="text-text-muted">: </span>
              <span className="text-amber-200">"Price feels too high for starter..."</span>
              <span className="text-text-muted">,</span>
            </div>
            <div className="pl-2">
              <span className="text-accent">"screenshot"</span>
              <span className="text-text-muted">: </span>
              <span className="text-amber-200">"artifact://review-42/element-1.png"</span>
            </div>
            <div>
              <span className="text-text-muted">{"}"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
