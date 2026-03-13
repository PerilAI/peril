import { useEffect, useRef, useState } from "react";

type Beat = "idle" | "cursor" | "glow" | "comment" | "output" | "fade";

const COMMENT_TEXT = "Button wraps at laptop widths";
const TYPING_SPEED = 40;

const MCP_LINES = [
  { key: "locator", value: '[data-testid="hero-cta"]' },
  { key: "type", value: "button" },
  { key: "comment", value: "Button wraps at laptop..." },
  { key: "severity", value: "medium" },
];

export function HeroMicroDemo() {
  const [beat, setBeat] = useState<Beat>("idle");
  const [typedChars, setTypedChars] = useState(0);
  const cancelledRef = useRef(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setBeat("output");
      setTypedChars(COMMENT_TEXT.length);
      return;
    }

    cancelledRef.current = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const schedule = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!cancelledRef.current) fn();
      }, ms);
      timeouts.push(id);
    };

    const runCycle = () => {
      if (cancelledRef.current) return;

      setBeat("cursor");
      setTypedChars(0);

      schedule(() => setBeat("glow"), 2500);

      schedule(() => {
        setBeat("comment");
        let i = 0;
        const interval = setInterval(() => {
          if (cancelledRef.current) {
            clearInterval(interval);
            return;
          }
          i++;
          setTypedChars(i);
          if (i >= COMMENT_TEXT.length) clearInterval(interval);
        }, TYPING_SPEED);
        intervals.push(interval);
      }, 4000);

      schedule(() => {
        setBeat("output");
        setTypedChars(COMMENT_TEXT.length);
      }, 6500);

      schedule(() => setBeat("fade"), 9000);
      schedule(runCycle, 10000);
    };

    schedule(runCycle, 800);

    return () => {
      cancelledRef.current = true;
      timeouts.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [reducedMotion]);

  const showCursor = beat === "cursor" || beat === "glow" || beat === "comment" || beat === "output";
  const showGlow = beat === "glow" || beat === "comment" || beat === "output";
  const showComment = beat === "comment" || beat === "output";
  const showOutput = beat === "output";
  const fading = beat === "fade";
  const dimUI = showGlow;

  return (
    <div
      className="sf-card-theater transition-opacity duration-[1000ms]"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {/* Browser chrome */}
      <div className="sf-glass-strong flex items-center gap-2 px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-dot-close" />
          <span className="h-3 w-3 rounded-full bg-dot-minimize" />
          <span className="h-3 w-3 rounded-full bg-dot-expand" />
        </div>
        <div className="flex-1 flex justify-center">
          <div
            className="w-full max-w-[280px] truncate rounded-[var(--sf-radius-md)] px-4 py-1 text-center font-mono text-caption"
            style={{
              color: "var(--sf-text-muted)",
              background: "var(--sf-bg-surface)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            localhost:3000/dashboard
          </div>
        </div>
        <div className="w-[54px]" />
      </div>

      {/* App content */}
      <div className="relative p-5 sm:p-8 min-h-[300px] sm:min-h-[380px]" style={{ background: "var(--sf-bg-void)" }}>
        {/* Simplified app UI */}
        <div
          className="transition-opacity duration-500"
          style={{ opacity: dimUI ? 0.5 : 1 }}
        >
          {/* App nav bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded" style={{ background: "var(--sf-bg-elevated)" }} />
              <div className="h-2.5 w-20 rounded" style={{ background: "var(--sf-bg-elevated)" }} />
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-12 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-2 w-12 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="h-2 w-14 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
          </div>

          {/* Page heading */}
          <div className="mb-6">
            <div className="h-4 w-36 rounded mb-2" style={{ background: "var(--sf-bg-elevated)" }} />
            <div className="h-2.5 w-64 rounded" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* Content grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-[var(--sf-radius-lg)] p-4" style={{ background: "var(--sf-bg-space)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="mb-3 h-2 w-16 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="mb-2 h-6 w-12 rounded font-display" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="mb-4 h-2 w-full rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="h-8 rounded-[var(--sf-radius-md)]" style={{ background: "var(--sf-bg-elevated)" }} />
            </div>

            {/* Card 2 — the target */}
            <div
              className="relative rounded-[var(--sf-radius-lg)] border-2 p-4 transition-all duration-500"
              style={{
                background: "var(--sf-bg-space)",
                borderColor: showGlow ? "var(--sf-accent)" : "rgba(255,255,255,0.06)",
                boxShadow: showGlow
                  ? "0 0 20px rgba(245,158,11,0.35), 0 0 6px rgba(245,158,11,0.15)"
                  : "none",
                opacity: dimUI ? 1 : undefined,
              }}
            >
              <div className="h-2 w-14 rounded mb-3" style={{ background: "rgba(245,158,11,0.4)" }} />
              <div className="font-display text-h3 mb-1" style={{ color: "var(--sf-text-primary)" }}>
                $49
              </div>
              <div className="mb-4 h-2 w-20 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div
                className="h-8 rounded-[var(--sf-radius-md)] flex items-center justify-center"
                style={{
                  background: "rgba(245,158,11,0.2)",
                  border: "1px solid rgba(245,158,11,0.3)",
                }}
              >
                <span className="text-caption font-medium" style={{ color: "var(--sf-accent)" }}>
                  Get Started
                </span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-[var(--sf-radius-lg)] p-4" style={{ background: "var(--sf-bg-space)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="mb-3 h-2 w-18 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="mb-2 h-6 w-14 rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="mb-4 h-2 w-full rounded" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="h-8 rounded-[var(--sf-radius-md)]" style={{ background: "var(--sf-bg-elevated)" }} />
            </div>
          </div>
        </div>

        {/* Animated cursor */}
        <div
          className="absolute transition-all pointer-events-none"
          style={{
            top: showCursor ? "68%" : "30%",
            left: showCursor ? "50%" : "10%",
            opacity: showCursor && !fading ? 1 : 0,
            transitionDuration: beat === "cursor" ? "2.2s" : "0.3s",
            transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          aria-hidden="true"
        >
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="drop-shadow-lg">
            <path
              d="M1 1L1 18.5L5.5 14.5L9.5 22L13 20L9 12.5L15 12L1 1Z"
              fill="var(--sf-accent)"
              stroke="var(--sf-bg-void)"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Comment bubble */}
        <div
          className="absolute top-4 sm:top-8 transition-all duration-500"
          style={{
            right: "5%",
            opacity: showComment && !fading ? 1 : 0,
            transform: showComment ? "translateX(0) scale(1)" : "translateX(20px) scale(0.95)",
          }}
        >
          <div className="sf-glass-strong max-w-[220px] rounded-[var(--sf-radius-lg)] px-4 py-3" style={{ boxShadow: "0 18px 36px rgba(0,0,0,0.28)" }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.3)" }}>
                <span className="text-caption font-bold" style={{ color: "var(--sf-accent)" }}>J</span>
              </div>
              <span className="text-caption" style={{ color: "var(--sf-text-muted)" }}>Just now</span>
            </div>
            <p className="text-sm leading-snug" style={{ color: "var(--sf-text-primary)" }}>
              {COMMENT_TEXT.slice(0, typedChars)}
              {typedChars < COMMENT_TEXT.length && showComment && (
                <span className="inline-block w-0.5 h-3.5 ml-0.5 animate-[blink_0.8s_step-end_infinite]" style={{ background: "var(--sf-accent)" }} />
              )}
            </p>
          </div>
        </div>

        {/* MCP output strip */}
        <div
          className="sf-glass absolute bottom-5 sm:bottom-8 left-5 sm:left-8 right-5 sm:right-8 rounded-[var(--sf-radius-md)] p-4 font-mono text-caption transition-all duration-500"
          style={{
            opacity: showOutput && !fading ? 1 : 0,
            transform: showOutput ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "var(--sf-accent)" }} />
            <span className="font-medium" style={{ color: "var(--sf-accent)" }}>MCP Output</span>
          </div>
          <div className="space-y-0.5 overflow-hidden" style={{ color: "var(--sf-text-secondary)" }}>
            {MCP_LINES.map((line, i) => (
              <div
                key={line.key}
                className="transition-opacity duration-300"
                style={{
                  opacity: showOutput && !fading ? 1 : 0,
                  transitionDelay: showOutput ? `${i * 150}ms` : "0ms",
                }}
              >
                <span style={{ color: "var(--sf-accent)" }}>{line.key}</span>
                <span style={{ color: "var(--sf-text-muted)" }}>: </span>
                <span style={{ color: "var(--sf-text-primary)" }}>{line.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
