// @vitest-environment happy-dom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Hero } from "../components/Hero";
import { defaultHeroMessage, getHeroMessageFromReferrer } from "../components/heroMessages";

afterEach(() => {
  cleanup();
  Reflect.deleteProperty(document, "referrer");
});

describe("getHeroMessageFromReferrer", () => {
  it("falls back to the generic hero copy when no referrer is present", () => {
    expect(getHeroMessageFromReferrer("")).toEqual(defaultHeroMessage);
  });

  it("matches Cursor referrals", () => {
    expect(getHeroMessageFromReferrer("https://cursor.sh/pricing").headline).toBe(
      "Works with Cursor"
    );
  });

  it("matches subdomains for supported referral hosts", () => {
    expect(getHeroMessageFromReferrer("https://www.anthropic.com/product").headline).toBe(
      "Works with Claude Code"
    );
    expect(getHeroMessageFromReferrer("https://github.com/features/copilot").headline).toBe(
      "Works with your favorite editor"
    );
  });

  it("ignores invalid or unrelated referrers", () => {
    expect(getHeroMessageFromReferrer("not-a-url")).toEqual(defaultHeroMessage);
    expect(getHeroMessageFromReferrer("https://example.com")).toEqual(defaultHeroMessage);
  });
});

describe("Hero personalization", () => {
  it("renders the generic headline during server rendering", () => {
    const markup = renderToStaticMarkup(<Hero />);
    const textContent = markup.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    expect(textContent).toContain(defaultHeroMessage.headline);
  });

  it("updates the hero copy after mount when the visitor came from Cursor", async () => {
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://cursor.sh/downloads"
    });

    render(<Hero />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Works with Cursor" })).toBeDefined();
    });
  });
});
