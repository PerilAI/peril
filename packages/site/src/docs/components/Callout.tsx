import type { ReactNode } from "react";

type CalloutVariant = "tip" | "warning" | "note";

const variantConfig: Record<CalloutVariant, { border: string; icon: string }> =
  {
    tip: {
      border: "border-l-[hsl(150,50%,45%)]",
      icon: "\u{1F4A1}",
    },
    warning: {
      border: "border-l-amber-400",
      icon: "\u26A0\uFE0F",
    },
    note: {
      border: "border-l-[hsl(220,60%,55%)]",
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
      className={`my-4 rounded-[var(--radius-md)] border-l-4 ${cfg.border} bg-surface p-4`}
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
