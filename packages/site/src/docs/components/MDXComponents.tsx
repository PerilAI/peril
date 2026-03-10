import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Callout } from "./Callout";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (
    children &&
    typeof children === "object" &&
    "props" in children &&
    children.props?.children
  ) {
    return extractText(children.props.children);
  }
  return "";
}

function HeadingAnchor({
  as: Tag,
  id,
  children,
  className,
  ...props
}: {
  as: "h1" | "h2" | "h3" | "h4";
  id?: string | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
  [key: string]: unknown;
}) {
  const text = extractText(children);
  const slug = id || slugify(text);

  return (
    <Tag
      id={slug}
      className={`group scroll-mt-24 ${className ?? ""}`}
      {...props}
    >
      {children}
      <a
        href={`#${slug}`}
        className="ml-2 text-text-muted opacity-0 transition-opacity duration-[var(--duration-fast)] group-hover:opacity-100"
        aria-label={`Link to ${text}`}
      >
        #
      </a>
    </Tag>
  );
}

function Pre({ children, ...props }: ComponentPropsWithoutRef<"pre">) {
  return (
    <div className="group relative my-4">
      <pre
        className="overflow-x-auto rounded-[var(--radius-md)] border border-border-subtle bg-bg p-4 font-mono text-sm leading-relaxed"
        {...props}
      >
        {children}
      </pre>
      <button
        type="button"
        className="absolute right-2 top-2 rounded-[var(--radius-sm)] border border-border-subtle bg-surface-elevated px-2 py-1 font-mono text-xs text-text-secondary opacity-0 transition-opacity duration-[var(--duration-fast)] hover:text-text-primary group-hover:opacity-100"
        onClick={(e) => {
          const code = (
            e.currentTarget.parentElement?.querySelector(
              "code",
            ) as HTMLElement | null
          )?.innerText;
          if (code) {
            navigator.clipboard.writeText(code);
            e.currentTarget.textContent = "Copied!";
            setTimeout(() => {
              e.currentTarget.textContent = "Copy";
            }, 2000);
          }
        }}
      >
        Copy
      </button>
    </div>
  );
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => (
    <HeadingAnchor
      as="h1"
      className="mb-6 font-display text-[1.75rem] text-text-primary"
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <HeadingAnchor
      as="h2"
      className="mb-4 mt-10 border-b border-border-subtle pb-2 font-body text-[1.5rem] font-bold text-text-primary"
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <HeadingAnchor
      as="h3"
      className="mb-3 mt-8 font-body text-[1.25rem] font-semibold text-text-primary"
      {...props}
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <HeadingAnchor
      as="h4"
      className="mb-2 mt-6 font-body text-[1.125rem] font-semibold text-text-primary"
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4 leading-[1.7] text-text-secondary" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-accent underline underline-offset-2 transition-colors duration-[var(--duration-fast)] hover:text-accent-hover"
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-1 text-text-secondary"
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-1 text-text-secondary"
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-[1.7]" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => {
    // Inline code (not inside pre — detect by checking if data-* from rehype-pretty-code is present)
    if (!props.className?.includes("language-") && !("data-language" in props)) {
      return (
        <code
          className="rounded-[var(--radius-sm)] bg-surface-elevated px-1.5 py-0.5 font-mono text-[0.875rem] text-amber-300"
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: Pre,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-4 border-l-4 border-border-subtle pl-4 italic text-text-muted"
      {...props}
    />
  ),
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="border border-border-subtle bg-surface px-3 py-2 text-left font-semibold text-text-primary"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="border border-border-subtle px-3 py-2 text-text-secondary"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border-subtle" />,
  Callout,
};
