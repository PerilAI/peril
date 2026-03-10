import { Link } from "react-router-dom";
import { DocsSearch } from "./DocsSearch";

interface DocsHeaderProps {
  onMenuToggle: () => void;
}

export function DocsHeader({ onMenuToggle }: DocsHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle bg-bg/80 backdrop-blur-md">
      <div className="flex items-center gap-4 px-4 py-3 lg:px-6">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-[var(--radius-sm)] p-1 text-text-secondary hover:text-text-primary lg:hidden"
          aria-label="Toggle navigation"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 5h14M3 10h14M3 15h14" />
          </svg>
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="font-display text-lg tracking-tight text-text-primary"
        >
          Peril
        </Link>
        <span className="rounded-[var(--radius-sm)] bg-surface-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
          Docs
        </span>

        {/* Search */}
        <div className="ml-auto w-full max-w-xs">
          <DocsSearch />
        </div>

        {/* Back to site */}
        <Link
          to="/"
          className="hidden text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary md:inline-flex"
        >
          Home
        </Link>
        <a
          href="https://github.com/anthropics/peril"
          className="hidden text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary md:inline-flex"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
