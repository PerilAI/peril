/**
 * Privacy-respecting analytics tracker.
 *
 * Provides a thin abstraction over analytics providers (Plausible, Fathom, etc.).
 * No cookies, no personal data — just aggregate event counts.
 * Falls back to console logging in development when no provider is configured.
 */

export interface AnalyticsEvent {
  name: string;
  props?: Record<string, string | number | boolean>;
}

export type AnalyticsProvider = (event: AnalyticsEvent) => void;

let provider: AnalyticsProvider | null = null;

/** Register the analytics provider (call once at app init). */
export function setProvider(p: AnalyticsProvider) {
  provider = p;
}

/** Track a named event with optional properties. */
export function track(name: string, props?: AnalyticsEvent["props"]) {
  const event: AnalyticsEvent = props ? { name, props } : { name };

  if (provider) {
    provider(event);
    return;
  }

  // Dev fallback
  if (import.meta.env.DEV) {
    console.debug("[analytics]", name, props ?? "");
  }
}

// ── Convenience helpers ──

export function trackPageView(path?: string) {
  track("pageview", {
    path: path ?? window.location.pathname,
    referrer: document.referrer || "(direct)",
  });
}

export function trackCTAClick(label: string, variant: "primary" | "secondary") {
  track("cta_click", { label, variant });
}

export function trackDemoInteraction(
  action: "started" | "completed" | "abandoned",
) {
  track("demo_interaction", { action });
}

export function trackScrollDepth(percent: number) {
  track("scroll_depth", { percent });
}

export function trackWebVital(
  name: string,
  value: number,
  rating: "good" | "needs-improvement" | "poor",
) {
  track("web_vital", { name, value, rating });
}
