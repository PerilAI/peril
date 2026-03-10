export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <nav
        className="mx-auto flex max-w-[var(--container-max)] items-center justify-between px-6 py-4"
        aria-label="Main navigation"
      >
        <a
          href="/"
          className="font-display text-xl tracking-tight text-text-primary"
        >
          Peril
        </a>
        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
          >
            How it works
          </a>
          <a
            href="/docs"
            className="text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
          >
            Docs
          </a>
          <a
            href="https://github.com/anthropics/peril"
            className="text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
            <span className="sr-only"> (opens in new tab)</span>
          </a>
          <a
            href="#get-started"
            className="inline-flex items-center rounded-[var(--radius-md)] bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-sm"
          >
            Try Peril Free
          </a>
        </div>
      </nav>
    </header>
  );
}
