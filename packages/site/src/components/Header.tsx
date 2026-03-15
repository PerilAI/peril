import { useCallback, useEffect, useRef, useState } from "react";
import { GITHUB_URL } from "../constants";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  {
    href: GITHUB_URL,
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
    <header className="sf-header">
      <nav
        className="mx-auto flex w-full max-w-[var(--sf-container-max)] items-center justify-between"
        aria-label="Main navigation"
      >
        <a
          href="/"
          className="font-display text-xl font-bold tracking-tight"
          style={{ color: "var(--sf-text-primary)" }}
        >
          Peril
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 sm:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="sf-btn-ghost text-sm"
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
          <a
            href="#get-started"
            className="sf-btn-primary"
            style={{ padding: "8px 20px", fontSize: "var(--sf-text-small)" }}
          >
            Try Peril Free
          </a>
        </div>

        {/* Mobile hamburger button */}
        <button
          ref={toggleRef}
          type="button"
          className="inline-flex items-center justify-center rounded-[var(--sf-radius-sm)] p-2 transition-colors duration-[var(--sf-duration-fast)] sm:hidden"
          style={{ color: "var(--sf-text-secondary)" }}
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
        className={`sf-glass-strong fixed inset-x-0 top-[56px] bottom-0 z-40 transition-transform sm:hidden motion-reduce:transition-none ${
          menuOpen ? "translate-y-0" : "-translate-y-[calc(100%+56px)]"
        }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col gap-2 px-6 py-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-[var(--sf-radius-sm)] px-4 py-3 text-base transition-colors duration-[var(--sf-duration-fast)]"
              style={{ color: "var(--sf-text-secondary)" }}
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
          <a
            href="#get-started"
            className="sf-btn-primary mt-2 text-base"
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
