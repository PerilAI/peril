import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AnnotationPlayground } from "../components/AnnotationPlayground";
import {
  buildPlaygroundOutputLines,
  createFallbackAnnotation,
  initialPlaygroundIssueId
} from "../components/annotationPlaygroundData";

describe("AnnotationPlayground", () => {
  it("renders the interactive demo shell with a preloaded annotation", () => {
    const markup = renderToStaticMarkup(<AnnotationPlayground />);

    expect(markup).toContain("Try it yourself");
    expect(markup).toContain("localhost:3000/dashboard");
    expect(markup).toContain("Ship feedback faster");
    expect(markup).toContain("Structured payload");
  });

  it("includes the full locator bundle in the preloaded output", () => {
    const lines = buildPlaygroundOutputLines(
      createFallbackAnnotation(initialPlaygroundIssueId)
    );

    expect(lines.map((line) => line.label)).toEqual(
      expect.arrayContaining([
        "selection.locators.testId",
        "selection.locators.role",
        "selection.locators.css",
        "selection.locators.xpath"
      ])
    );
    expect(lines.find((line) => line.id === "artifact")?.value).toContain(
      "playground://artifacts/cta-wrap/element.png"
    );
  });
});
