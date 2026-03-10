import { describe, expect, it } from "vitest";
import {
  generatePlaygroundLocatorBundle,
  type PlaygroundDocumentLike,
  type PlaygroundElementLike
} from "../components/annotationPlaygroundLocators";

interface FakeElement extends PlaygroundElementLike {
  attributes: Record<string, string>;
  children: FakeElement[];
  ownerDocument: FakeDocument;
  parentElement: FakeElement | null;
}

interface FakeDocument extends PlaygroundDocumentLike {
  body: FakeElement;
}

describe("annotation playground locators", () => {
  it("prefers stable test ids and accessible roles", () => {
    const button = createTree("button", {
      "data-testid": "demo-ship-feedback"
    }, "Ship feedback faster");

    const bundle = generatePlaygroundLocatorBundle(button);

    expect(bundle).toEqual({
      testId: "demo-ship-feedback",
      role: {
        name: "Ship feedback faster",
        type: "button"
      },
      css: '[data-testid="demo-ship-feedback"]',
      xpath: '//*[@data-testid="demo-ship-feedback"]',
      text: "Ship feedback faster"
    });
  });

  it("uses associated labels to derive textbox names", () => {
    const input = createLabeledInputTree();

    const bundle = generatePlaygroundLocatorBundle(input);

    expect(bundle.role).toEqual({
      name: "Share review link",
      type: "textbox"
    });
    expect(bundle.css).toBe('[id="playground-share-link"]');
    expect(bundle.xpath).toBe('//*[@id="playground-share-link"]');
  });
});

function createTree(
  tagName: string,
  attributes: Record<string, string>,
  textContent = ""
): FakeElement {
  const document = {} as FakeDocument;
  const element = createElement(document, tagName, attributes, textContent, []);
  document.body = element;
  return element;
}

function createLabeledInputTree(): FakeElement {
  const document = {} as FakeDocument;
  const label = createElement(
    document,
    "label",
    {
      for: "playground-share-link"
    },
    "Share review link",
    []
  );
  const input = createElement(
    document,
    "input",
    {
      id: "playground-share-link",
      type: "text",
      placeholder: "preview-url"
    },
    "",
    []
  );
  const wrapper = createElement(document, "div", {}, "", [label, input]);
  document.body = wrapper;
  return input;
}

function createElement(
  document: FakeDocument,
  tagName: string,
  attributes: Record<string, string>,
  textContent: string,
  children: FakeElement[]
): FakeElement {
  const element: FakeElement = {
    attributes,
    children,
    getAttribute(name: string) {
      return this.attributes[name] ?? null;
    },
    ownerDocument: document,
    parentElement: null,
    tagName,
    textContent
  };

  for (const child of children) {
    child.parentElement = element;
  }

  document.getElementById = (id: string) => findById(document.body, id);

  return element;
}

function findById(root: FakeElement | undefined, id: string): FakeElement | null {
  if (!root) {
    return null;
  }

  if (root.attributes.id === id) {
    return root;
  }

  for (const child of root.children) {
    const match = findById(child, id);

    if (match) {
      return match;
    }
  }

  return null;
}
