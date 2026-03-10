// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  track,
  trackPageView,
  trackCTAClick,
  trackDemoInteraction,
  trackScrollDepth,
  trackWebVital,
  setProvider,
  type AnalyticsEvent,
} from "../analytics/tracker";

describe("analytics tracker", () => {
  let events: AnalyticsEvent[];

  beforeEach(() => {
    events = [];
    setProvider((e) => events.push(e));
  });

  it("track sends events to the provider", () => {
    track("test_event", { key: "value" });
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("test_event");
    expect(events[0]!.props).toEqual({ key: "value" });
  });

  it("trackPageView sends pageview with path and referrer", () => {
    trackPageView("/test");
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("pageview");
    expect(events[0]!.props!.path).toBe("/test");
    expect(events[0]!.props).toHaveProperty("referrer");
  });

  it("trackCTAClick sends cta_click with label and variant", () => {
    trackCTAClick("Try Free", "primary");
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("cta_click");
    expect(events[0]!.props).toEqual({ label: "Try Free", variant: "primary" });
  });

  it("trackDemoInteraction sends demo_interaction", () => {
    trackDemoInteraction("started");
    trackDemoInteraction("completed");
    trackDemoInteraction("abandoned");
    expect(events).toHaveLength(3);
    expect(events.map((e) => e.props!.action)).toEqual([
      "started",
      "completed",
      "abandoned",
    ]);
  });

  it("trackScrollDepth sends scroll_depth with percent", () => {
    trackScrollDepth(50);
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("scroll_depth");
    expect(events[0]!.props!.percent).toBe(50);
  });

  it("trackWebVital sends web_vital with name, value, and rating", () => {
    trackWebVital("LCP", 1200, "good");
    expect(events).toHaveLength(1);
    expect(events[0]!.name).toBe("web_vital");
    expect(events[0]!.props).toEqual({
      name: "LCP",
      value: 1200,
      rating: "good",
    });
  });
});
