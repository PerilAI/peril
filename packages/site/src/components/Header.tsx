import { useCallback, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  {
    href: "https://github.com/anthropics/peril",
    label: "GitHub",
    external: true,
  },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  // Focus trap
  useEffect(() => {
    if (!menuOpen || !menuRef.current) return;
    const menu = menuRef.current;
    const focusable = menu.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    first.focus();

    function onTab(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [menuOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

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

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary"
              {...("external" in link && link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
              {"external" in link && link.external && (
                <span className="sr-only"> (opens in new tab)</span>
              )}
            </a>
          ))}
          <ThemeToggle />
          <a
            href="#get-started"
            className="inline-flex items-center rounded-[var(--radius-md)] bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-sm"
          >
            Try Peril Free
          </a>
        </div>

        {/* Mobile hamburger button */}
        <button
          ref={toggleRef}
          type="button"
          className="inline-flex items-center justify-center rounded-[var(--radius-sm)] p-2 text-text-secondary transition-colors duration-[var(--duration-fast)] hover:text-text-primary sm:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {menuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        ref={menuRef}
        id="mobile-menu"
        className={`fixed inset-x-0 top-[calc(var(--header-height,61px))] bottom-0 z-40 border-t border-border-subtle bg-bg/95 backdrop-blur-lg transition-transform sm:hidden motion-reduce:transition-none ${
          menuOpen ? "translate-y-0" : "-translate-y-[calc(100%+61px)]"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-2 px-6 py-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[var(--radius-sm)] px-4 py-3 text-base text-text-secondary transition-colors duration-[var(--duration-fast)] hover:bg-surface hover:text-text-primary"
              tabIndex={menuOpen ? 0 : -1}
              onClick={closeMenu}
              {...("external" in link && link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
              {"external" in link && link.external && (
                <span className="sr-only"> (opens in new tab)</span>
              )}
            </a>
          ))}
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="text-sm text-text-muted">Theme</span>
            <ThemeToggle />
          </div>
          <a
            href="#get-started"
            className="mt-2 flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-6 py-3 text-base font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover"
            tabIndex={menuOpen ? 0 : -1}
            onClick={closeMenu}
          >
            Try Peril Free
          </a>
        </div>
      </div>
    </header>
  );
}
