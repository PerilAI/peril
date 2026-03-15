import { afterEach, describe, expect, it, vi } from "vitest";

const { html2canvasMock } = vi.hoisted(() => ({
  html2canvasMock: vi.fn()
}));

vi.mock("html2canvas", () => ({
  default: html2canvasMock
}));

import {
  createReviewOverlay,
  generateLocatorBundle,
  type OverlaySelection
} from "../src/index";

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
  public children: FakeElement[] = [];
  public readonly nodeType = 1;
  public ownerDocument: FakeDocument | null = null;
  public parentElement: FakeElement | null = null;
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

function createMouseEvent(target: unknown) {
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

describe("@peril-ai/core error handling", () => {
  afterEach(() => {
    html2canvasMock.mockReset();
  });

  describe("overlay — deep DOM nesting", () => {
    it("handles hover and selection on a deeply nested element (50 levels)", () => {
      const document = new FakeDocument();
      const window = new FakeWindow();
      const hoveredSelections: Array<OverlaySelection | null> = [];

      let current: FakeElement = document.body;
      for (let i = 0; i < 50; i++) {
        const child = document.createElement("div");
        current.appendChild(child);
        current = child;
      }

      const deepTarget = document.createElement("button");
      deepTarget.textContent = "Deep button";
      deepTarget.setRect({ height: 40, left: 100, top: 200, width: 200 });
      current.appendChild(deepTarget);

      const overlay = createReviewOverlay({
        document: document as unknown as Document,
        onHover(selection) {
          hoveredSelections.push(selection);
        },
        window: window as unknown as Window
      });

      overlay.setEnabled(true);
      document.dispatch("pointermove", createMouseEvent(deepTarget));

      expect(hoveredSelections).toHaveLength(1);
      expect(hoveredSelections[0]?.boundingBox).toEqual({
        height: 40,
        width: 200,
        x: 100,
        y: 200
      });
      expect(hoveredSelections[0]?.element).toBe(deepTarget);

      overlay.destroy();
    });

    it("click-selects a deeply nested element and locks selection", () => {
      const document = new FakeDocument();
      const window = new FakeWindow();
      const selectedSelections: OverlaySelection[] = [];

      let current: FakeElement = document.body;
      for (let i = 0; i < 30; i++) {
        const child = document.createElement("span");
        current.appendChild(child);
        current = child;
      }

      const deepButton = document.createElement("a");
      deepButton.setAttribute("href", "/deep");
      deepButton.textContent = "Deep link";
      deepButton.setRect({ height: 24, left: 50, top: 300, width: 100 });
      current.appendChild(deepButton);

      const overlay = createReviewOverlay({
        document: document as unknown as Document,
        onSelect(selection) {
          selectedSelections.push(selection);
        },
        window: window as unknown as Window
      });

      overlay.setEnabled(true);
      document.dispatch("click", createMouseEvent(deepButton));

      expect(selectedSelections).toHaveLength(1);
      expect(selectedSelections[0]?.element).toBe(deepButton);

      overlay.destroy();
    });
  });

  describe("locator generator — elements with no viable selectors", () => {
    it("generates structural CSS and XPath for an element with no id, testId, role, or text", () => {
      const document = new FakeDocument();
      const wrapper = document.createElement("div");
      const target = document.createElement("div");
      document.body.appendChild(wrapper);
      wrapper.appendChild(target);

      const bundle = generateLocatorBundle(target as unknown as Element);

      expect(bundle.testId).toBeUndefined();
      expect(bundle.role).toBeUndefined();
      expect(bundle.text).toBeUndefined();
      expect(bundle.css).toBe("html > body > div > div");
      expect(bundle.xpath).toBe("/html[1]/body[1]/div[1]/div[1]");
    });

    it("omits text locator for elements with whitespace-only content", () => {
      const document = new FakeDocument();
      const target = document.createElement("span");
      target.textContent = "   \t\n   ";
      document.body.appendChild(target);

      const bundle = generateLocatorBundle(target as unknown as Element);

      expect(bundle.text).toBeUndefined();
    });

    it("generates structural selectors for deeply nested anonymous divs", () => {
      const document = new FakeDocument();
      let current: FakeElement = document.body;

      for (let i = 0; i < 20; i++) {
        const child = document.createElement("div");
        current.appendChild(child);
        current = child;
      }

      const bundle = generateLocatorBundle(current as unknown as Element);

      expect(bundle.testId).toBeUndefined();
      expect(bundle.role).toBeUndefined();
      expect(bundle.text).toBeUndefined();

      const expectedCssParts = ["html", "body", ...Array(20).fill("div")];
      expect(bundle.css).toBe(expectedCssParts.join(" > "));

      const expectedXPathParts = ["html[1]", "body[1]", ...Array(20).fill("div[1]")];
      expect(bundle.xpath).toBe(`/${expectedXPathParts.join("/")}`);
    });

    it("disambiguates siblings with nth-of-type when no attributes exist", () => {
      const document = new FakeDocument();
      const first = document.createElement("div");
      const second = document.createElement("div");
      const third = document.createElement("div");
      document.body.appendChild(first);
      document.body.appendChild(second);
      document.body.appendChild(third);

      const bundle = generateLocatorBundle(second as unknown as Element);

      expect(bundle.css).toBe("html > body > div:nth-of-type(2)");
      expect(bundle.xpath).toBe("/html[1]/body[1]/div[2]");
    });

    it("short-circuits with a testId ancestor even when the target has no attributes", () => {
      const document = new FakeDocument();
      const parent = document.createElement("section");
      parent.setAttribute("data-testid", "card");
      const target = document.createElement("div");
      document.body.appendChild(parent);
      parent.appendChild(target);

      const bundle = generateLocatorBundle(target as unknown as Element);

      expect(bundle.css).toBe("[data-testid=\"card\"] > div");
      expect(bundle.xpath).toContain("@data-testid");
    });
  });
});
