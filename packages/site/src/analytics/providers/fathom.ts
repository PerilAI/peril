/**
 * Fathom Analytics provider.
 *
 * Usage:
 *   1. Add the Fathom script to index.html.
 *   2. Call `setProvider(fathomProvider)` in main.tsx.
 *
 * Fathom is privacy-first, GDPR/CCPA compliant, no cookies.
 */

import type { AnalyticsEvent, AnalyticsProvider } from "../tracker";

declare global {
  interface Window {
    fathom?: {
      trackEvent: (name: string, options?: { _value?: number }) => void;
      trackPageview: () => void;
    };
  }
}

export const fathomProvider: AnalyticsProvider = (event: AnalyticsEvent) => {
  if (!window.fathom) return;

  if (event.name === "pageview") {
    window.fathom.trackPageview();
  } else {
    const value =
      typeof event.props?.value === "number" ? event.props.value : undefined;
    window.fathom.trackEvent(event.name, value != null ? { _value: value } : undefined);
  }
};
