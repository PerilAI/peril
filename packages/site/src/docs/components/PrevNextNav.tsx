import { Link, useLocation } from "react-router-dom";
import { getPrevNext } from "../navigation";

export function PrevNextNav() {
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/^\/docs\/?/, "");
  const { prev, next } = getPrevNext(currentPath);

  if (!prev && !next) return null;

  const cardStyle: React.CSSProperties = {
    background: "var(--sf-bg-elevated)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "var(--sf-radius-md)",
    transitionProperty: "border-color, transform, box-shadow",
    transitionDuration: "var(--sf-duration-fast)",
  };

  const cardHover = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "rgba(255,255,255,0.12)";
    el.style.transform = "translateY(-2px)";
    el.style.boxShadow = "0 4px 16px rgba(245,158,11,0.06)";
  };

  const cardLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.borderColor = "rgba(255,255,255,0.06)";
    el.style.transform = "translateY(0)";
    el.style.boxShadow = "none";
  };

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex gap-4 pt-6"
      style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {prev ? (
        <Link
          to={prev.path ? `/docs/${prev.path}` : "/docs"}
          className="flex flex-1 flex-col p-4 transition-all"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
        >
          <span
            className="text-xs"
            style={{ color: "var(--sf-text-muted)" }}
          >
            Previous
          </span>
          <span
            className="mt-1 flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--sf-text-primary)" }}
          >
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
          className="flex flex-1 flex-col items-end p-4 transition-all"
          style={cardStyle}
          onMouseEnter={cardHover}
          onMouseLeave={cardLeave}
        >
          <span
            className="text-xs"
            style={{ color: "var(--sf-text-muted)" }}
          >
            Next
          </span>
          <span
            className="mt-1 flex items-center gap-1 text-sm font-medium"
            style={{ color: "var(--sf-text-primary)" }}
          >
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
