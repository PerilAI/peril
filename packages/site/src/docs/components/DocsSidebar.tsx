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
          <h3
            className="mb-1 px-2 text-[0.8125rem] font-semibold uppercase"
            style={{
              fontFamily: "var(--sf-font-mono)",
              fontSize: "var(--sf-text-caption)",
              letterSpacing: "0.1em",
              color: "var(--sf-text-muted)",
            }}
          >
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
                    className="block rounded-[var(--sf-radius-sm)] px-2 py-1.5 text-[0.9375rem] transition-colors"
                    style={{
                      transitionDuration: "var(--sf-duration-fast)",
                      ...(isActive
                        ? {
                            borderLeft: "2px solid var(--sf-accent)",
                            color: "var(--sf-accent)",
                            background: "rgba(245,158,11,0.06)",
                          }
                        : {
                            color: "var(--sf-text-secondary)",
                          }),
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "var(--sf-bg-elevated)";
                        (e.currentTarget as HTMLElement).style.color = "var(--sf-text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--sf-text-secondary)";
                      }
                    }}
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
      <aside
        className="hidden w-60 shrink-0 lg:block"
        style={{
          background: "var(--sf-bg-space)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: "rgba(6,6,14,0.80)" }}
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className="sf-glass-strong fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            style={{
              background: "var(--sf-bg-space)",
              boxShadow: "4px 0 24px rgba(0,0,0,0.5)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span
                className="text-sm font-semibold"
                style={{
                  fontFamily: "var(--sf-font-display)",
                  color: "var(--sf-text-primary)",
                }}
              >
                Documentation
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-[var(--sf-radius-sm)] p-1"
                style={{ color: "var(--sf-text-secondary)" }}
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
