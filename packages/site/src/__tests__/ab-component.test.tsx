// @vitest-environment happy-dom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, expect, beforeEach } from "vitest";
import { Experiment } from "../ab/Experiment";
import { resetAssignments } from "../ab/engine";

beforeEach(() => {
  resetAssignments();
  localStorage.clear();
});

describe("Experiment component", () => {
  it("renders one of the variants", () => {
    const markup = renderToStaticMarkup(
      <Experiment
        experiment={{
          id: "test-render",
          variants: [{ id: "a" }, { id: "b" }],
        }}
      >
        {{ a: <span>Variant A</span>, b: <span>Variant B</span> }}
      </Experiment>,
    );

    const hasA = markup.includes("Variant A");
    const hasB = markup.includes("Variant B");
    // Exactly one variant should render
    expect(hasA || hasB).toBe(true);
    expect(hasA && hasB).toBe(false);
  });

  it("renders fallback when variant key is missing", () => {
    // Force a known variant by pre-seeding localStorage
    localStorage.setItem(
      "peril_ab",
      JSON.stringify({ "test-fallback": "c" }),
    );

    const markup = renderToStaticMarkup(
      <Experiment
        experiment={{
          id: "test-fallback",
          variants: [{ id: "c" }],
        }}
        fallback={<span>Fallback</span>}
      >
        {{}}
      </Experiment>,
    );

    expect(markup).toContain("Fallback");
  });

  it("is consistent across re-renders (same variant)", () => {
    const experiment = {
      id: "stable-test",
      variants: [{ id: "x" }, { id: "y" }],
    };

    const m1 = renderToStaticMarkup(
      <Experiment experiment={experiment}>
        {{ x: <span>X</span>, y: <span>Y</span> }}
      </Experiment>,
    );

    const m2 = renderToStaticMarkup(
      <Experiment experiment={experiment}>
        {{ x: <span>X</span>, y: <span>Y</span> }}
      </Experiment>,
    );

    expect(m1).toBe(m2);
  });
});
