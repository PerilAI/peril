import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  ReviewProvider,
  getBestLocatorSummary,
  getRankedLocators,
  locatorPriority,
  useReviewMode
} from "../src/index";

function ReviewModeProbe() {
  const reviewMode = useReviewMode();
  return createElement(
    "span",
    null,
    `${reviewMode.enabled ? "enabled" : "disabled"}:${reviewMode.serverUrl ?? "no-server"}`
  );
}

function UseReviewModeWithoutProvider() {
  try {
    useReviewMode();
    return createElement("span", null, "no-error");
  } catch {
    return createElement("span", null, "threw-error");
  }
}

describe("@peril-ai/react", () => {
  it("re-exports the shared locator order from core", () => {
    expect(locatorPriority).toEqual(["testId", "role", "css", "xpath", "text"]);
  });

  it("re-exports getRankedLocators from core", () => {
    expect(typeof getRankedLocators).toBe("function");
    const ranked = getRankedLocators({
      css: ".test",
      xpath: "//div"
    });
    expect(ranked).toHaveLength(2);
  });

  it("re-exports getBestLocatorSummary from core", () => {
    expect(typeof getBestLocatorSummary).toBe("function");
    expect(
      getBestLocatorSummary({
        testId: "my-id",
        css: ".test",
        xpath: "//div"
      })
    ).toBe("my-id");
  });

  it("provides review mode state and serverUrl through the provider", () => {
    const rendered = renderToString(
      createElement(
        ReviewProvider,
        {
          initialEnabled: true,
          serverUrl: "http://localhost:4173"
        },
        createElement(ReviewModeProbe)
      )
    );

    expect(rendered).toContain("enabled:http://localhost:4173");
  });

  it("defaults to disabled when initialEnabled is not set", () => {
    const rendered = renderToString(
      createElement(
        ReviewProvider,
        {
          serverUrl: "http://localhost:4173"
        },
        createElement(ReviewModeProbe)
      )
    );

    expect(rendered).toContain("disabled:http://localhost:4173");
  });

  it("throws when useReviewMode is used outside ReviewProvider", () => {
    const rendered = renderToString(createElement(UseReviewModeWithoutProvider));

    expect(rendered).toContain("threw-error");
  });

  it("renders children correctly through the provider", () => {
    const rendered = renderToString(
      createElement(
        ReviewProvider,
        { initialEnabled: false },
        createElement("div", { id: "child" }, "Hello Peril")
      )
    );

    expect(rendered).toContain("Hello Peril");
    expect(rendered).toContain("child");
  });
});
