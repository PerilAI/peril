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
      // Focus after the modal renders
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  return (
    <>
      {/* Search trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-[var(--radius-md)] border border-border-subtle bg-surface-elevated px-3 py-2 text-sm text-text-secondary transition-colors duration-[var(--duration-fast)] hover:border-border hover:text-text-primary"
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
        <kbd className="hidden rounded border border-border-subtle bg-bg px-1.5 py-0.5 font-mono text-xs text-text-muted sm:inline-block">
          {"\u2318"}K
        </kbd>
      </button>

      {/* Search modal */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-x-4 top-[15vh] z-50 mx-auto max-w-lg rounded-[var(--radius-lg)] border border-border-subtle bg-surface shadow-2xl">
            <div className="flex items-center border-b border-border-subtle px-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="shrink-0 text-text-muted"
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
                className="flex-1 bg-transparent px-3 py-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && results.length > 0) {
                    handleSelect(results[0]!.path);
                  }
                }}
              />
              <kbd className="rounded border border-border-subtle bg-bg px-1.5 py-0.5 font-mono text-xs text-text-muted">
                Esc
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-text-muted">
                  No results found.
                </li>
              ) : (
                results.map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.path)}
                      className="w-full rounded-[var(--radius-sm)] px-3 py-2 text-left text-sm text-text-primary transition-colors duration-[var(--duration-fast)] hover:bg-surface-elevated"
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
