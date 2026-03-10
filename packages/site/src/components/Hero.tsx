import { useEffect, useRef, useState } from "react";
import { HeroMicroDemo } from "./HeroMicroDemo";
import { useExperiment } from "../ab/useExperiment";
import { experiments } from "../ab";

export function Hero() {
  const { variant: headlineVariant } = useExperiment(experiments.heroHeadline);
  const { variant: ctaVariant, convert: ctaConvert } = useExperiment(experiments.ctaLabel);

  const headline =
    headlineVariant === "short-copy" ? (
      <>Click. Comment. <span className="text-accent">Ship the fix.</span></>
    ) : (
      <>Visual feedback your <span className="text-accent">agents</span> understand</>
    );

  const ctaText = ctaVariant === "get-started" ? "Get Started" : "Try Peril Free";

  return (
    <>
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-[120px] pb-24">
        <div
          className="pointer-events-none absolute top-[15%] left-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(251, 191, 36, 0.05) 0%, rgba(251, 191, 36, 0.02) 40%, transparent 70%)"
          }}
        />

        <div className="relative mx-auto max-w-[var(--container-narrow)] text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-[var(--radius-full)] border border-border bg-surface px-4 py-1.5 text-caption text-text-secondary">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-[glow-pulse_2s_ease-in-out_infinite]"
              aria-hidden="true"
            />
            Now in public beta
          </p>

          <h1 className="font-display text-hero leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-text-primary">
            {headline}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-body-lg leading-[var(--leading-relaxed)] text-text-secondary">
            Click any element, leave a comment, and your coding agent gets structured locators,
            screenshots, and context via MCP.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#get-started"
              className="inline-flex items-center rounded-[var(--radius-md)] bg-accent px-7 py-3.5 text-base font-medium text-accent-fg shadow-glow-sm transition-all duration-[var(--duration-fast)] hover:bg-accent-hover hover:shadow-glow-md"
              onClick={ctaConvert}
            >
              {ctaText}
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center rounded-[var(--radius-md)] border border-border px-7 py-3.5 text-base font-medium text-text-secondary transition-all duration-[var(--duration-fast)] hover:border-text-secondary hover:bg-surface hover:text-text-primary"
            >
              See How It Works
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-16 w-full max-w-[var(--container-max)] px-6">
          <HeroMicroDemo />
        </div>
      </section>

      <MobileStickyCta />
    </>
  );
}

function MobileStickyCta() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry) {
          setVisible(!entry.isIntersecting);
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="h-0 w-0"
        aria-hidden="true"
      />

      <div
        className={`fixed right-0 bottom-0 left-0 z-40 border-t border-border-subtle bg-bg/90 p-4 backdrop-blur-md transition-transform duration-[var(--duration-normal)] sm:hidden ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!visible}
      >
        <a
          href="#get-started"
          className="flex w-full items-center justify-center rounded-[var(--radius-md)] bg-accent px-6 py-3 text-base font-medium text-accent-fg shadow-glow-sm"
          tabIndex={visible ? 0 : -1}
        >
          Try Peril Free
        </a>
      </div>
    </>
  );
}
