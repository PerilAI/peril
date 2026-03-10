// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from "vitest";
import { bridgeABToAnalytics } from "../analytics/ab-bridge";
import { trackABEvent, resetAssignments } from "../ab/engine";
import { setProvider, type AnalyticsEvent } from "../analytics/tracker";

describe("A/B → analytics bridge", () => {
  let events: AnalyticsEvent[];

  beforeEach(() => {
    events = [];
    resetAssignments();
    setProvider((e) => events.push(e));
  });

  it("forwards ab exposure events to analytics", () => {
    const unsub = bridgeABToAnalytics();
    trackABEvent("hero-headline", "control", "exposure");

    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("ab_exposure");
    expect(events[0]!.props).toEqual({
      experimentId: "hero-headline",
      variantId: "control",
    });

    unsub();
  });

  it("forwards ab conversion events to analytics", () => {
    const unsub = bridgeABToAnalytics();
    trackABEvent("cta-label", "get-started", "conversion");

    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("ab_conversion");
    expect(events[0]!.props).toEqual({
      experimentId: "cta-label",
      variantId: "get-started",
    });

    unsub();
  });

  it("stops forwarding after unsubscribe", () => {
    const unsub = bridgeABToAnalytics();
    unsub();
    trackABEvent("hero-headline", "control", "exposure");
    expect(events).toHaveLength(0);
  });
});
