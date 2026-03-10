import { describe, expect, it } from "vitest";

import {
  createReview,
  createReviewId,
  createReviewOverlay,
  generateLocatorBundle,
  getBestLocatorSummary,
  getRankedLocators,
  locatorPriority,
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

class FakeElement {
  public children: FakeElement[] = [];
  public readonly nodeType = 1;
  public ownerDocument: FakeDocument | null = null;
  public parentElement: FakeElement | null = null;
  public readonly style: Record<string, string> = {};
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
  ) {}

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

class FakeWindow extends FakeEventTarget {}

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

describe("@peril/core", () => {
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
});
