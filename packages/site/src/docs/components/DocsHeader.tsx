import { Link } from "react-router-dom";
import { GITHUB_URL } from "../../constants";
import { DocsSearch } from "./DocsSearch";

interface DocsHeaderProps {
  onMenuToggle: () => void;
}

export function DocsHeader({ onMenuToggle }: DocsHeaderProps) {
  return (
    <header
      className="sticky top-0 z-30"
      style={{
        background: "rgba(6,6,14,0.70)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="flex items-center gap-4 px-4 py-3 lg:px-6">
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-[var(--sf-radius-sm)] p-1 lg:hidden"
          style={{ color: "var(--sf-text-secondary)" }}
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
          className="text-lg tracking-tight"
          style={{
            fontFamily: "var(--sf-font-display)",
            fontWeight: 700,
            color: "var(--sf-text-primary)",
          }}
        >
          Peril
        </Link>
        <span
          className="rounded-[var(--sf-radius-sm)] px-2 py-0.5 text-xs"
          style={{
            fontFamily: "var(--sf-font-mono)",
            color: "var(--sf-text-muted)",
            background: "var(--sf-bg-elevated)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          Docs
        </span>

        {/* Search */}
        <div className="ml-auto w-full max-w-xs">
          <DocsSearch />
        </div>

        {/* Back to site */}
        <Link
          to="/"
          className="hidden text-sm transition-colors duration-[var(--sf-duration-fast)] md:inline-flex"
          style={{ color: "var(--sf-text-secondary)" }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--sf-text-primary)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--sf-text-secondary)"; }}
        >
          Home
        </Link>
        <a
          href={GITHUB_URL}
          className="hidden text-sm transition-colors duration-[var(--sf-duration-fast)] md:inline-flex"
          style={{ color: "var(--sf-text-secondary)" }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--sf-text-primary)"; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--sf-text-secondary)"; }}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}
