import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { ReviewProvider, useReviewMode } from "../src/index";

/**
 * SSR safety tests for @peril-ai/react (PER-65).
 *
 * Validates that ReviewProvider, useReviewMode, and the portal overlay
 * behave correctly in a server-side rendering environment where
 * document/window may be undefined.
 */

// Helper: renders a component that probes useReviewMode context
function ReviewModeProbe() {
  const ctx = useReviewMode();
  return createElement(
    "span",
    { "data-testid": "probe" },
    `enabled=${ctx.enabled},server=${ctx.serverUrl ?? "none"}`
  );
}

describe("SSR safety", () => {
  describe("module-level imports", () => {
    it("does not reference document or window at import time", async () => {
      // Dynamically import the module source text and verify no top-level
      // document/window access outside of function bodies.
      // We do this by checking that the module can be imported in a clean
      // Node environment (no jsdom) without throwing.
      vi.resetModules();
      const mod = await import("../src/index");
      expect(mod.ReviewProvider).toBeDefined();
      expect(mod.useReviewMode).toBeDefined();
      expect(mod.getBestLocatorSummary).toBeDefined();
      expect(mod.getRankedLocators).toBeDefined();
      expect(mod.locatorPriority).toBeDefined();
    });
  });

  describe("ReviewProvider in SSR", () => {
    it("renders children without error when globalThis has no document/window", () => {
      // Save and remove globals to simulate a pure Node SSR env
      const origDoc = globalThis.document;
      const origWin = globalThis.window;
      try {
        // @ts-expect-error -- simulating SSR by removing globals
        delete globalThis.document;
        // @ts-expect-error -- simulating SSR by removing globals
        delete globalThis.window;

        const html = renderToString(
          createElement(
            ReviewProvider,
            { initialEnabled: true, serverUrl: "http://localhost:3000" },
            createElement("div", { id: "app" }, "Hello SSR")
          )
        );

        expect(html).toContain("Hello SSR");
        expect(html).toContain("app");
      } finally {
        globalThis.document = origDoc;
        globalThis.window = origWin;
      }
    });

    it("does not create a portal during SSR", () => {
      const origDoc = globalThis.document;
      const origWin = globalThis.window;
      try {
        // @ts-expect-error -- simulating SSR
        delete globalThis.document;
        // @ts-expect-error -- simulating SSR
        delete globalThis.window;

        const html = renderToString(
          createElement(
            ReviewProvider,
            { initialEnabled: true },
            createElement("span", null, "content")
          )
        );

        // The portal-mounted ReviewOverlayBridge should NOT appear in SSR output.
        // Only the children should be present.
        expect(html).toContain("content");
        // No overlay-related markup should be in the SSR string.
        // The bridge returns null, so there should be no extra elements.
        expect(html).toBe("<span>content</span>");
      } finally {
        globalThis.document = origDoc;
        globalThis.window = origWin;
      }
    });

    it("provides context values correctly during SSR", () => {
      const origDoc = globalThis.document;
      const origWin = globalThis.window;
      try {
        // @ts-expect-error -- simulating SSR
        delete globalThis.document;
        // @ts-expect-error -- simulating SSR
        delete globalThis.window;

        const html = renderToString(
          createElement(
            ReviewProvider,
            { initialEnabled: true, serverUrl: "https://peril.dev" },
            createElement(ReviewModeProbe)
          )
        );

        expect(html).toContain("enabled=true,server=https://peril.dev");
      } finally {
        globalThis.document = origDoc;
        globalThis.window = origWin;
      }
    });

    it("renders correctly with initialEnabled=false during SSR", () => {
      const origDoc = globalThis.document;
      const origWin = globalThis.window;
      try {
        // @ts-expect-error -- simulating SSR
        delete globalThis.document;
        // @ts-expect-error -- simulating SSR
        delete globalThis.window;

        const html = renderToString(
          createElement(
            ReviewProvider,
            { serverUrl: "http://localhost:4173" },
            createElement(ReviewModeProbe)
          )
        );

        expect(html).toContain("enabled=false,server=http://localhost:4173");
      } finally {
        globalThis.document = origDoc;
        globalThis.window = origWin;
      }
    });
  });

  describe("useReviewMode in SSR", () => {
    it("returns context values during SSR rendering", () => {
      const html = renderToString(
        createElement(
          ReviewProvider,
          { initialEnabled: true, serverUrl: "http://test.local" },
          createElement(ReviewModeProbe)
        )
      );

      expect(html).toContain("enabled=true,server=http://test.local");
    });

    it("throws when used outside provider during SSR", () => {
      function OrphanProbe() {
        try {
          useReviewMode();
          return createElement("span", null, "no-throw");
        } catch {
          return createElement("span", null, "threw");
        }
      }

      const html = renderToString(createElement(OrphanProbe));
      expect(html).toContain("threw");
    });
  });

  describe("portal readiness", () => {
    it("does not mount portal when portalReady is false (no DOM target)", async () => {
      // Verify using the mock approach: when portalReady=false, createPortal
      // should not be called.
      vi.resetModules();

      const createPortalMock = vi.fn();
      const useEffectMock = vi.fn(); // no-op: simulates SSR where effects don't run

      vi.doMock("react", async () => {
        const actual = await vi.importActual<typeof import("react")>("react");
        return {
          ...actual,
          useEffect: useEffectMock,
          useState: vi
            .fn()
            .mockImplementationOnce((init: boolean) => [init, vi.fn()]) // enabled state
            .mockImplementationOnce(() => [false, vi.fn()]) // portalReady = false
        };
      });
      vi.doMock("react-dom", () => ({
        createPortal: createPortalMock
      }));
      vi.doMock("@peril-ai/core", () => ({
        createReviewOverlay: vi.fn(),
        getBestLocatorSummary: vi.fn(),
        getRankedLocators: vi.fn(),
        locatorPriority: ["testId", "role", "css", "xpath", "text"]
      }));

      const { ReviewProvider: MockedProvider } = await import("../src/index");

      MockedProvider({
        children: "child",
        initialEnabled: true,
        serverUrl: "http://test.local"
      });

      // createPortal should NOT have been called since portalReady is false
      expect(createPortalMock).not.toHaveBeenCalled();
    });

    it("mounts portal only after useEffect sets portalReady to true", async () => {
      vi.resetModules();

      const createPortalMock = vi.fn((node, target) => ({ node, target }));
      let portalReadySetter: ((v: boolean) => void) | null = null;
      const useEffectCallbacks: Array<() => void> = [];

      vi.doMock("react", async () => {
        const actual = await vi.importActual<typeof import("react")>("react");
        return {
          ...actual,
          useEffect: vi.fn((cb: () => void) => {
            useEffectCallbacks.push(cb);
          }),
          useState: vi
            .fn()
            .mockImplementationOnce((init: boolean) => [init, vi.fn()]) // enabled
            .mockImplementationOnce(() => {
              // portalReady - starts false, capture setter
              const setter = vi.fn();
              portalReadySetter = setter;
              return [false, setter];
            })
        };
      });
      vi.doMock("react-dom", () => ({
        createPortal: createPortalMock
      }));
      vi.doMock("@peril-ai/core", () => ({
        createReviewOverlay: vi.fn(),
        getBestLocatorSummary: vi.fn(),
        getRankedLocators: vi.fn(),
        locatorPriority: ["testId", "role", "css", "xpath", "text"]
      }));

      const { ReviewProvider: MockedProvider } = await import("../src/index");
      const fakeDoc = { body: { nodeName: "BODY" } } as unknown as Document;

      MockedProvider({
        children: "child",
        document: fakeDoc,
        initialEnabled: true
      });

      // Before effects run: no portal
      expect(createPortalMock).not.toHaveBeenCalled();

      // The first useEffect callback should set portalReady to true
      expect(useEffectCallbacks.length).toBeGreaterThanOrEqual(1);
      useEffectCallbacks[0]!(); // runs the portalReady effect
      expect(portalReadySetter).toHaveBeenCalledWith(true);
    });
  });

  describe("ReviewOverlayBridge SSR safety", () => {
    it("does not call createReviewOverlay when document/window are undefined", async () => {
      vi.resetModules();

      const createReviewOverlayMock = vi.fn();
      const effectCallbacks: Array<() => void | (() => void)> = [];

      vi.doMock("react", async () => {
        const actual = await vi.importActual<typeof import("react")>("react");
        return {
          ...actual,
          useEffect: vi.fn((cb: () => void | (() => void)) => {
            effectCallbacks.push(cb);
          }),
          useRef: vi.fn((init: unknown) => ({ current: init })),
          useState: vi
            .fn()
            .mockImplementationOnce(() => [true, vi.fn()]) // enabled
            .mockImplementationOnce(() => [true, vi.fn()]) // portalReady
        };
      });
      vi.doMock("react-dom", () => ({
        createPortal: vi.fn((node) => node)
      }));
      vi.doMock("@peril-ai/core", () => ({
        createReviewOverlay: createReviewOverlayMock,
        getBestLocatorSummary: vi.fn(),
        getRankedLocators: vi.fn(),
        locatorPriority: ["testId", "role", "css", "xpath", "text"]
      }));

      const { ReviewProvider: MockedProvider } = await import("../src/index");

      // Call without document/window — simulates SSR-like scenario
      MockedProvider({
        children: "child",
        initialEnabled: true
      });

      // Execute the bridge's useEffect callbacks
      for (const cb of effectCallbacks) {
        cb();
      }

      // createReviewOverlay should NOT be called when document/window are falsy
      // The bridge guards: if (!document || !window) return undefined
      expect(createReviewOverlayMock).not.toHaveBeenCalled();
    });
  });
});
