const maxLocatorTextLength = 200;

export interface PlaygroundRoleLocator {
  type: string;
  name: string;
}

export interface PlaygroundLocatorBundle {
  testId?: string;
  role?: PlaygroundRoleLocator;
  css: string;
  xpath: string;
  text?: string;
}

export interface PlaygroundElementLike {
  children?: ArrayLike<PlaygroundElementLike>;
  getAttribute(name: string): string | null | undefined;
  ownerDocument?: PlaygroundDocumentLike | null;
  parentElement?: PlaygroundElementLike | null;
  tagName: string;
  textContent?: string | null;
}

export interface PlaygroundDocumentLike {
  body?: PlaygroundElementLike | null;
  documentElement?: PlaygroundElementLike | null;
  getElementById?(id: string): PlaygroundElementLike | null;
}

const buttonInputTypes = new Set(["button", "image", "reset", "submit"]);
const textInputTypes = new Set(["email", "password", "search", "tel", "text", "url"]);

export function generatePlaygroundLocatorBundle(
  element: PlaygroundElementLike,
  preferredTestIdAttribute = "data-testid"
): PlaygroundLocatorBundle {
  const testId = readAttribute(element, preferredTestIdAttribute);
  const role = getRoleLocator(element);
  const text = getVisibleText(element);
  const bundle: PlaygroundLocatorBundle = {
    css: generateCssSelector(element, preferredTestIdAttribute),
    xpath: generateXPathSelector(element, preferredTestIdAttribute)
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

function generateCssSelector(element: PlaygroundElementLike, testIdAttribute: string): string {
  const testId = readAttribute(element, testIdAttribute);

  if (testId) {
    return `[${testIdAttribute}="${escapeCssAttributeValue(testId)}"]`;
  }

  const id = readAttribute(element, "id");

  if (id) {
    return `[id="${escapeCssAttributeValue(id)}"]`;
  }

  const segments: string[] = [];
  let current: PlaygroundElementLike | null = element;

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
    current = current.parentElement ?? null;
  }

  return segments.join(" > ");
}

function buildCssPathSegment(element: PlaygroundElementLike): string {
  const tagName = getTagName(element);
  const attributes = getSemanticAttributeSelectors(element).join("");
  const siblingIndex = getSiblingIndex(element);
  const siblingCount = getSameTagSiblingCount(element);
  const positionSelector = siblingCount > 1 ? `:nth-of-type(${siblingIndex})` : "";

  return `${tagName}${attributes}${positionSelector}`;
}

function generateXPathSelector(element: PlaygroundElementLike, testIdAttribute: string): string {
  const testId = readAttribute(element, testIdAttribute);

  if (testId) {
    return `//*[@${testIdAttribute}=${toXPathLiteral(testId)}]`;
  }

  const id = readAttribute(element, "id");

  if (id) {
    return `//*[@id=${toXPathLiteral(id)}]`;
  }

  const segments: string[] = [];
  let current: PlaygroundElementLike | null = element;

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
    current = current.parentElement ?? null;
  }

  return `/${segments.join("/")}`;
}

function buildXPathPathSegment(element: PlaygroundElementLike): string {
  return `${getTagName(element)}[${getSiblingIndex(element)}]`;
}

function getRoleLocator(element: PlaygroundElementLike): PlaygroundRoleLocator | undefined {
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

function inferImplicitRole(element: PlaygroundElementLike): string | undefined {
  const tagName = getTagName(element);

  switch (tagName) {
    case "a":
      return readAttribute(element, "href") ? "link" : undefined;
    case "button":
      return "button";
    case "input":
      return inferInputRole(element);
    case "textarea":
      return "textbox";
    default:
      return undefined;
  }
}

function inferInputRole(element: PlaygroundElementLike): string | undefined {
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

function getAccessibleName(element: PlaygroundElementLike): string | undefined {
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

  if (getTagName(element) === "input" && buttonInputTypes.has((readAttribute(element, "type") ?? "").toLowerCase())) {
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

function getAssociatedLabelText(element: PlaygroundElementLike): string | undefined {
  const elementId = readAttribute(element, "id");
  const parent = element.parentElement;

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

function getTextByElementId(element: PlaygroundElementLike, id: string): string | undefined {
  if (!id) {
    return undefined;
  }

  const documentLike = element.ownerDocument;
  const target = documentLike?.getElementById?.(id) ?? findElementById(getDocumentRoot(element), id);

  if (!target) {
    return undefined;
  }

  return getVisibleText(target);
}

function getVisibleText(element: PlaygroundElementLike): string | undefined {
  const textContent = normalizeWhitespace(readTextContent(element));
  return textContent || undefined;
}

function readTextContent(element: PlaygroundElementLike): string {
  if (element.textContent !== undefined && element.textContent !== null) {
    return element.textContent;
  }

  return Array.from(element.children ?? []).map((child) => readTextContent(child)).join(" ");
}

function getSemanticAttributeSelectors(element: PlaygroundElementLike): string[] {
  const selectors: string[] = [];

  for (const attribute of ["name", "type", "role", "aria-label", "href", "src", "alt"]) {
    const value = readAttribute(element, attribute);

    if (value) {
      selectors.push(`[${attribute}="${escapeCssAttributeValue(value)}"]`);
    }
  }

  return selectors;
}

function getSiblingIndex(element: PlaygroundElementLike): number {
  const parent = element.parentElement;

  if (!parent) {
    return 1;
  }

  const tagName = getTagName(element);
  let index = 0;

  for (const sibling of Array.from(parent.children ?? [])) {
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

function getSameTagSiblingCount(element: PlaygroundElementLike): number {
  const parent = element.parentElement;

  if (!parent) {
    return 1;
  }

  const tagName = getTagName(element);

  return Array.from(parent.children ?? []).filter((sibling) => getTagName(sibling) === tagName).length;
}

function getDocumentRoot(element: PlaygroundElementLike): PlaygroundElementLike | null {
  return element.ownerDocument?.body ?? element.ownerDocument?.documentElement ?? null;
}

function findElementById(root: PlaygroundElementLike | null, id: string): PlaygroundElementLike | null {
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

function* walkElements(root: PlaygroundElementLike): Generator<PlaygroundElementLike> {
  yield root;

  for (const child of Array.from(root.children ?? [])) {
    yield* walkElements(child);
  }
}

function getTagName(element: PlaygroundElementLike): string {
  return element.tagName.toLowerCase();
}

function readAttribute(element: PlaygroundElementLike, name: string): string | undefined {
  const rawValue = element.getAttribute(name);

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
  return value.replace(/\\/g, "\\\\").replace(/"/g, "\\\"");
}

function toXPathLiteral(value: string): string {
  if (!value.includes("\"")) {
    return `"${value}"`;
  }

  if (!value.includes("'")) {
    return `'${value}'`;
  }

  return `concat(${value
    .split("\"")
    .map((part) => `"${part}"`)
    .join(', \'"\', ')})`;
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}
