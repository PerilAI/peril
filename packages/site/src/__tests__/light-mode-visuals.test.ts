import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const heroMicroDemoSource = readFileSync(
  resolve(__dirname, "../components/HeroMicroDemo.tsx"),
  "utf8",
);
const annotationPlaygroundSource = readFileSync(
  resolve(__dirname, "../components/AnnotationPlayground.tsx"),
  "utf8",
);
const howItWorksSource = readFileSync(
  resolve(__dirname, "../components/HowItWorks.tsx"),
  "utf8",
);
const useCasesSource = readFileSync(
  resolve(__dirname, "../components/UseCases.tsx"),
  "utf8",
);

describe("light mode marketing visuals", () => {
  it("uses higher-contrast surfaces in HeroMicroDemo", () => {
    expect(heroMicroDemoSource).toContain("bg-border");
    expect(heroMicroDemoSource).toContain("text-text-primary");
    expect(heroMicroDemoSource).not.toContain("text-[var(--color-amber-200)]");
  });

  it("keeps AnnotationPlayground panels on semantic surface tokens", () => {
    expect(annotationPlaygroundSource).toContain("bg-surface p-5");
    expect(annotationPlaygroundSource).toContain("bg-surface-elevated/50");
    expect(annotationPlaygroundSource).not.toContain("bg-white/[0.02]");
    expect(annotationPlaygroundSource).not.toContain(
      "bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]",
    );
  });

  it("avoids Tailwind's fixed accent utilities inside themed step and use-case visuals", () => {
    for (const source of [howItWorksSource, useCasesSource]) {
      expect(source).not.toContain("text-green");
      expect(source).not.toContain("bg-green");
      expect(source).not.toContain("text-purple");
      expect(source).not.toContain("bg-purple");
    }

    expect(useCasesSource).toContain("var(--color-accent-foreground)");
  });
});
