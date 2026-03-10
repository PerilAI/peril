/**
 * Passive analytics observers for scroll depth and Core Web Vitals.
 * No external dependencies — uses browser PerformanceObserver APIs.
 */

import { trackScrollDepth, trackWebVital } from "./tracker";

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%).
 * Fires each milestone at most once per page load.
 */
export function observeScrollDepth() {
  const milestones = [25, 50, 75, 100];
  const reached = new Set<number>();

  const handler = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;
    const percent = Math.round((window.scrollY / scrollHeight) * 100);

    for (const m of milestones) {
      if (percent >= m && !reached.has(m)) {
        reached.add(m);
        trackScrollDepth(m);
      }
    }
  };

  window.addEventListener("scroll", handler, { passive: true });
  return () => window.removeEventListener("scroll", handler);
}

type WebVitalRating = "good" | "needs-improvement" | "poor";

function rateMetric(
  name: string,
  value: number,
): WebVitalRating {
  // Thresholds per https://web.dev/articles/vitals
  const thresholds: Record<string, [number, number]> = {
    LCP: [2500, 4000],
    FID: [100, 300],
    CLS: [0.1, 0.25],
    INP: [200, 500],
    FCP: [1800, 3000],
    TTFB: [800, 1800],
  };
  const [good, poor] = thresholds[name] ?? [Infinity, Infinity];
  if (value <= good) return "good";
  if (value <= poor) return "needs-improvement";
  return "poor";
}

/**
 * Observe Core Web Vitals using PerformanceObserver.
 * Reports: LCP, FID, CLS, INP, FCP, TTFB.
 */
export function observeWebVitals() {
  if (typeof PerformanceObserver === "undefined") return;

  const cleanups: (() => void)[] = [];

  // LCP
  try {
    const lcp = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1] as PerformanceEntry | undefined;
      if (last) {
        trackWebVital("LCP", last.startTime, rateMetric("LCP", last.startTime));
      }
    });
    lcp.observe({ type: "largest-contentful-paint", buffered: true });
    cleanups.push(() => lcp.disconnect());
  } catch { /* unsupported */ }

  // FID
  try {
    const fid = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        const value = fidEntry.processingStart - fidEntry.startTime;
        trackWebVital("FID", value, rateMetric("FID", value));
      }
    });
    fid.observe({ type: "first-input", buffered: true });
    cleanups.push(() => fid.disconnect());
  } catch { /* unsupported */ }

  // CLS
  try {
    let clsValue = 0;
    const cls = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      trackWebVital("CLS", clsValue, rateMetric("CLS", clsValue));
    });
    cls.observe({ type: "layout-shift", buffered: true });
    cleanups.push(() => cls.disconnect());
  } catch { /* unsupported */ }

  // INP (Interaction to Next Paint)
  try {
    const inp = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const eventEntry = entry as PerformanceEventTiming;
        const value = eventEntry.duration;
        trackWebVital("INP", value, rateMetric("INP", value));
      }
    });
    inp.observe({ type: "event", buffered: true });
    cleanups.push(() => inp.disconnect());
  } catch { /* unsupported */ }

  // FCP
  try {
    const fcp = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          trackWebVital("FCP", entry.startTime, rateMetric("FCP", entry.startTime));
        }
      }
    });
    fcp.observe({ type: "paint", buffered: true });
    cleanups.push(() => fcp.disconnect());
  } catch { /* unsupported */ }

  // TTFB
  try {
    const nav = performance.getEntriesByType("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    if (nav) {
      trackWebVital("TTFB", nav.responseStart, rateMetric("TTFB", nav.responseStart));
    }
  } catch { /* unsupported */ }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}
