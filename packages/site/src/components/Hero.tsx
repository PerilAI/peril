import { useEffect, useRef, useState } from "react";
import { HeroMicroDemo } from "./HeroMicroDemo";
import { useExperiment } from "../ab/useExperiment";
import { experiments } from "../ab";
import { trackCTAClick } from "../analytics";
import { defaultHeroMessage, getHeroMessageFromReferrer, type HeroMessage } from "./heroMessages";

const TRUST_PILLS = ["Cursor", "Claude Code", "VS Code", "Windsurf", "MCP"] as const;

export function Hero() {
  const [heroMessage, setHeroMessage] = useState<HeroMessage>(defaultHeroMessage);
  const { variant: headlineVariant } = useExperiment(experiments.heroHeadline);
  const { variant: ctaVariant, convert: ctaConvert } = useExperiment(experiments.ctaLabel);

  useEffect(() => {
    setHeroMessage(getHeroMessageFromReferrer(document.referrer));
  }, []);

  const isReferralPersonalized = heroMessage !== defaultHeroMessage;

  const headline = isReferralPersonalized ? (
    <AccentHeadline headline={heroMessage.headline} accent={heroMessage.accent} />
  ) : headlineVariant === "short-copy" ? (
    <>Click. Comment.{" "}<span style={{
      background: "var(--sf-gradient-arc)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}>Ship the fix.</span></>
  ) : (
    <AccentHeadline headline={heroMessage.headline} accent={heroMessage.accent} />
  );

  const ctaText = ctaVariant === "get-started" ? "Get Started" : "Try Peril Free";

  return (
    <>
      <section className="sf-aurora relative overflow-hidden" style={{ paddingTop: "160px", paddingBottom: "128px" }}>
        <div className="relative mx-auto max-w-[var(--sf-container-max)] px-[var(--sf-container-gutter)]">
          <div className="max-w-[800px]">
            <div className="sf-badge-beta">
              Now in public beta
            </div>

            <h1
              className="mt-6 font-display font-[800]"
              style={{
                fontSize: "var(--sf-text-hero)",
                lineHeight: "var(--sf-leading-hero)",
                letterSpacing: "var(--sf-tracking-hero)",
                color: "var(--sf-text-primary)",
              }}
            >
              {headline}
            </h1>

            <p
              className="mt-4 max-w-[48ch]"
              style={{
                fontSize: "var(--sf-text-body-lg)",
                lineHeight: "var(--sf-leading-body)",
                color: "var(--sf-text-secondary)",
              }}
            >
              {heroMessage.description}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#get-started"
                className="sf-btn-primary"
                onClick={() => { ctaConvert(); trackCTAClick(ctaText, "primary"); }}
              >
                {ctaText}
              </a>
              <a
                href="#how-it-works"
                className="sf-btn-secondary"
                onClick={() => trackCTAClick("See How It Works", "secondary")}
              >
                See How It Works
              </a>
            </div>

            {/* Trust signal pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {TRUST_PILLS.map((name) => (
                <span key={name} className="sf-pill">{name}</span>
              ))}
            </div>
          </div>

          {/* Mobile: center layout */}
          <style>{`
            @media (max-width: 640px) {
              .sf-aurora h1, .sf-aurora .sf-badge-beta, .sf-aurora p {
                text-align: center;
              }
              .sf-aurora .sf-badge-beta {
                margin-left: auto;
                margin-right: auto;
              }
              .sf-aurora .max-w-\\[800px\\] {
                max-width: 100%;
              }
              .sf-aurora .max-w-\\[48ch\\] {
                margin-left: auto;
                margin-right: auto;
              }
            }
          `}</style>
        </div>

        <div className="relative mx-auto mt-16 w-full max-w-[var(--sf-container-max)] px-[var(--sf-container-gutter)]">
          <HeroMicroDemo />
        </div>
      </section>

      <MobileStickyCta ctaText={ctaText} onCtaClick={() => { ctaConvert(); trackCTAClick(ctaText, "mobile-sticky"); }} />
    </>
  );
}

interface AccentHeadlineProps {
  accent: string;
  headline: string;
}

function AccentHeadline({ accent, headline }: AccentHeadlineProps) {
  const accentStart = headline.indexOf(accent);

  if (accentStart === -1) {
    return headline;
  }

  const accentEnd = accentStart + accent.length;
  const beforeAccent = headline.slice(0, accentStart);
  const afterAccent = headline.slice(accentEnd);

  return (
    <>
      {beforeAccent}
      <span style={{
        background: "var(--sf-gradient-arc)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }}>{accent}</span>
      {afterAccent}
    </>
  );
}

function MobileStickyCta({ ctaText, onCtaClick }: { ctaText: string; onCtaClick: () => void }) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-0 w-0" aria-hidden="true" />
      <div
        className={`sf-glass-strong fixed right-0 bottom-0 left-0 z-40 p-4 transition-transform duration-[var(--sf-duration-normal)] sm:hidden ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        aria-hidden={!visible}
      >
        <a
          href="#get-started"
          className="sf-btn-primary w-full text-base"
          style={{ display: "flex", justifyContent: "center" }}
          tabIndex={visible ? 0 : -1}
          onClick={onCtaClick}
        >
          {ctaText}
        </a>
      </div>
    </>
  );
}
