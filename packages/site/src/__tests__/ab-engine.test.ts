// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  pickVariant,
  getVariant,
  trackABEvent,
  onABEvent,
  resetAssignments,
  type Experiment,
  type ABEvent,
} from "../ab/engine";

const twoVariants: Experiment = {
  id: "test-exp",
  variants: [{ id: "a" }, { id: "b" }],
};

const weightedVariants: Experiment = {
  id: "weighted-exp",
  variants: [
    { id: "heavy", weight: 9 },
    { id: "light", weight: 1 },
  ],
};

beforeEach(() => {
  resetAssignments();
  localStorage.clear();
});

describe("pickVariant", () => {
  it("picks the first variant when rand is 0", () => {
    expect(pickVariant(twoVariants.variants, 0)).toBe("a");
  });

  it("picks the last variant when rand is just below 1", () => {
    expect(pickVariant(twoVariants.variants, 0.999)).toBe("b");
  });

  it("picks according to the 50/50 boundary", () => {
    expect(pickVariant(twoVariants.variants, 0.49)).toBe("a");
    expect(pickVariant(twoVariants.variants, 0.51)).toBe("b");
  });

  it("respects custom weights", () => {
    // weight 9:1 — boundary at 0.9
    expect(pickVariant(weightedVariants.variants, 0.85)).toBe("heavy");
    expect(pickVariant(weightedVariants.variants, 0.95)).toBe("light");
  });

  it("handles single variant", () => {
    expect(pickVariant([{ id: "only" }], 0.5)).toBe("only");
  });
});

describe("getVariant", () => {
  it("assigns and persists a variant", () => {
    const v1 = getVariant(twoVariants);
    const v2 = getVariant(twoVariants);
    expect(v1).toBe(v2);
    expect(["a", "b"]).toContain(v1);
  });

  it("persists across calls via localStorage", () => {
    const v = getVariant(twoVariants);
    // Read raw storage
    const raw = JSON.parse(localStorage.getItem("peril_ab")!);
    expect(raw["test-exp"]).toBe(v);
  });

  it("reassigns if the stored variant no longer exists", () => {
    // Assign to variant "a" or "b"
    getVariant(twoVariants);
    // Change experiment to have only variant "c"
    const modified: Experiment = {
      id: "test-exp",
      variants: [{ id: "c" }],
    };
    const v = getVariant(modified);
    expect(v).toBe("c");
  });
});

describe("trackABEvent / onABEvent", () => {
  it("notifies listeners on exposure", () => {
    const events: ABEvent[] = [];
    const unsub = onABEvent((e) => events.push(e));

    trackABEvent("exp-1", "a", "exposure");

    expect(events).toHaveLength(1);
    expect(events[0]!.experimentId).toBe("exp-1");
    expect(events[0]!.variantId).toBe("a");
    expect(events[0]!.event).toBe("exposure");
    expect(events[0]!.timestamp).toBeGreaterThan(0);

    unsub();
  });

  it("notifies listeners on conversion", () => {
    const events: ABEvent[] = [];
    const unsub = onABEvent((e) => events.push(e));

    trackABEvent("exp-1", "a", "conversion");

    expect(events).toHaveLength(1);
    expect(events[0]!.event).toBe("conversion");

    unsub();
  });

  it("stops notifying after unsubscribe", () => {
    const events: ABEvent[] = [];
    const unsub = onABEvent((e) => events.push(e));
    unsub();

    trackABEvent("exp-1", "a", "exposure");
    expect(events).toHaveLength(0);
  });

  it("supports multiple listeners", () => {
    const e1: ABEvent[] = [];
    const e2: ABEvent[] = [];
    const u1 = onABEvent((e) => e1.push(e));
    const u2 = onABEvent((e) => e2.push(e));

    trackABEvent("exp-1", "a", "exposure");

    expect(e1).toHaveLength(1);
    expect(e2).toHaveLength(1);

    u1();
    u2();
  });
});

describe("resetAssignments", () => {
  it("clears all stored assignments", () => {
    getVariant(twoVariants);
    expect(localStorage.getItem("peril_ab")).not.toBeNull();

    resetAssignments();
    expect(localStorage.getItem("peril_ab")).toBeNull();
  });
});
