import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-(--border-subtle) bg-(--bg)/80 backdrop-blur-lg">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
        aria-label="Main navigation"
      >
        <a href="/" className="flex items-center gap-2 text-lg font-semibold text-(--fg)">
          <span
            className="inline-block h-6 w-6 rounded-md bg-accent-500"
            aria-hidden="true"
          />
          Peril
        </a>

        <div className="flex items-center gap-6">
          <a
            href="#how-it-works"
            className="text-sm text-(--fg-secondary) transition-colors hover:text-(--fg)"
          >
            How it works
          </a>
          <a
            href="https://github.com/nicholasgriffintn/peril"
            className="text-sm text-(--fg-secondary) transition-colors hover:text-(--fg)"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <ThemeToggle />
          <a
            href="#get-started"
            className="glow rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-surface-950 transition-all hover:bg-accent-400"
          >
            Try Peril Free
          </a>
        </div>
      </nav>
    </header>
  );
}
