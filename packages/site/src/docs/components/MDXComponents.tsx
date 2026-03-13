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
  style,
  ...props
}: {
  as: "h1" | "h2" | "h3" | "h4";
  id?: string | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
  style?: React.CSSProperties | undefined;
  [key: string]: unknown;
}) {
  const text = extractText(children);
  const slug = id || slugify(text);

  return (
    <Tag
      id={slug}
      className={`group scroll-mt-24 ${className ?? ""}`}
      style={style}
      {...props}
    >
      {children}
      <a
        href={`#${slug}`}
        className="ml-2 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          color: "var(--sf-text-muted)",
          transitionDuration: "var(--sf-duration-fast)",
        }}
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
        className="sf-code-block overflow-x-auto p-4 text-sm leading-relaxed"
        {...props}
      >
        {children}
      </pre>
      <button
        type="button"
        className="absolute right-2 top-2 rounded-[var(--sf-radius-sm)] px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          fontFamily: "var(--sf-font-mono)",
          border: "1px solid rgba(255,255,255,0.06)",
          background: "var(--sf-bg-elevated)",
          color: "var(--sf-text-secondary)",
          transitionDuration: "var(--sf-duration-fast)",
        }}
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
      className="mb-6 text-[1.75rem]"
      style={{
        fontFamily: "var(--sf-font-display)",
        fontWeight: 800,
        color: "var(--sf-text-primary)",
        letterSpacing: "var(--sf-tracking-h1)",
      }}
      {...props}
    />
  ),
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <HeadingAnchor
      as="h2"
      className="mb-4 mt-10 pb-2 text-[1.5rem] font-bold"
      style={{
        fontFamily: "var(--sf-font-display)",
        fontWeight: 700,
        color: "var(--sf-text-primary)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
      {...props}
    />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <HeadingAnchor
      as="h3"
      className="mb-3 mt-8 text-[1.25rem] font-semibold"
      style={{
        fontFamily: "var(--sf-font-display)",
        fontWeight: 700,
        color: "var(--sf-text-primary)",
      }}
      {...props}
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <HeadingAnchor
      as="h4"
      className="mb-2 mt-6 text-[1.125rem] font-semibold"
      style={{
        fontFamily: "var(--sf-font-body)",
        fontWeight: 600,
        color: "var(--sf-text-primary)",
      }}
      {...props}
    />
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p
      className="mb-4 leading-[1.7]"
      style={{ color: "var(--sf-text-secondary)" }}
      {...props}
    />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="underline underline-offset-2 transition-colors"
      style={{
        color: "var(--sf-accent)",
        transitionDuration: "var(--sf-duration-fast)",
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "var(--sf-accent-hover)"; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "var(--sf-accent)"; }}
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul
      className="mb-4 ml-6 list-disc space-y-1"
      style={{ color: "var(--sf-text-secondary)" }}
      {...props}
    />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol
      className="mb-4 ml-6 list-decimal space-y-1"
      style={{ color: "var(--sf-text-secondary)" }}
      {...props}
    />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-[1.7]" {...props} />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => {
    if (!props.className?.includes("language-") && !("data-language" in props)) {
      return (
        <code
          className="rounded-[var(--sf-radius-sm)] px-1.5 py-0.5 text-[0.875rem]"
          style={{
            fontFamily: "var(--sf-font-mono)",
            background: "var(--sf-bg-elevated)",
            color: "var(--sf-accent)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
          {...props}
        />
      );
    }
    return <code {...props} />;
  },
  pre: Pre,
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-4 pl-4 italic"
      style={{
        borderLeft: "4px solid rgba(255,255,255,0.06)",
        color: "var(--sf-text-muted)",
      }}
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
      className="px-3 py-2 text-left font-semibold"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        background: "var(--sf-bg-elevated)",
        color: "var(--sf-text-primary)",
      }}
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-3 py-2"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        color: "var(--sf-text-secondary)",
      }}
      {...props}
    />
  ),
  hr: () => (
    <hr
      className="my-8"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    />
  ),
  Callout,
};
