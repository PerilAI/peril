import { describe, expect, it, vi } from "vitest";

function mockCoreModule(
  overrides: Partial<{
    captureElementScreenshot: ReturnType<typeof vi.fn>;
    capturePageScreenshot: ReturnType<typeof vi.fn>;
    createReviewOverlay: ReturnType<typeof vi.fn>;
    generateLocatorBundle: ReturnType<typeof vi.fn>;
    submitReview: ReturnType<typeof vi.fn>;
  }> = {}
) {
  const coreModule = {
    captureElementScreenshot: vi.fn(),
    capturePageScreenshot: vi.fn(),
    createReviewOverlay: vi.fn(),
    generateLocatorBundle: vi.fn(),
    getBestLocatorSummary: vi.fn(),
    getRankedLocators: vi.fn(),
    locatorPriority: ["testId", "role", "css", "xpath", "text"],
    submitReview: vi.fn(),
    ...overrides
  };

  vi.doMock("@peril/core", () => coreModule);

  return coreModule;
}

describe("@peril/react portal bridge", () => {
  it("creates a portal-mounted bridge when a DOM target is available", async () => {
    vi.resetModules();

    const setEnabled = vi.fn();
    const setPortalReady = vi.fn();
    const useStateMock = vi
      .fn()
      .mockImplementationOnce(() => [true, setEnabled])
      .mockImplementationOnce(() => [true, setPortalReady]);
    const useEffectMock = vi.fn();
    const createPortalMock = vi.fn((node, target) => ({
      node,
      target
    }));

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");

      return {
        ...actual,
        useEffect: useEffectMock,
        useState: useStateMock
      };
    });
    vi.doMock("react-dom", () => ({
      createPortal: createPortalMock
    }));
    mockCoreModule();

    const { ReviewProvider } = await import("../src/index");
    const fakeDocument = {
      body: {
        nodeName: "BODY"
      }
    } as unknown as Document;
    const fakeWindow = {} as Window;
    const onHover = vi.fn();
    const onSelect = vi.fn();
    const keyboardShortcut = {
      altKey: true,
      ctrlKey: false,
      key: "k",
      shiftKey: false
    };

    const element = ReviewProvider({
      children: "child",
      keyboardShortcut,
      document: fakeDocument,
      initialEnabled: true,
      onHover,
      onSelect,
      serverUrl: "http://localhost:4173",
      window: fakeWindow,
      zIndex: 90
    });

    expect(useEffectMock).toHaveBeenCalledTimes(1);
    expect(createPortalMock).toHaveBeenCalledTimes(1);
    expect(createPortalMock.mock.calls[0]?.[1]).toBe(fakeDocument.body);

    const bridgeElement = createPortalMock.mock.calls[0]?.[0] as {
      props: Record<string, unknown>;
    };

    expect(bridgeElement.props).toMatchObject({
      document: fakeDocument,
      enabled: true,
      keyboardShortcut,
      onHover,
      onSelect,
      window: fakeWindow,
      zIndex: 90
    });
    expect(element.props.value).toMatchObject({
      enabled: true,
      serverUrl: "http://localhost:4173"
    });
  });

  it("wires overlay lifecycle and enabled state through the bridge component", async () => {
    vi.resetModules();

    const controller = {
      clearSelection: vi.fn(),
      destroy: vi.fn(),
      isEnabled: vi.fn(() => true),
      setEnabled: vi.fn()
    };
    const createReviewOverlayMock = vi.fn(() => controller);
    const cleanups: Array<() => void> = [];
    const controllerRef = {
      current: null as typeof controller | null
    };
    let refCallCount = 0;
    const useRefMock = vi.fn((value: unknown) => {
      refCallCount += 1;

      if (refCallCount === 1) {
        return controllerRef;
      }

      return {
        current: value
      };
    });
    const useEffectMock = vi.fn((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        cleanups.push(cleanup);
      }
    });
    const setReviewModeEnabled = vi.fn();
    const useStateMock = vi
      .fn()
      .mockImplementationOnce(() => [true, setReviewModeEnabled])
      .mockImplementationOnce(() => [true, vi.fn()]);
    const createPortalMock = vi.fn((node) => node);

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");

      return {
        ...actual,
        useEffect: useEffectMock,
        useRef: useRefMock,
        useState: useStateMock
      };
    });
    vi.doMock("react-dom", () => ({
      createPortal: createPortalMock
    }));
    mockCoreModule({
      createReviewOverlay: createReviewOverlayMock
    });

    const { ReviewProvider } = await import("../src/index");
    const fakeDocument = {
      body: {
        nodeName: "BODY"
      }
    } as unknown as Document;
    const fakeWindow = {} as Window;
    const onHover = vi.fn();
    const onSelect = vi.fn();
    const keyboardShortcut = {
      ctrlKey: true,
      key: "r",
      shiftKey: true
    };

    ReviewProvider({
      children: "child",
      document: fakeDocument,
      initialEnabled: true,
      keyboardShortcut,
      onHover,
      onSelect,
      window: fakeWindow,
      zIndex: 120
    });

    const bridgeElement = createPortalMock.mock.calls[0]?.[0] as {
      props: Record<string, unknown>;
      type: (props: Record<string, unknown>) => null;
    };

    expect(bridgeElement.type(bridgeElement.props)).toBeNull();
    expect(createReviewOverlayMock).toHaveBeenCalledWith(expect.objectContaining({
      document: fakeDocument,
      keyboardShortcut,
      onHover: expect.any(Function),
      onSelect: expect.any(Function),
      onToggleRequest: expect.any(Function),
      window: fakeWindow,
      zIndex: 120
    }));
    expect(controller.setEnabled).toHaveBeenCalledWith(true);

    const onToggleRequest = createReviewOverlayMock.mock.calls[0]?.[0]?.onToggleRequest as
      | ((enabled: boolean) => void)
      | undefined;
    onToggleRequest?.(false);

    expect(setReviewModeEnabled).toHaveBeenCalledWith(false);

    for (const cleanup of cleanups) {
      cleanup();
    }

    expect(controller.destroy).toHaveBeenCalledTimes(1);
  });

  it("submits a full review payload when the composer submit callback fires", async () => {
    vi.resetModules();

    const controller = {
      clearSelection: vi.fn(),
      destroy: vi.fn(),
      isEnabled: vi.fn(() => true),
      setEnabled: vi.fn()
    };
    const createReviewOverlayMock = vi.fn(() => controller);
    const captureElementScreenshotMock = vi
      .fn()
      .mockResolvedValue("data:image/png;base64,ZWxlbWVudA==");
    const capturePageScreenshotMock = vi.fn().mockResolvedValue("data:image/png;base64,cGFnZQ==");
    const generateLocatorBundleMock = vi.fn(() => ({
      testId: "hero-cta",
      role: {
        name: "Start free trial",
        type: "button"
      },
      css: "[data-testid='hero-cta']",
      xpath: "//*[@data-testid='hero-cta']",
      text: "Start free trial"
    }));
    const submitReviewMock = vi.fn(async (input) => ({
      ...input,
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FB0",
      resolution: null,
      status: "open",
      timestamp: "2026-03-10T17:00:00.000Z"
    }));
    const controllerRef = {
      current: null as typeof controller | null
    };
    let refCallCount = 0;
    const useRefMock = vi.fn((value: unknown) => {
      refCallCount += 1;

      if (refCallCount === 1) {
        return controllerRef;
      }

      return {
        current: value
      };
    });
    const cleanups: Array<() => void> = [];
    const useEffectMock = vi.fn((effect: () => void | (() => void)) => {
      const cleanup = effect();

      if (typeof cleanup === "function") {
        cleanups.push(cleanup);
      }
    });
    const useStateMock = vi
      .fn()
      .mockImplementationOnce(() => [true, vi.fn()])
      .mockImplementationOnce(() => [true, vi.fn()]);
    const createPortalMock = vi.fn((node) => node);

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");

      return {
        ...actual,
        useEffect: useEffectMock,
        useRef: useRefMock,
        useState: useStateMock
      };
    });
    vi.doMock("react-dom", () => ({
      createPortal: createPortalMock
    }));
    mockCoreModule({
      captureElementScreenshot: captureElementScreenshotMock,
      capturePageScreenshot: capturePageScreenshotMock,
      createReviewOverlay: createReviewOverlayMock,
      generateLocatorBundle: generateLocatorBundleMock,
      submitReview: submitReviewMock
    });

    const { ReviewProvider } = await import("../src/index");
    const commentComposerOnSubmit = vi.fn();
    const onReviewCreated = vi.fn();
    const fakeDocument = {
      body: {
        nodeName: "BODY"
      },
      documentElement: {
        clientHeight: 768,
        clientWidth: 1024
      }
    } as unknown as Document;
    const fakeWindow = {
      devicePixelRatio: 2,
      innerHeight: 768,
      innerWidth: 1024,
      location: {
        href: "http://localhost:3000/pricing"
      },
      navigator: {
        userAgent: "Vitest"
      },
      scrollX: 12,
      scrollY: 48
    } as unknown as Window;
    const selectedElement = {
      outerHTML: "<button data-testid='hero-cta'>Start free trial</button>"
    } as Element;

    ReviewProvider({
      children: "child",
      commentComposer: {
        onSubmit: commentComposerOnSubmit
      },
      document: fakeDocument,
      initialEnabled: true,
      onReviewCreated,
      reviewerName: "QA",
      serverUrl: "http://localhost:4173/",
      submitOptions: {
        headers: {
          "x-peril-test": "1"
        },
        retryDelayMs: 0
      },
      window: fakeWindow
    });

    const bridgeElement = createPortalMock.mock.calls[0]?.[0] as {
      props: Record<string, unknown>;
      type: (props: Record<string, unknown>) => null;
    };

    bridgeElement.type(bridgeElement.props);

    const overlayOptions = createReviewOverlayMock.mock.calls[0]?.[0] as {
      commentComposer: {
        onSubmit: (submission: {
          comment: {
            category: string;
            expected: string;
            severity: string;
            text: string;
          };
          selection: {
            boundingBox: {
              height: number;
              width: number;
              x: number;
              y: number;
            };
            element: Element;
          };
        }) => void;
      };
    };

    const submission = {
      comment: {
        category: "ux",
        expected: "Keep the CTA on one line.",
        severity: "medium",
        text: "Button wraps awkwardly at laptop widths."
      },
      selection: {
        boundingBox: {
          height: 56,
          width: 412,
          x: 218,
          y: 164
        },
        element: selectedElement
      }
    };

    overlayOptions.commentComposer.onSubmit(submission);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();

    expect(commentComposerOnSubmit).toHaveBeenCalledWith(submission);
    expect(captureElementScreenshotMock).toHaveBeenCalledWith(selectedElement);
    expect(capturePageScreenshotMock).toHaveBeenCalledWith({
      document: fakeDocument,
      window: fakeWindow
    });
    expect(generateLocatorBundleMock).toHaveBeenCalledWith(selectedElement);
    expect(submitReviewMock).toHaveBeenCalledWith(
      {
        artifacts: {
          elementScreenshot: "data:image/png;base64,ZWxlbWVudA==",
          pageScreenshot: "data:image/png;base64,cGFnZQ=="
        },
        comment: submission.comment,
        metadata: {
          devicePixelRatio: 2,
          reviewerName: "QA",
          scrollPosition: {
            x: 12,
            y: 48
          },
          userAgent: "Vitest"
        },
        selection: {
          boundingBox: submission.selection.boundingBox,
          domSnippet: "<button data-testid='hero-cta'>Start free trial</button>",
          locators: generateLocatorBundleMock.mock.results[0]?.value
        },
        url: "http://localhost:3000/pricing",
        viewport: {
          height: 768,
          width: 1024
        }
      },
      {
        endpoint: "http://localhost:4173/api/reviews",
        headers: {
          "x-peril-test": "1"
        },
        retryDelayMs: 0
      }
    );
    expect(onReviewCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FB0"
      })
    );

    for (const cleanup of cleanups) {
      cleanup();
    }
  });
});
