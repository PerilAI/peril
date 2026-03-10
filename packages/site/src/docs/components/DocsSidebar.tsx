import { Link, useLocation } from "react-router-dom";
import { navigation } from "../navigation";

interface DocsSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function DocsSidebar({ open, onClose }: DocsSidebarProps) {
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/^\/docs\/?/, "");

  const sidebar = (
    <nav
      aria-label="Documentation navigation"
      className="flex h-full flex-col overflow-y-auto px-4 py-6"
    >
      {navigation.map((section) => (
        <div key={section.title} className="mb-4">
          <h3 className="mb-1 px-2 font-body text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-text-secondary">
            {section.title}
          </h3>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const href = item.path ? `/docs/${item.path}` : "/docs";
              const isActive = currentPath === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={href}
                    onClick={onClose}
                    className={`block rounded-[var(--radius-sm)] px-2 py-1.5 text-[0.9375rem] transition-colors duration-[var(--duration-fast)] ${
                      isActive
                        ? "border-l-2 border-accent text-accent"
                        : "text-text-primary hover:bg-surface-elevated"
                    }`}
                  >
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border-subtle bg-surface lg:block">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-lg lg:hidden">
            <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
              <span className="font-body text-sm font-semibold text-text-primary">
                Documentation
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--radius-sm)] p-1 text-text-secondary hover:text-text-primary"
                aria-label="Close navigation"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>
            {sidebar}
          </aside>
        </>
      )}
    </>
  );
}
