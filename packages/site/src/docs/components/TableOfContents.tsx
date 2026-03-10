import { useState, useEffect } from "react";

interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector("[data-docs-content]");
    if (!article) return;

    const els = article.querySelectorAll("h2, h3");
    const entries: TocEntry[] = Array.from(els).map((el) => ({
      id: el.id,
      text: el.textContent?.replace(/#$/, "").trim() ?? "",
      level: el.tagName === "H2" ? 2 : 3,
    }));
    setHeadings(entries);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0.1 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="hidden w-48 shrink-0 xl:block"
    >
      <div className="sticky top-24">
        <h4 className="mb-3 font-body text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
          On this page
        </h4>
        <ul className="space-y-1 border-l border-border-subtle">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block border-l-2 py-1 text-[0.8125rem] leading-snug transition-colors duration-[var(--duration-fast)] ${
                  h.level === 3 ? "pl-5" : "pl-3"
                } ${
                  activeId === h.id
                    ? "border-accent text-accent"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
