import { describe, expect, it, vi } from "vitest";

function mockCoreModule(createReviewOverlayMock: ReturnType<typeof vi.fn>) {
  vi.doMock("@peril/core", () => ({
    createReviewOverlay: createReviewOverlayMock,
    getBestLocatorSummary: vi.fn(),
    getRankedLocators: vi.fn(),
    locatorPriority: ["testId", "role", "css", "xpath", "text"]
  }));
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
    mockCoreModule(vi.fn());

    const { ReviewProvider } = await import("../src/index");
    const fakeDocument = {
      body: {
        nodeName: "BODY"
      }
    } as unknown as Document;
    const fakeWindow = {} as Window;
    const onHover = vi.fn();
    const onSelect = vi.fn();

    const element = ReviewProvider({
      children: "child",
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
    const useRefMock = vi
      .fn()
      .mockImplementationOnce(() => controllerRef)
      .mockImplementationOnce((value: unknown) => ({
        current: value
      }))
      .mockImplementationOnce((value: unknown) => ({
        current: value
      }));
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
    mockCoreModule(createReviewOverlayMock);

    const { ReviewProvider } = await import("../src/index");
    const fakeDocument = {
      body: {
        nodeName: "BODY"
      }
    } as unknown as Document;
    const fakeWindow = {} as Window;
    const onHover = vi.fn();
    const onSelect = vi.fn();

    ReviewProvider({
      children: "child",
      document: fakeDocument,
      initialEnabled: true,
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
    expect(createReviewOverlayMock).toHaveBeenCalledWith({
      document: fakeDocument,
      onHover: expect.any(Function),
      onSelect: expect.any(Function),
      window: fakeWindow,
      zIndex: 120
    });
    expect(controller.setEnabled).toHaveBeenCalledWith(true);

    for (const cleanup of cleanups) {
      cleanup();
    }

    expect(controller.destroy).toHaveBeenCalledTimes(1);
  });
});
