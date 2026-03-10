/**
 * Bridge between the A/B testing event bus and the analytics tracker.
 * Call `bridgeABToAnalytics()` once at app init.
 */

import { onABEvent } from "../ab";
import { track } from "./tracker";

export function bridgeABToAnalytics(): () => void {
  return onABEvent((event) => {
    track(`ab_${event.event}`, {
      experimentId: event.experimentId,
      variantId: event.variantId,
    });
  });
}
