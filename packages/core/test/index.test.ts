import { afterEach, describe, expect, it, vi } from "vitest";

const { html2canvasMock } = vi.hoisted(() => ({
  html2canvasMock: vi.fn()
}));

vi.mock("html2canvas", () => ({
  default: html2canvasMock
}));

import {
  captureElementScreenshot,
  CaptureElementScreenshotError,
  capturePageScreenshot,
  createReview,
  createReviewId,
  createReviewOverlay,
  generateLocatorBundle,
  getBestLocatorSummary,
  getRankedLocators,
  locatorPriority,
  maxArtifactPayloadBytes,
  maxDomSnippetLength,
  maxLocatorTextLength,
  serializeReview,
  type OverlaySelection
} from "../src/index";

interface FakeMouseEvent {
  defaultPrevented: boolean;
  immediatePropagationStopped: boolean;
  propagationStopped: boolean;
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
  target: unknown;
}

interface FakeKeyboardEvent {
  altKey: boolean;
  ctrlKey: boolean;
  defaultPrevented: boolean;
  key: string;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
  preventDefault(): void;
}

interface FakeSubmitEvent {
  defaultPrevented: boolean;
  preventDefault(): void;
  target: unknown;
}

interface RectInput {
  height: number;
  left: number;
  top: number;
  width: number;
}

class FakeEventTarget {
  private readonly listeners = new Map<string, Set<(event: unknown) => void>>();

  addEventListener(type: string, listener: (event: unknown) => void): void {
    const typeListeners = this.listeners.get(type) ?? new Set<(event: unknown) => void>();
    typeListeners.add(listener);
    this.listeners.set(type, typeListeners);
  }

  dispatch(type: string, event: unknown): void {
    const typeListeners = this.listeners.get(type);

    if (!typeListeners) {
      return;
    }

    for (const listener of typeListeners) {
      listener(event);
    }
  }

  removeEventListener(type: string, listener: (event: unknown) => void): void {
    const typeListeners = this.listeners.get(type);

    if (!typeListeners) {
      return;
    }

    typeListeners.delete(listener);

    if (typeListeners.size === 0) {
      this.listeners.delete(type);
    }
  }
}

class FakeElement extends FakeEventTarget {
  public clientHeight = 0;
  public clientWidth = 0;
  public children: FakeElement[] = [];
  public readonly nodeType = 1;
  public offsetHeight = 0;
  public offsetWidth = 0;
  public ownerDocument: FakeDocument | null = null;
  public parentElement: FakeElement | null = null;
  public scrollHeight = 0;
  public scrollWidth = 0;
  public readonly style: Record<string, string> = {};
  public value = "";
  private attributes = new Map<string, string>();
  private explicitTextContent: string | null = null;
  private rect = createRect({
    height: 0,
    left: 0,
    top: 0,
    width: 0
  });

  constructor(
    public readonly tagName: string
  ) {
    super();
  }

  appendChild(child: FakeElement): void {
    child.parentElement = this;
    child.ownerDocument = this.ownerDocument;
    this.children.push(child);
  }

  contains(node: unknown): boolean {
    if (node === this) {
      return true;
    }

    return this.children.some((child) => child.contains(node));
  }

  getAttribute(name: string): string | undefined {
    return this.attributes.get(name);
  }

  getBoundingClientRect(): DOMRect {
    return this.rect;
  }

  remove(): void {
    if (!this.parentElement) {
      return;
    }

    this.parentElement.children = this.parentElement.children.filter((child) => child !== this);
    this.parentElement = null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  setRect(rect: RectInput): void {
    this.rect = createRect(rect);
    this.clientHeight = rect.height;
    this.clientWidth = rect.width;
    this.offsetHeight = rect.height;
    this.offsetWidth = rect.width;
    this.scrollHeight = rect.height;
    this.scrollWidth = rect.width;
  }

  get textContent(): string | null {
    if (this.explicitTextContent !== null) {
      return this.explicitTextContent;
    }

    return this.children.map((child) => child.textContent ?? "").join(" ");
  }

  set textContent(value: string | null) {
    this.explicitTextContent = value;
  }
}

class FakeDocument extends FakeEventTarget {
  public readonly body = new FakeElement("body");
  public defaultView: FakeWindow | null = null;
  public readonly documentElement = new FakeElement("html");

  constructor() {
    super();
    this.body.ownerDocument = this;
    this.documentElement.ownerDocument = this;
    this.documentElement.appendChild(this.body);
  }

  createElement(tagName: string): FakeElement {
    const element = new FakeElement(tagName);
    element.ownerDocument = this;
    return element;
  }

  getElementById(id: string): FakeElement | null {
    return findElementById(this.documentElement, id);
  }
}

class FakeWindow extends FakeEventTarget {
  public innerHeight = 720;
  public innerWidth = 1280;
  public pageXOffset = 0;
  public pageYOffset = 0;
}

interface FakeCanvasOptions {
  blob?: Blob | null;
  dataUrl?: string;
  omitToBlob?: boolean;
}

function createFakeCanvas(options: FakeCanvasOptions = {}) {
  const dataUrl = options.dataUrl ?? "data:image/png;base64,ZWxlbWVudA==";
  const toDataURL = vi.fn((type?: string) => {
    expect(type).toBe("image/png");
    return dataUrl;
  });
  const toBlob = options.omitToBlob
    ? undefined
    : vi.fn((callback: (blob: Blob | null) => void, type?: string) => {
        expect(type).toBe("image/png");
        callback(options.blob ?? null);
      });

  return {
    canvas: {
      toBlob,
      toDataURL
    } as unknown as HTMLCanvasElement,
    toBlob,
    toDataURL
  };
}

function createMouseEvent(target: unknown): FakeMouseEvent {
  return {
    defaultPrevented: false,
    immediatePropagationStopped: false,
    propagationStopped: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopImmediatePropagation() {
      this.immediatePropagationStopped = true;
    },
    stopPropagation() {
      this.propagationStopped = true;
    },
    target
  };
}

function createSubmitEvent(target: unknown): FakeSubmitEvent {
  return {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
    target
  };
}

function createKeyboardEvent(
  key: string,
  options: Partial<Omit<FakeKeyboardEvent, "defaultPrevented" | "key" | "preventDefault">> = {}
): FakeKeyboardEvent {
  return {
    altKey: options.altKey ?? false,
    ctrlKey: options.ctrlKey ?? false,
    defaultPrevented: false,
    key,
    metaKey: options.metaKey ?? false,
    repeat: options.repeat ?? false,
    shiftKey: options.shiftKey ?? false,
    preventDefault() {
      this.defaultPrevented = true;
    }
  };
}

function createRect(rect: RectInput): DOMRect {
  return {
    bottom: rect.top + rect.height,
    height: rect.height,
    left: rect.left,
    right: rect.left + rect.width,
    toJSON() {
      return rect;
    },
    top: rect.top,
    width: rect.width,
    x: rect.left,
    y: rect.top
  } as DOMRect;
}

function createOverlayHarness() {
  const document = new FakeDocument();
  const window = new FakeWindow();
  document.defaultView = window;
  const firstTarget = new FakeElement("button");
  const secondTarget = new FakeElement("a");

  firstTarget.setRect({
    height: 48,
    left: 12,
    top: 18,
    width: 120
  });
  secondTarget.setRect({
    height: 20,
    left: 200,
    top: 90,
    width: 80
  });
  document.body.appendChild(firstTarget);
  document.body.appendChild(secondTarget);

  return {
    document,
    firstTarget,
    getHighlight(): FakeElement | undefined {
      return document.body.children.find((child) =>
        child.getAttribute("data-peril-overlay-root") === "true"
      )?.children[0];
    },
    getOverlayRoot(): FakeElement | undefined {
      return document.body.children.find((child) =>
        child.getAttribute("data-peril-overlay-root") === "true"
      );
    },
    getComposer(): FakeElement | undefined {
      return findElementByAttribute(document.body, "data-peril-overlay-composer", "true");
    },
    secondTarget,
    window
  };
}

function findElementById(root: FakeElement, id: string): FakeElement | null {
  if (root.getAttribute("id") === id) {
    return root;
  }

  for (const child of root.children) {
    const match = findElementById(child, id);

    if (match) {
      return match;
    }
  }

  return null;
}

function findElementByAttribute(
  root: FakeElement,
  name: string,
  value: string
): FakeElement | undefined {
  if (root.getAttribute(name) === value) {
    return root;
  }

  for (const child of root.children) {
    const match = findElementByAttribute(child, name, value);

    if (match) {
      return match;
    }
  }

  return undefined;
}

function findFieldByName(root: FakeElement, name: string): FakeElement | undefined {
  return findElementByAttribute(root, "name", name);
}

function findButtonByType(root: FakeElement, type: string): FakeElement | undefined {
  return findElementByAttribute(root, "type", type);
}

describe("@peril-ai/core", () => {
  afterEach(() => {
    html2canvasMock.mockReset();
  });

  it("keeps locator priority aligned with the data model docs", () => {
    expect(locatorPriority).toEqual(["testId", "role", "css", "xpath", "text"]);
  });

  it("generates ULID-based review ids with the rev_ prefix", () => {
    expect(
      createReviewId({
        now: 0,
        randomValues: new Uint8Array(16).fill(31)
      })
    ).toBe("rev_0000000000ZZZZZZZZZZZZZZZZ");
  });

  it("creates reviews that match the documented schema defaults", () => {
    const review = createReview({
      artifacts: {
        elementScreenshot: "data:image/png;base64,ZWxlbWVudA==",
        pageScreenshot: "data:image/png;base64,cGFnZQ==",
        rrwebSession: "{\"events\":[]}"
      },
      comment: {
        category: "ux",
        expected: "Keep the CTA on one line.",
        severity: "medium",
        text: "Button wraps awkwardly at laptop widths."
      },
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAV",
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
        boundingBox: {
          height: 56,
          width: 412,
          x: 218,
          y: 164
        },
        computedStyles: {
          color: "rgb(255, 255, 255)"
        },
        domSnippet: "<button data-testid='hero-cta'>Start free trial</button>",
        locators: {
          testId: "hero-cta",
          role: {
            name: "Start free trial",
            type: "button"
          },
          css: "[data-testid='hero-cta']",
          xpath: "//*[@data-testid='hero-cta']",
          text: "Start free trial"
        }
      },
      timestamp: "2026-03-10T05:15:00.000Z",
      url: "http://localhost:3000/pricing",
      viewport: {
        height: 900,
        width: 1440
      }
    });

    expect(review).toEqual({
      artifacts: {
        elementScreenshot: "data:image/png;base64,ZWxlbWVudA==",
        pageScreenshot: "data:image/png;base64,cGFnZQ==",
        rrwebSession: "{\"events\":[]}"
      },
      comment: {
        category: "ux",
        expected: "Keep the CTA on one line.",
        severity: "medium",
        text: "Button wraps awkwardly at laptop widths."
      },
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAV",
      metadata: {
        devicePixelRatio: 2,
        reviewerName: "QA",
        scrollPosition: {
          x: 12,
          y: 48
        },
        userAgent: "Vitest"
      },
      resolution: null,
      selection: {
        boundingBox: {
          height: 56,
          width: 412,
          x: 218,
          y: 164
        },
        computedStyles: {
          color: "rgb(255, 255, 255)"
        },
        domSnippet: "<button data-testid='hero-cta'>Start free trial</button>",
        locators: {
          testId: "hero-cta",
          role: {
            name: "Start free trial",
            type: "button"
          },
          css: "[data-testid='hero-cta']",
          xpath: "//*[@data-testid='hero-cta']",
          text: "Start free trial"
        }
      },
      status: "open",
      timestamp: "2026-03-10T05:15:00.000Z",
      url: "http://localhost:3000/pricing",
      viewport: {
        height: 900,
        width: 1440
      }
    });
    expect(Object.keys(review.selection.locators)).toEqual([
      "testId",
      "role",
      "css",
      "xpath",
      "text"
    ]);
  });

  it("truncates dom snippets and text locators to the documented limits", () => {
    const review = createReview({
      artifacts: {
        elementScreenshot: "element.png",
        pageScreenshot: "page.png"
      },
      comment: {
        category: "bug",
        expected: "Do not wrap.",
        severity: "high",
        text: "Fix the broken button."
      },
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAW",
      metadata: {
        devicePixelRatio: 1,
        scrollPosition: {
          x: 0,
          y: 0
        },
        userAgent: "Vitest"
      },
      selection: {
        boundingBox: {
          height: 40,
          width: 120,
          x: 10,
          y: 20
        },
        domSnippet: "x".repeat(maxDomSnippetLength + 25),
        locators: {
          css: ".hero-cta",
          text: "A".repeat(maxLocatorTextLength + 25),
          xpath: "//*[@class='hero-cta']"
        }
      },
      timestamp: "2026-03-10T05:16:00.000Z",
      url: "http://localhost:3000",
      viewport: {
        height: 768,
        width: 1024
      }
    });

    expect(review.selection.domSnippet).toHaveLength(maxDomSnippetLength);
    expect(review.selection.locators.text).toHaveLength(maxLocatorTextLength);
  });

  it("serializes created reviews as formatted JSON", () => {
    const payload = {
      artifacts: {
        elementScreenshot: "element.png",
        pageScreenshot: "page.png"
      },
      comment: {
        category: "polish" as const,
        expected: "Align with the hero copy baseline.",
        severity: "low" as const,
        text: "Nudge the button up by a few pixels."
      },
      id: "rev_01ARZ3NDEKTSV4RRFFQ69G5FAX",
      metadata: {
        devicePixelRatio: 1,
        scrollPosition: {
          x: 4,
          y: 8
        },
        userAgent: "Vitest"
      },
      selection: {
        boundingBox: {
          height: 48,
          width: 180,
          x: 32,
          y: 64
        },
        domSnippet: "<button>Start free trial</button>",
        locators: {
          css: "main button",
          xpath: "//main//button",
          text: "Start free trial"
        }
      },
      timestamp: "2026-03-10T05:17:00.000Z",
      url: "http://localhost:3000",
      viewport: {
        height: 800,
        width: 1280
      }
    };

    expect(JSON.parse(serializeReview(payload))).toEqual(createReview(payload));
  });

  it("returns ranked locators in the documented order", () => {
    const rankedLocators = getRankedLocators({
      testId: "hero-cta",
      role: {
        type: "button",
        name: "Start free trial"
      },
      css: "[data-testid='hero-cta']",
      xpath: "//*[@data-testid='hero-cta']",
      text: "Start free trial"
    });

    expect(rankedLocators.map((locator) => locator.kind)).toEqual([
      "testId",
      "role",
      "css",
      "xpath",
      "text"
    ]);
    expect(getBestLocatorSummary({
      testId: "hero-cta",
      css: "[data-testid='hero-cta']",
      xpath: "//*[@data-testid='hero-cta']"
    })).toBe("hero-cta");
  });

  it("generates a full locator bundle for data-testid-backed elements", () => {
    const document = new FakeDocument();
    const button = document.createElement("button");
    button.setAttribute("data-testid", "hero-cta");
    button.textContent = "Start free trial";
    document.body.appendChild(button);

    expect(generateLocatorBundle(button as unknown as Element)).toEqual({
      testId: "hero-cta",
      role: {
        name: "Start free trial",
        type: "button"
      },
      css: "[data-testid=\"hero-cta\"]",
      xpath: "//*[@data-testid=\"hero-cta\"]",
      text: "Start free trial"
    });
  });

  it("uses associated labels to build role locators for form controls", () => {
    const document = new FakeDocument();
    const label = document.createElement("label");
    const input = document.createElement("input");

    label.setAttribute("for", "email");
    label.textContent = "Email address";
    input.setAttribute("id", "email");
    input.setAttribute("type", "email");

    document.body.appendChild(label);
    document.body.appendChild(input);

    expect(generateLocatorBundle(input as unknown as Element)).toEqual({
      role: {
        name: "Email address",
        type: "textbox"
      },
      css: "[id=\"email\"]",
      xpath: "//*[@id=\"email\"]"
    });
  });

  it("falls back to structural css and xpath selectors when no stable attributes exist", () => {
    const document = new FakeDocument();
    const section = document.createElement("section");
    const firstButton = document.createElement("button");
    const secondButton = document.createElement("button");

    firstButton.textContent = "Cancel";
    secondButton.textContent = "Save";

    section.appendChild(firstButton);
    section.appendChild(secondButton);
    document.body.appendChild(section);

    expect(generateLocatorBundle(secondButton as unknown as Element)).toEqual({
      role: {
        name: "Save",
        type: "button"
      },
      css: "html > body > section > button:nth-of-type(2)",
      xpath: "/html[1]/body[1]/section[1]/button[2]",
      text: "Save"
    });
  });

  it("truncates generated text locators to the documented limit", () => {
    const document = new FakeDocument();
    const button = document.createElement("button");
    const longText = "A".repeat(maxLocatorTextLength + 40);
    button.textContent = longText;
    document.body.appendChild(button);

    const bundle = generateLocatorBundle(button as unknown as Element);

    expect(bundle.text).toHaveLength(maxLocatorTextLength);
    expect(bundle.text).toBe(longText.slice(0, maxLocatorTextLength));
    expect(bundle.role).toEqual({
      name: longText,
      type: "button"
    });
  });

  it("captures element screenshots as PNG data URLs by default", async () => {
    const target = new FakeElement("button");
    const { canvas, toDataURL } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await captureElementScreenshot(target as unknown as Element);

    expect(screenshot).toBe("data:image/png;base64,ZWxlbWVudA==");
    expect(html2canvasMock).toHaveBeenCalledWith(target, {
      backgroundColor: null,
      logging: false,
      useCORS: true
    });
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });

  it("captures element screenshots as blobs when requested", async () => {
    const target = new FakeElement("section");
    const expectedBlob = new Blob(["element"], {
      type: "image/png"
    });
    const { canvas, toBlob, toDataURL } = createFakeCanvas({
      blob: expectedBlob
    });
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await captureElementScreenshot(target as unknown as Element, {
      format: "blob"
    });

    expect(screenshot).toBe(expectedBlob);
    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it("falls back to PNG data URL conversion when canvas blob output is unavailable", async () => {
    const target = new FakeElement("article");
    const { canvas, toBlob, toDataURL } = createFakeCanvas({
      blob: null,
      dataUrl: "data:image/png;base64,ZmFsbGJhY2s="
    });
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await captureElementScreenshot(target as unknown as Element, {
      format: "blob"
    });

    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(toDataURL).toHaveBeenCalledTimes(1);
    expect(screenshot).toBeInstanceOf(Blob);
    await expect((screenshot as Blob).text()).resolves.toBe("fallback");
  });

  it("captures full-page screenshots using the full document bounds by default", async () => {
    const document = new FakeDocument();
    document.documentElement.clientWidth = 1280;
    document.documentElement.clientHeight = 720;
    document.documentElement.scrollWidth = 1680;
    document.documentElement.scrollHeight = 2400;
    document.body.clientWidth = 1366;
    document.body.clientHeight = 1800;
    document.body.scrollWidth = 1600;
    document.body.scrollHeight = 2200;
    const window = {
      innerHeight: 900,
      innerWidth: 1440,
      scrollX: 24,
      scrollY: 64
    } as Window;
    const { canvas, toDataURL } = createFakeCanvas({
      dataUrl: "data:image/png;base64,cGFnZQ=="
    });
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await capturePageScreenshot({
      document: document as unknown as Document,
      window
    });

    expect(screenshot).toBe("data:image/png;base64,cGFnZQ==");
    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: null,
      height: 2400,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 1680,
      windowHeight: 2400,
      windowWidth: 1680,
      x: 0,
      y: 0
    });
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });

  it("forwards capture overrides to html2canvas", async () => {
    const target = new FakeElement("div");
    const { canvas } = createFakeCanvas();
    html2canvasMock.mockResolvedValue(canvas);

    await captureElementScreenshot(target as unknown as Element, {
      backgroundColor: "#ffffff",
      html2canvasOptions: {
        height: 240,
        scale: 3,
        width: 640
      }
    });

    expect(html2canvasMock).toHaveBeenCalledWith(target, {
      backgroundColor: "#ffffff",
      height: 240,
      logging: false,
      scale: 3,
      useCORS: true,
      width: 640
    });
  });

  it("captures the full document as a page screenshot by default", async () => {
    const document = new FakeDocument();
    const window = new FakeWindow();
    const { canvas, toDataURL } = createFakeCanvas({
      dataUrl: "data:image/png;base64,cGFnZQ=="
    });
    document.defaultView = window;
    document.documentElement.scrollWidth = 1800;
    document.documentElement.scrollHeight = 2600;
    window.innerWidth = 1440;
    window.innerHeight = 900;
    window.pageXOffset = 32;
    window.pageYOffset = 120;
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await capturePageScreenshot({
      document: document as unknown as Document,
      window: window as unknown as Window
    });

    expect(screenshot).toBe("data:image/png;base64,cGFnZQ==");
    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: null,
      height: 2600,
      logging: false,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 1800,
      windowHeight: 2600,
      windowWidth: 1800,
      x: 0,
      y: 0
    });
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });

  it("captures the visible viewport when viewport scope is requested", async () => {
    const document = new FakeDocument();
    const window = new FakeWindow();
    const { canvas, toDataURL } = createFakeCanvas({
      dataUrl: "data:image/png;base64,cGFnZQ=="
    });
    document.defaultView = window;
    document.documentElement.scrollWidth = 1800;
    document.documentElement.scrollHeight = 2600;
    window.innerWidth = 1440;
    window.innerHeight = 900;
    window.pageXOffset = 32;
    window.pageYOffset = 120;
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await capturePageScreenshot({
      document: document as unknown as Document,
      scope: "viewport",
      window: window as unknown as Window
    });

    expect(screenshot).toBe("data:image/png;base64,cGFnZQ==");
    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: null,
      height: 900,
      logging: false,
      scrollX: 32,
      scrollY: 120,
      useCORS: true,
      width: 1440,
      windowHeight: 900,
      windowWidth: 1440,
      x: 32,
      y: 120
    });
    expect(toDataURL).toHaveBeenCalledTimes(1);
  });

  it("captures page screenshots as blobs when requested", async () => {
    const document = new FakeDocument();
    const window = new FakeWindow();
    const expectedBlob = new Blob(["page"], {
      type: "image/png"
    });
    const { canvas, toBlob, toDataURL } = createFakeCanvas({
      blob: expectedBlob
    });
    document.defaultView = window;
    html2canvasMock.mockResolvedValue(canvas);

    const screenshot = await capturePageScreenshot({
      document: document as unknown as Document,
      format: "blob",
      window: window as unknown as Window
    });

    expect(screenshot).toBe(expectedBlob);
    expect(toBlob).toHaveBeenCalledTimes(1);
    expect(toDataURL).not.toHaveBeenCalled();
  });

  it("merges page screenshot overrides without allowing document crop drift", async () => {
    const document = new FakeDocument();
    const window = new FakeWindow();
    const { canvas } = createFakeCanvas();
    document.defaultView = window;
    document.documentElement.scrollWidth = 2400;
    document.documentElement.scrollHeight = 3200;
    window.innerWidth = 1024;
    window.innerHeight = 768;
    window.pageXOffset = 24;
    window.pageYOffset = 48;
    html2canvasMock.mockResolvedValue(canvas);

    await capturePageScreenshot({
      backgroundColor: "#ffffff",
      document: document as unknown as Document,
      html2canvasOptions: {
        scale: 2
      },
      window: window as unknown as Window
    });

    expect(html2canvasMock).toHaveBeenCalledWith(document.documentElement, {
      backgroundColor: "#ffffff",
      height: 3200,
      logging: false,
      scale: 2,
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      width: 2400,
      windowHeight: 3200,
      windowWidth: 2400,
      x: 0,
      y: 0
    });
  });

  it("renders a visible hover outline when review mode is enabled", () => {
    const harness = createOverlayHarness();
    const hoveredSelections: Array<OverlaySelection | null> = [];
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      onHover(selection) {
        hoveredSelections.push(selection);
      },
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    harness.document.dispatch("pointermove", createMouseEvent(harness.firstTarget));

    expect(hoveredSelections).toHaveLength(1);
    expect(hoveredSelections[0]?.boundingBox).toEqual({
      height: 48,
      width: 120,
      x: 12,
      y: 18
    });
    expect(harness.getHighlight()?.style.display).toBe("block");
    expect(harness.getHighlight()?.style.left).toBe("12px");
    expect(harness.getHighlight()?.style.top).toBe("18px");
    expect(harness.getHighlight()?.style.width).toBe("120px");
    expect(harness.getHighlight()?.style.height).toBe("48px");
  });

  it("locks the selected element after click until the selection is cleared", () => {
    const harness = createOverlayHarness();
    const selectedSelections: OverlaySelection[] = [];
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      onSelect(selection) {
        selectedSelections.push(selection);
      },
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);

    const clickEvent = createMouseEvent(harness.firstTarget);
    harness.document.dispatch("click", clickEvent);
    harness.document.dispatch("pointermove", createMouseEvent(harness.secondTarget));

    expect(selectedSelections).toHaveLength(1);
    expect(selectedSelections[0]?.element).toBe(harness.firstTarget);
    expect(clickEvent.defaultPrevented).toBe(true);
    expect(clickEvent.propagationStopped).toBe(true);
    expect(clickEvent.immediatePropagationStopped).toBe(true);
    expect(harness.getHighlight()?.style.left).toBe("12px");

    overlay.clearSelection();
    harness.document.dispatch("pointermove", createMouseEvent(harness.secondTarget));

    expect(harness.getHighlight()?.style.left).toBe("200px");
    expect(harness.getHighlight()?.style.top).toBe("90px");
  });

  it("opens a comment composer on selection and submits structured comment data", () => {
    const harness = createOverlayHarness();
    const submissions: Array<{
      comment: {
        category: string;
        expected: string;
        severity: string;
        text: string;
      };
      selection: OverlaySelection;
    }> = [];
    const overlay = createReviewOverlay({
      commentComposer: {
        defaults: {
          category: "polish",
          severity: "high"
        },
        onSubmit(submission) {
          submissions.push(submission);
        }
      },
      document: harness.document as unknown as Document,
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    harness.document.dispatch("click", createMouseEvent(harness.firstTarget));

    const composer = harness.getComposer();
    const textField = composer ? findFieldByName(composer, "text") : undefined;
    const categoryField = composer ? findFieldByName(composer, "category") : undefined;
    const severityField = composer ? findFieldByName(composer, "severity") : undefined;
    const expectedField = composer ? findFieldByName(composer, "expected") : undefined;

    expect(composer?.style.display).toBe("grid");
    expect(categoryField?.value).toBe("polish");
    expect(severityField?.value).toBe("high");

    if (!composer || !textField || !categoryField || !severityField || !expectedField) {
      throw new Error("Expected composer fields to exist.");
    }

    textField.value = "The CTA needs more spacing.";
    categoryField.value = "ux";
    severityField.value = "medium";
    expectedField.value = "Keep 16px between the headline and CTA.";
    composer.dispatch("submit", createSubmitEvent(composer));

    expect(submissions).toEqual([
      {
        comment: {
          category: "ux",
          expected: "Keep 16px between the headline and CTA.",
          severity: "medium",
          text: "The CTA needs more spacing."
        },
        selection: {
          boundingBox: {
            height: 48,
            width: 120,
            x: 12,
            y: 18
          },
          element: harness.firstTarget
        }
      }
    ]);
    expect(composer.style.display).toBe("none");
    expect(harness.getHighlight()?.style.display).toBe("none");
  });

  it("clears the locked selection when the composer is cancelled", () => {
    const harness = createOverlayHarness();
    const cancelledSelections: OverlaySelection[] = [];
    const overlay = createReviewOverlay({
      commentComposer: {
        onCancel(selection) {
          cancelledSelections.push(selection);
        }
      },
      document: harness.document as unknown as Document,
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    harness.document.dispatch("click", createMouseEvent(harness.firstTarget));

    const composer = harness.getComposer();
    const cancelButton = composer ? findButtonByType(composer, "button") : undefined;

    if (!composer || !cancelButton) {
      throw new Error("Expected composer cancel button to exist.");
    }

    cancelButton.dispatch("click", createMouseEvent(cancelButton));

    expect(cancelledSelections).toEqual([
      {
        boundingBox: {
          height: 48,
          width: 120,
          x: 12,
          y: 18
        },
        element: harness.firstTarget
      }
    ]);
    expect(composer.style.display).toBe("none");

    harness.document.dispatch("pointermove", createMouseEvent(harness.secondTarget));

    expect(harness.getHighlight()?.style.left).toBe("200px");
    expect(harness.getHighlight()?.style.top).toBe("90px");
  });

  it("ranks locators correctly with only required fields", () => {
    const rankedLocators = getRankedLocators({
      css: ".my-button",
      xpath: "//button[@class='my-button']"
    });

    expect(rankedLocators.map((l) => l.kind)).toEqual(["css", "xpath"]);
    expect(rankedLocators).toHaveLength(2);
  });

  it("falls back to css in getBestLocatorSummary when no optional locators exist", () => {
    const summary = getBestLocatorSummary({
      css: ".fallback-selector",
      xpath: "//div"
    });

    expect(summary).toBe(".fallback-selector");
  });

  it("prefers role over css when testId is absent", () => {
    const summary = getBestLocatorSummary({
      role: { type: "link", name: "Home" },
      css: "a.home-link",
      xpath: "//a[@class='home-link']"
    });

    expect(summary).toContain("link");
    expect(summary).toContain("Home");
  });

  it("reports enabled state correctly via isEnabled()", () => {
    const harness = createOverlayHarness();
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      window: harness.window as unknown as Window
    });

    expect(overlay.isEnabled()).toBe(false);
    overlay.setEnabled(true);
    expect(overlay.isEnabled()).toBe(true);
    overlay.setEnabled(false);
    expect(overlay.isEnabled()).toBe(false);
    overlay.destroy();
  });

  it("hides highlight for zero-size elements", () => {
    const harness = createOverlayHarness();
    const zeroSizeElement = new FakeElement("span");
    zeroSizeElement.setRect({ height: 0, left: 0, top: 0, width: 0 });
    harness.document.body.appendChild(zeroSizeElement);

    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    harness.document.dispatch("pointermove", createMouseEvent(zeroSizeElement));

    expect(harness.getHighlight()?.style.display).toBe("none");
    overlay.destroy();
  });

  it("toggles review mode with the default Ctrl+Shift+. shortcut", () => {
    const harness = createOverlayHarness();
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      window: harness.window as unknown as Window
    });
    const keyboardEvent = createKeyboardEvent(".", {
      ctrlKey: true,
      shiftKey: true
    });

    expect(overlay.isEnabled()).toBe(false);

    harness.document.dispatch("keydown", keyboardEvent);

    expect(keyboardEvent.defaultPrevented).toBe(true);
    expect(overlay.isEnabled()).toBe(true);

    harness.document.dispatch(
      "keydown",
      createKeyboardEvent(".", {
        ctrlKey: true,
        shiftKey: true
      })
    );

    expect(overlay.isEnabled()).toBe(false);
    overlay.destroy();
  });

  it("supports configurable keyboard shortcuts", () => {
    const harness = createOverlayHarness();
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      keyboardShortcut: {
        altKey: true,
        ctrlKey: false,
        key: "k",
        shiftKey: false
      },
      window: harness.window as unknown as Window
    });

    harness.document.dispatch(
      "keydown",
      createKeyboardEvent("r", {
        ctrlKey: true,
        shiftKey: true
      })
    );
    expect(overlay.isEnabled()).toBe(false);

    harness.document.dispatch(
      "keydown",
      createKeyboardEvent("k", {
        altKey: true
      })
    );
    expect(overlay.isEnabled()).toBe(true);
    overlay.destroy();
  });

  it("can disable keyboard shortcut handling", () => {
    const harness = createOverlayHarness();
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      keyboardShortcut: false,
      window: harness.window as unknown as Window
    });

    harness.document.dispatch(
      "keydown",
      createKeyboardEvent("r", {
        ctrlKey: true,
        shiftKey: true
      })
    );

    expect(overlay.isEnabled()).toBe(false);
    overlay.destroy();
  });

  it("delegates shortcut toggles through onToggleRequest when provided", () => {
    const harness = createOverlayHarness();
    const toggleRequests: boolean[] = [];
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      onToggleRequest(enabled) {
        toggleRequests.push(enabled);
      },
      window: harness.window as unknown as Window
    });

    harness.document.dispatch(
      "keydown",
      createKeyboardEvent(".", {
        ctrlKey: true,
        shiftKey: true
      })
    );

    expect(toggleRequests).toEqual([true]);
    expect(overlay.isEnabled()).toBe(false);
    overlay.destroy();
  });

  it("ignores events targeting the overlay root itself", () => {
    const harness = createOverlayHarness();
    const hoveredSelections: Array<OverlaySelection | null> = [];
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      onHover(selection) {
        hoveredSelections.push(selection);
      },
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    const overlayRoot = harness.getOverlayRoot();
    harness.document.dispatch("pointermove", createMouseEvent(overlayRoot));

    expect(hoveredSelections).toHaveLength(0);
    overlay.destroy();
  });

  it("re-renders highlight on viewport resize", () => {
    const harness = createOverlayHarness();
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    harness.document.dispatch("pointermove", createMouseEvent(harness.firstTarget));
    expect(harness.getHighlight()?.style.left).toBe("12px");

    harness.firstTarget.setRect({ height: 48, left: 50, top: 18, width: 120 });
    harness.window.dispatch("resize", {});

    expect(harness.getHighlight()?.style.left).toBe("50px");
    overlay.destroy();
  });

  it("hides and cleans up the overlay when disabled or destroyed", () => {
    const harness = createOverlayHarness();
    let selectionCount = 0;
    const overlay = createReviewOverlay({
      document: harness.document as unknown as Document,
      onSelect() {
        selectionCount += 1;
      },
      window: harness.window as unknown as Window
    });

    overlay.setEnabled(true);
    harness.document.dispatch("pointermove", createMouseEvent(harness.firstTarget));
    overlay.setEnabled(false);

    expect(harness.getOverlayRoot()).toBeDefined();
    expect(harness.getHighlight()?.style.display).toBe("none");

    harness.document.dispatch("click", createMouseEvent(harness.firstTarget));
    expect(selectionCount).toBe(0);

    overlay.destroy();

    expect(harness.document.body.children).toHaveLength(2);
    expect(harness.getOverlayRoot()).toBeUndefined();
  });

  it("rejects oversized screenshot payloads with CaptureElementScreenshotError", async () => {
    const target = new FakeElement("div");
    const oversizedBase64 = "A".repeat(Math.ceil((maxArtifactPayloadBytes + 1) * 4 / 3));
    const oversizedDataUrl = `data:image/png;base64,${oversizedBase64}`;
    const { canvas } = createFakeCanvas({ dataUrl: oversizedDataUrl });
    html2canvasMock.mockResolvedValue(canvas);

    await expect(captureElementScreenshot(target as unknown as Element)).rejects.toThrow(
      CaptureElementScreenshotError
    );
  });

  it("wraps renderer failures as CaptureElementScreenshotError", async () => {
    const target = new FakeElement("div");
    html2canvasMock.mockRejectedValue(new TypeError("Canvas rendering failed"));

    await expect(captureElementScreenshot(target as unknown as Element)).rejects.toThrow(
      CaptureElementScreenshotError
    );
    await expect(captureElementScreenshot(target as unknown as Element)).rejects.toThrow(
      "Failed to capture element screenshot."
    );
  });
});
