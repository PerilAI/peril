import { maxLocatorTextLength } from "./limits";

export interface RoleLocator {
  type: string;
  name: string;
}

export interface LocatorBundle {
  testId?: string;
  role?: RoleLocator;
  css: string;
  xpath: string;
  text?: string;
}

export interface RankedLocator {
  kind: string;
  value: string;
}

export interface LocatorGenerationOptions {
  preferredTestIdAttribute?: string;
}

export const locatorPriority = ["testId", "role", "css", "xpath", "text"] as const;

interface LocatorDocumentLike {
  body?: LocatorElementLike | null;
  documentElement?: LocatorElementLike | null;
  getElementById?(id: string): Element | null;
}

interface LocatorElementLike {
  children?: ArrayLike<Element>;
  getAttribute(name: string): string | null | undefined;
  ownerDocument?: LocatorDocumentLike | null;
  parentElement?: Element | null;
  tagName: string;
  textContent?: string | null;
}

const buttonInputTypes = new Set(["button", "image", "reset", "submit"]);
const textInputTypes = new Set(["email", "password", "search", "tel", "text", "url"]);

function formatRoleLocator(role: RoleLocator): string {
  return `${role.type}[name="${role.name}"]`;
}

export function generateLocatorBundle(
  element: Element,
  options: LocatorGenerationOptions = {}
): LocatorBundle {
  const testIdAttribute = options.preferredTestIdAttribute ?? "data-testid";
  const testId = readAttribute(element, testIdAttribute);
  const role = getRoleLocator(element);
  const text = getVisibleText(element);
  const bundle: LocatorBundle = {
    css: generateCssSelector(element, testIdAttribute),
    xpath: generateXPathSelector(element, testIdAttribute)
  };

  if (testId) {
    bundle.testId = testId;
  }

  if (role) {
    bundle.role = role;
  }

  if (text) {
    bundle.text = truncate(text, maxLocatorTextLength);
  }

  return bundle;
}

export function getRankedLocators(bundle: LocatorBundle): RankedLocator[] {
  const rankedLocators: RankedLocator[] = [];

  if (bundle.testId) {
    rankedLocators.push({
      kind: "testId",
      value: bundle.testId
    });
  }

  if (bundle.role) {
    rankedLocators.push({
      kind: "role",
      value: formatRoleLocator(bundle.role)
    });
  }

  rankedLocators.push({
    kind: "css",
    value: bundle.css
  });

  rankedLocators.push({
    kind: "xpath",
    value: bundle.xpath
  });

  if (bundle.text) {
    rankedLocators.push({
      kind: "text",
      value: bundle.text
    });
  }

  return rankedLocators;
}

export function getBestLocatorSummary(bundle: LocatorBundle): string {
  const [preferredLocator] = getRankedLocators(bundle);
  return preferredLocator?.value ?? bundle.css;
}

function generateCssSelector(element: Element, testIdAttribute: string): string {
  const testId = readAttribute(element, testIdAttribute);

  if (testId) {
    return `[${testIdAttribute}="${escapeCssAttributeValue(testId)}"]`;
  }

  const id = readAttribute(element, "id");

  if (id) {
    return `[id="${escapeCssAttributeValue(id)}"]`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current) {
    const currentTestId = readAttribute(current, testIdAttribute);

    if (currentTestId) {
      segments.unshift(`[${testIdAttribute}="${escapeCssAttributeValue(currentTestId)}"]`);
      break;
    }

    const currentId = readAttribute(current, "id");

    if (currentId) {
      segments.unshift(`[id="${escapeCssAttributeValue(currentId)}"]`);
      break;
    }

    segments.unshift(buildCssPathSegment(current));
    current = asLocatorElement(current).parentElement ?? null;
  }

  return segments.join(" > ");
}

function buildCssPathSegment(element: Element): string {
  const tagName = getTagName(element);
  const attributes = getSemanticAttributeSelectors(element).join("");
  const siblingIndex = getSiblingIndex(element);
  const siblingCount = getSameTagSiblingCount(element);
  const positionSelector = siblingCount > 1 ? `:nth-of-type(${siblingIndex})` : "";

  return `${tagName}${attributes}${positionSelector}`;
}

function generateXPathSelector(element: Element, testIdAttribute: string): string {
  const testId = readAttribute(element, testIdAttribute);

  if (testId) {
    return `//*[@${testIdAttribute}=${toXPathLiteral(testId)}]`;
  }

  const id = readAttribute(element, "id");

  if (id) {
    return `//*[@id=${toXPathLiteral(id)}]`;
  }

  const segments: string[] = [];
  let current: Element | null = element;

  while (current) {
    const currentTestId = readAttribute(current, testIdAttribute);

    if (currentTestId) {
      return `//*[@${testIdAttribute}=${toXPathLiteral(currentTestId)}]/${segments.join("/")}`;
    }

    const currentId = readAttribute(current, "id");

    if (currentId) {
      return `//*[@id=${toXPathLiteral(currentId)}]/${segments.join("/")}`;
    }

    segments.unshift(buildXPathPathSegment(current));
    current = asLocatorElement(current).parentElement ?? null;
  }

  return `/${segments.join("/")}`;
}

function buildXPathPathSegment(element: Element): string {
  const tagName = getTagName(element);
  return `${tagName}[${getSiblingIndex(element)}]`;
}

function getRoleLocator(element: Element): RoleLocator | undefined {
  const type = readAttribute(element, "role") ?? inferImplicitRole(element);
  const name = getAccessibleName(element);

  if (!type || !name) {
    return undefined;
  }

  return {
    name,
    type
  };
}

function inferImplicitRole(element: Element): string | undefined {
  const tagName = getTagName(element);

  switch (tagName) {
    case "a":
      return readAttribute(element, "href") ? "link" : undefined;
    case "button":
      return "button";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return "heading";
    case "img":
      return "img";
    case "li":
      return "listitem";
    case "option":
      return "option";
    case "select":
      return "combobox";
    case "textarea":
      return "textbox";
    case "input":
      return inferInputRole(element);
    default:
      return undefined;
  }
}

function inferInputRole(element: Element): string | undefined {
  const type = (readAttribute(element, "type") ?? "text").toLowerCase();

  if (buttonInputTypes.has(type)) {
    return "button";
  }

  switch (type) {
    case "checkbox":
      return "checkbox";
    case "number":
      return "spinbutton";
    case "radio":
      return "radio";
    case "range":
      return "slider";
    default:
      return textInputTypes.has(type) ? "textbox" : undefined;
  }
}

function getAccessibleName(element: Element): string | undefined {
  const labelledBy = readAttribute(element, "aria-labelledby");

  if (labelledBy) {
    const nameFromIds = labelledBy
      .split(/\s+/)
      .map((id) => getTextByElementId(element, id))
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .trim();

    if (nameFromIds) {
      return nameFromIds;
    }
  }

  const ariaLabel = readAttribute(element, "aria-label");

  if (ariaLabel) {
    return ariaLabel;
  }

  const associatedLabel = getAssociatedLabelText(element);

  if (associatedLabel) {
    return associatedLabel;
  }

  const tagName = getTagName(element);

  if (tagName === "img") {
    const alt = readAttribute(element, "alt");

    if (alt) {
      return alt;
    }
  }

  if (tagName === "input" && buttonInputTypes.has((readAttribute(element, "type") ?? "").toLowerCase())) {
    const value = readAttribute(element, "value");

    if (value) {
      return value;
    }
  }

  const text = getVisibleText(element);

  if (text) {
    return text;
  }

  return readAttribute(element, "title") ?? readAttribute(element, "name");
}

function getAssociatedLabelText(element: Element): string | undefined {
  const elementId = readAttribute(element, "id");
  const parent = asLocatorElement(element).parentElement;

  if (parent && getTagName(parent) === "label") {
    const parentLabelText = getVisibleText(parent);

    if (parentLabelText) {
      return parentLabelText;
    }
  }

  if (!elementId) {
    return undefined;
  }

  const root = getDocumentRoot(element);

  if (!root) {
    return undefined;
  }

  for (const candidate of walkElements(root)) {
    if (getTagName(candidate) !== "label") {
      continue;
    }

    if (readAttribute(candidate, "for") !== elementId) {
      continue;
    }

    const labelText = getVisibleText(candidate);

    if (labelText) {
      return labelText;
    }
  }

  return undefined;
}

function getTextByElementId(element: Element, id: string): string | undefined {
  if (!id) {
    return undefined;
  }

  const documentLike = asLocatorElement(element).ownerDocument;
  const target = documentLike?.getElementById?.(id) ?? findElementById(getDocumentRoot(element), id);

  if (!target) {
    return undefined;
  }

  return getVisibleText(target);
}

function getVisibleText(element: Element): string | undefined {
  const textContent = normalizeWhitespace(readTextContent(element));
  return textContent || undefined;
}

function readTextContent(element: Element): string {
  const elementLike = asLocatorElement(element);

  if (elementLike.textContent !== undefined && elementLike.textContent !== null) {
    return elementLike.textContent;
  }

  const children = Array.from(elementLike.children ?? []);
  return children.map((child) => readTextContent(child)).join(" ");
}

function getSemanticAttributeSelectors(element: Element): string[] {
  const selectors: string[] = [];

  for (const attribute of ["name", "type", "role", "aria-label", "href", "src", "alt"]) {
    const value = readAttribute(element, attribute);

    if (value) {
      selectors.push(`[${attribute}="${escapeCssAttributeValue(value)}"]`);
    }
  }

  return selectors;
}

function getSiblingIndex(element: Element): number {
  const parent = asLocatorElement(element).parentElement;

  if (!parent) {
    return 1;
  }

  const tagName = getTagName(element);
  let index = 0;

  for (const sibling of Array.from(asLocatorElement(parent).children ?? [])) {
    if (getTagName(sibling) !== tagName) {
      continue;
    }

    index += 1;

    if (sibling === element) {
      return index;
    }
  }

  return 1;
}

function getSameTagSiblingCount(element: Element): number {
  const parent = asLocatorElement(element).parentElement;

  if (!parent) {
    return 1;
  }

  const tagName = getTagName(element);

  return Array.from(asLocatorElement(parent).children ?? []).filter(
    (sibling) => getTagName(sibling) === tagName
  ).length;
}

function getDocumentRoot(element: Element): Element | null {
  const documentLike = asLocatorElement(element).ownerDocument;

  return (documentLike?.body ?? documentLike?.documentElement ?? null) as Element | null;
}

function findElementById(root: Element | null, id: string): Element | null {
  if (!root) {
    return null;
  }

  for (const candidate of walkElements(root)) {
    if (readAttribute(candidate, "id") === id) {
      return candidate;
    }
  }

  return null;
}

function* walkElements(root: Element): Generator<Element> {
  yield root;

  for (const child of Array.from(asLocatorElement(root).children ?? [])) {
    yield* walkElements(child);
  }
}

function getTagName(element: Element): string {
  return asLocatorElement(element).tagName.toLowerCase();
}

function asLocatorElement(element: Element): LocatorElementLike {
  return element as unknown as LocatorElementLike;
}

function readAttribute(element: Element, name: string): string | undefined {
  const rawValue = asLocatorElement(element).getAttribute(name);

  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }

  const normalizedValue = rawValue.trim();
  return normalizedValue ? normalizedValue : undefined;
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function escapeCssAttributeValue(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"");
}

function toXPathLiteral(value: string): string {
  if (!value.includes("\"")) {
    return `"${value}"`;
  }

  if (!value.includes("'")) {
    return `'${value}'`;
  }

  const parts = value.split("\"");
  return `concat(${parts.map((part, index) => {
    const quotedPart = `"${part}"`;
    return index < parts.length - 1 ? `${quotedPart}, '"', ` : quotedPart;
  }).join("")})`;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}
