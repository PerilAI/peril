export {
  track,
  trackPageView,
  trackCTAClick,
  trackDemoInteraction,
  trackScrollDepth,
  trackWebVital,
  setProvider,
} from "./tracker";
export type { AnalyticsEvent, AnalyticsProvider } from "./tracker";
export { observeScrollDepth, observeWebVitals } from "./observers";
export { bridgeABToAnalytics } from "./ab-bridge";
export { plausibleProvider } from "./providers/plausible";
export { fathomProvider } from "./providers/fathom";
