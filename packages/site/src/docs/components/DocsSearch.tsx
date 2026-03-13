import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { flatNavItems } from "../navigation";

export function DocsSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const results = query.trim()
    ? flatNavItems.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase()),
      )
    : flatNavItems;

  const handleSelect = useCallback(
    (path: string) => {
      navigate(path ? `/docs/${path}` : "/docs");
      setOpen(false);
      setQuery("");
    },
    [navigate],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <>
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-[var(--sf-radius-md)] px-3 py-2 text-sm transition-colors"
        style={{
          border: "1px solid rgba(255,255,255,0.06)",
          background: "var(--sf-bg-elevated)",
          color: "var(--sf-text-secondary)",
          transitionDuration: "var(--sf-duration-fast)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
          (e.currentTarget as HTMLElement).style.color = "var(--sf-text-primary)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
          (e.currentTarget as HTMLElement).style.color = "var(--sf-text-secondary)";
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="M10.5 10.5L14 14" />
        </svg>
        <span className="flex-1 text-left">Search docs...</span>
        <kbd
          className="hidden rounded px-1.5 py-0.5 text-xs sm:inline-block"
          style={{
            fontFamily: "var(--sf-font-mono)",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "var(--sf-bg-void)",
            color: "var(--sf-text-muted)",
          }}
        >
          {"\u2318"}K
        </kbd>
      </button>

      {/* Search modal */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(6,6,14,0.80)" }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-x-4 top-[15vh] z-50 mx-auto max-w-lg rounded-[var(--sf-radius-lg)]"
            style={{
              background: "var(--sf-bg-surface)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
              backdropFilter: "blur(16px) saturate(1.2)",
              WebkitBackdropFilter: "blur(16px) saturate(1.2)",
            }}
          >
            <div
              className="flex items-center px-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0"
                style={{ color: "var(--sf-text-muted)" }}
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5L14 14" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documentation..."
                className="flex-1 bg-transparent px-3 py-3 text-sm outline-none"
                style={{
                  color: "var(--sf-text-primary)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results.length > 0) {
                    handleSelect(results[0]!.path);
                  }
                }}
              />
              <kbd
                className="rounded px-1.5 py-0.5 text-xs"
                style={{
                  fontFamily: "var(--sf-font-mono)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "var(--sf-bg-void)",
                  color: "var(--sf-text-muted)",
                }}
              >
                Esc
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li
                  className="px-3 py-6 text-center text-sm"
                  style={{ color: "var(--sf-text-muted)" }}
                >
                  No results found.
                </li>
              ) : (
                results.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.path)}
                      className="w-full rounded-[var(--sf-radius-sm)] px-3 py-2 text-left text-sm transition-colors"
                      style={{
                        color: "var(--sf-text-primary)",
                        transitionDuration: "var(--sf-duration-fast)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "var(--sf-bg-elevated)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      {item.title}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );
}
