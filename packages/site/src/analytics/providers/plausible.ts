/**
 * Plausible Analytics provider.
 *
 * Usage:
 *   1. Add the Plausible script to index.html (or load it dynamically).
 *   2. Call `setProvider(plausibleProvider)` in main.tsx.
 *
 * Plausible is privacy-first: no cookies, GDPR-compliant, lightweight (~1KB).
 * Works even with most ad blockers when self-hosted or using a custom domain.
 */

import type { AnalyticsEvent, AnalyticsProvider } from "../tracker";

declare global {
  interface Window {
    plausible?: (
      eventName: string,
      options?: { props?: Record<string, string | number | boolean> },
    ) => void;
  }
}

export const plausibleProvider: AnalyticsProvider = (event: AnalyticsEvent) => {
  if (typeof window.plausible === "function") {
    window.plausible(event.name, event.props ? { props: event.props } : undefined);
  }
};
