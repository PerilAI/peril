import type { ReactNode } from "react";

type CalloutVariant = "tip" | "warning" | "note";

const variantConfig: Record<CalloutVariant, { border: string; icon: string }> =
  {
    tip: {
      border: "hsl(150,50%,45%)",
      icon: "\u{1F4A1}",
    },
    warning: {
      border: "#fbbf24",
      icon: "\u26A0\uFE0F",
    },
    note: {
      border: "hsl(220,60%,55%)",
      icon: "\u2139\uFE0F",
    },
  };

export function Callout({
  variant = "note",
  children,
}: {
  variant?: CalloutVariant;
  children: ReactNode;
}) {
  const cfg = variantConfig[variant];
  return (
    <div
      className="my-4 rounded-[var(--sf-radius-md)] p-4"
      style={{
        borderLeft: `4px solid ${cfg.border}`,
        background: "var(--sf-bg-elevated)",
        border: `1px solid rgba(255,255,255,0.06)`,
        borderLeftWidth: "4px",
        borderLeftColor: cfg.border,
      }}
    >
      <div className="flex gap-3">
        <span className="shrink-0 text-lg" aria-hidden="true">
          {cfg.icon}
        </span>
        <div className="[&>p]:mb-0">{children}</div>
      </div>
    </div>
  );
}
