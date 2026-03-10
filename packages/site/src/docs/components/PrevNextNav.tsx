import { Link, useLocation } from "react-router-dom";
import { getPrevNext } from "../navigation";

export function PrevNextNav() {
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/^\/docs\/?/, "");
  const { prev, next } = getPrevNext(currentPath);

  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex gap-4 border-t border-border-subtle pt-6"
    >
      {prev ? (
        <Link
          to={prev.path ? `/docs/${prev.path}` : "/docs"}
          className="group flex flex-1 flex-col rounded-[var(--radius-md)] border border-border-subtle bg-surface p-4 transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:border-border hover:shadow-glow-sm"
        >
          <span className="text-xs text-text-muted">Previous</span>
          <span className="mt-1 flex items-center gap-1 text-sm font-medium text-text-primary">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="shrink-0"
            >
              <path d="M10 4L6 8l4 4" />
            </svg>
            {prev.title}
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          to={next.path ? `/docs/${next.path}` : "/docs"}
          className="group flex flex-1 flex-col items-end rounded-[var(--radius-md)] border border-border-subtle bg-surface p-4 transition-all duration-[var(--duration-fast)] hover:-translate-y-0.5 hover:border-border hover:shadow-glow-sm"
        >
          <span className="text-xs text-text-muted">Next</span>
          <span className="mt-1 flex items-center gap-1 text-sm font-medium text-text-primary">
            {next.title}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="shrink-0"
            >
              <path d="M6 4l4 4-4 4" />
            </svg>
          </span>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
