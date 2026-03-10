import type { ReviewCategory, ReviewComment, Severity } from "./review";

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OverlaySelection {
  element: Element;
  boundingBox: BoundingBox;
}

export interface ReviewCommentSubmission {
  comment: ReviewComment;
  selection: OverlaySelection;
}

export interface ReviewCommentComposerDefaults {
  category?: ReviewCategory;
  expected?: string;
  severity?: Severity;
  text?: string;
}

export interface ReviewCommentComposerOptions {
  defaults?: ReviewCommentComposerDefaults;
  onCancel?: (selection: OverlaySelection) => void;
  onSubmit?: (submission: ReviewCommentSubmission) => void;
}

export interface ReviewOverlayOptions {
  commentComposer?: ReviewCommentComposerOptions | false;
  document?: Document;
  window?: Window;
  zIndex?: number;
  onHover?: (selection: OverlaySelection | null) => void;
  onSelect?: (selection: OverlaySelection) => void;
}

export interface ReviewOverlayController {
  clearSelection(): void;
  destroy(): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

interface EventListenerTargetLike {
  addEventListener(
    type: string,
    listener: (event: OverlayEventLike) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: (event: OverlayEventLike) => void,
    options?: boolean | EventListenerOptions
  ): void;
}

interface OverlayEventLike {
  target?: unknown;
  preventDefault?: () => void;
  stopImmediatePropagation?: () => void;
  stopPropagation?: () => void;
}

interface OverlayElementLike {
  addEventListener(
    type: string,
    listener: (event: OverlayEventLike) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  appendChild(child: OverlayElementLike): unknown;
  children?: ArrayLike<unknown>;
  contains(node: unknown): boolean;
  getBoundingClientRect(): DOMRect;
  getAttribute?(name: string): string | null | undefined;
  ownerDocument?: OverlayDocumentLike | null;
  remove(): void;
  setAttribute(name: string, value: string): void;
  style: Record<string, string>;
  tagName?: string;
  textContent?: string | null;
  value?: string;
}

interface OverlayDocumentLike extends EventListenerTargetLike {
  body: OverlayElementLike | null;
  createElement(tagName: string): OverlayElementLike;
  defaultView?: OverlayWindowLike | null;
  documentElement: OverlayElementLike;
}

interface OverlayWindowLike extends EventListenerTargetLike {
  frameElement?: OverlayIframeElementLike | null;
  innerHeight?: number;
  innerWidth?: number;
}

interface OverlayNodeLike {
  nodeType?: number;
  parentElement?: Element | null;
}

interface OverlayIframeElementLike extends OverlayElementLike {
  contentDocument?: OverlayDocumentLike | null;
  contentWindow?: OverlayWindowLike | null;
}

interface OverlayDocumentContext {
  document: OverlayDocumentLike;
  frameElement: OverlayIframeElementLike | null;
  handleClick: (event: OverlayEventLike) => void;
  handlePointerMove: (event: OverlayEventLike) => void;
  handleViewportChange: () => void;
  highlightElement: OverlayElementLike;
  rootElement: OverlayElementLike;
  window: OverlayWindowLike;
}

const overlayRootAttribute = "data-peril-overlay-root";
const overlayHighlightAttribute = "data-peril-overlay-highlight";
const overlayComposerAttribute = "data-peril-overlay-composer";
const defaultComposerWidth = 320;
const defaultComposerHeight = 260;
const defaultComposerOffset = 12;

export function createReviewOverlay(
  options: ReviewOverlayOptions = {}
): ReviewOverlayController {
  const targetDocument = (options.document ?? globalThis.document) as unknown as OverlayDocumentLike;
  const targetWindow = (options.window ?? globalThis.window) as unknown as OverlayWindowLike;

  if (!targetDocument) {
    throw new Error("createReviewOverlay requires a document.");
  }

  if (!targetWindow) {
    throw new Error("createReviewOverlay requires a window.");
  }

  const composerElement = createComposerElement(targetDocument, options.commentComposer);
  const zIndex = options.zIndex ?? 2147483647;
  const contexts = new Map<OverlayDocumentLike, OverlayDocumentContext>();
  let currentTarget: Element | null = null;
  let currentContext: OverlayDocumentContext | null = null;
  let enabled = false;
  let currentSelection: OverlaySelection | null = null;
  let selectionLocked = false;

  syncDocumentContexts();

  return {
    clearSelection(): void {
      selectionLocked = false;
      currentSelection = null;
      composerElement.close();
      updateCurrentTarget(null, null);
    },
    destroy(): void {
      destroyDocumentContexts();
      currentTarget = null;
      currentContext = null;
      currentSelection = null;
      selectionLocked = false;
      composerElement.destroy();
    },
    isEnabled(): boolean {
      return enabled;
    },
    setEnabled(nextEnabled: boolean): void {
      if (enabled === nextEnabled) {
        return;
      }

      enabled = nextEnabled;

      if (!enabled) {
        selectionLocked = false;
        currentSelection = null;
        composerElement.close();
        updateCurrentTarget(null, null);
        return;
      }

      syncDocumentContexts();
      renderHighlight();
    }
  };

  function buildSelection(
    context: OverlayDocumentContext,
    element: Element
  ): OverlaySelection {
    const rect = element.getBoundingClientRect();
    const offset = getFrameOffset(context);

    return {
      element,
      boundingBox: {
        height: rect.height,
        width: rect.width,
        x: rect.left + offset.x,
        y: rect.top + offset.y
      }
    };
  }

  function getSelectableTarget(candidate: unknown): Element | null {
    if (!candidate || typeof candidate !== "object") {
      return null;
    }

    const nodeCandidate = candidate as OverlayNodeLike;
    const elementCandidate = nodeCandidate.nodeType === 3
      ? nodeCandidate.parentElement
      : candidate;

    if (!isElementLike(elementCandidate) || hasOverlayAncestor(elementCandidate)) {
      return null;
    }

    return elementCandidate;
  }

  function hideHighlight(highlight: OverlayElementLike): void {
    highlight.style.display = "none";
    highlight.style.opacity = "0";
  }

  function renderHighlight(): void {
    for (const context of contexts.values()) {
      hideHighlight(context.highlightElement);
    }

    if (!enabled || !currentTarget || !currentContext) {
      return;
    }

    const rect = currentTarget.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      hideHighlight(currentContext.highlightElement);
      return;
    }

    Object.assign(currentContext.highlightElement.style, {
      display: "block",
      height: `${rect.height}px`,
      left: `${rect.left}px`,
      opacity: "1",
      top: `${rect.top}px`,
      width: `${rect.width}px`
    });
  }

  function updateCurrentTarget(
    nextContext: OverlayDocumentContext | null,
    nextTarget: Element | null
  ): void {
    if (currentContext === nextContext && currentTarget === nextTarget) {
      currentSelection =
        currentContext && currentTarget ? buildSelection(currentContext, currentTarget) : null;
      renderHighlight();
      return;
    }

    currentContext = nextContext;
    currentTarget = nextTarget;
    currentSelection =
      currentContext && currentTarget ? buildSelection(currentContext, currentTarget) : null;

    if (!selectionLocked) {
      options.onHover?.(currentSelection);
    }

    renderHighlight();
  }

  function syncDocumentContexts(): void {
    const nextDocuments = collectChildDocuments(targetDocument);
    const activeDocuments = new Set<OverlayDocumentLike>([targetDocument]);

    for (const frameContext of nextDocuments) {
      activeDocuments.add(frameContext.document);

      if (contexts.has(frameContext.document)) {
        continue;
      }

      contexts.set(
        frameContext.document,
        createDocumentContext(
          frameContext.document,
          frameContext.window,
          frameContext.frameElement,
          false
        )
      );
    }

    if (!contexts.has(targetDocument)) {
      contexts.set(targetDocument, createDocumentContext(targetDocument, targetWindow, null, true));
    }

    for (const [document, context] of Array.from(contexts.entries())) {
      if (activeDocuments.has(document)) {
        continue;
      }

      if (currentContext === context) {
        selectionLocked = false;
        currentSelection = null;
        currentTarget = null;
        currentContext = null;
        composerElement.close();
      }

      context.rootElement.remove();
      contexts.delete(document);
    }
  }

  function destroyDocumentContexts(): void {
    for (const context of contexts.values()) {
      context.document.removeEventListener("pointermove", context.handlePointerMove, true);
      context.document.removeEventListener("click", context.handleClick, true);
      context.window.removeEventListener("scroll", context.handleViewportChange, true);
      context.window.removeEventListener("resize", context.handleViewportChange);
      context.rootElement.remove();
    }

    contexts.clear();
  }

  function createDocumentContext(
    document: OverlayDocumentLike,
    window: OverlayWindowLike,
    frameElement: OverlayIframeElementLike | null,
    includeComposer: boolean
  ): OverlayDocumentContext {
    const rootElement = document.createElement("div");
    const highlightElement = document.createElement("div");
    const mountTarget = document.documentElement ?? document.body;

    rootElement.setAttribute(overlayRootAttribute, "true");
    Object.assign(rootElement.style, {
      contain: "layout style",
      inset: "0",
      isolation: "isolate",
      overflow: "visible",
      pointerEvents: "none",
      position: "fixed",
      zIndex: String(zIndex)
    });

    highlightElement.setAttribute(overlayHighlightAttribute, "true");
    Object.assign(highlightElement.style, {
      background: "rgba(14, 165, 233, 0.14)",
      border: "2px solid #0284c7",
      borderRadius: "4px",
      boxSizing: "border-box",
      display: "none",
      left: "0px",
      opacity: "0",
      position: "fixed",
      top: "0px",
      transition: "left 120ms ease-out, top 120ms ease-out, width 120ms ease-out, height 120ms ease-out, opacity 120ms ease-out",
      willChange: "left, top, width, height, opacity"
    });

    rootElement.appendChild(highlightElement);

    if (includeComposer) {
      rootElement.appendChild(composerElement.root);
    }

    mountTarget.appendChild(rootElement);

    const context = {
      document,
      frameElement,
      handleClick(event: OverlayEventLike): void {
        if (!enabled) {
          return;
        }

        if (!frameElement) {
          syncDocumentContexts();
        }

        if (isWithinOverlayTarget(event.target)) {
          return;
        }

        const selectedTarget = getSelectableTarget(event.target);

        if (!selectedTarget) {
          return;
        }

        event.preventDefault?.();
        event.stopPropagation?.();
        event.stopImmediatePropagation?.();

        selectionLocked = true;
        updateCurrentTarget(context, selectedTarget);

        if (!currentSelection) {
          return;
        }

        options.onSelect?.(currentSelection);
        composerElement.open(currentSelection);
      },
      handlePointerMove(event: OverlayEventLike): void {
        if (!enabled || selectionLocked) {
          return;
        }

        if (!frameElement) {
          syncDocumentContexts();
        }

        if (isWithinOverlayTarget(event.target)) {
          return;
        }

        const nextTarget = getSelectableTarget(event.target);
        updateCurrentTarget(nextTarget ? context : null, nextTarget);
      },
      handleViewportChange(): void {
        syncDocumentContexts();
        currentSelection =
          currentContext && currentTarget ? buildSelection(currentContext, currentTarget) : null;
        renderHighlight();
        composerElement.reposition(currentSelection);
      },
      highlightElement,
      rootElement,
      window
    };

    document.addEventListener("pointermove", context.handlePointerMove, true);
    document.addEventListener("click", context.handleClick, true);
    window.addEventListener("scroll", context.handleViewportChange, true);
    window.addEventListener("resize", context.handleViewportChange);

    return context;
  }

  function getFrameOffset(context: OverlayDocumentContext): Pick<BoundingBox, "x" | "y"> {
    let currentFrame = context.frameElement;
    let x = 0;
    let y = 0;

    while (currentFrame) {
      const rect = currentFrame.getBoundingClientRect();
      x += rect.left;
      y += rect.top;

      const parentContext = contexts.get(currentFrame.ownerDocument ?? targetDocument);
      currentFrame = parentContext?.frameElement ?? null;
    }

    return {
      x,
      y
    };
  }

  function collectChildDocuments(document: OverlayDocumentLike): Array<{
    document: OverlayDocumentLike;
    frameElement: OverlayIframeElementLike;
    window: OverlayWindowLike;
  }> {
    const iframeElements = collectIframeElements(document.documentElement);
    const childDocuments: Array<{
      document: OverlayDocumentLike;
      frameElement: OverlayIframeElementLike;
      window: OverlayWindowLike;
    }> = [];

    for (const iframeElement of iframeElements) {
      const childDocument = iframeElement.contentDocument;
      const childWindow = iframeElement.contentWindow ?? childDocument?.defaultView ?? null;

      if (!childDocument || !childWindow) {
        continue;
      }

      childDocuments.push({
        document: childDocument,
        frameElement: iframeElement,
        window: childWindow
      });
      childDocuments.push(...collectChildDocuments(childDocument));
    }

    return childDocuments;
  }

  function collectIframeElements(root: OverlayElementLike): OverlayIframeElementLike[] {
    const iframeElements: OverlayIframeElementLike[] = [];

    for (const child of getChildElements(root)) {
      if (isIframeElementLike(child)) {
        iframeElements.push(child);
      }

      iframeElements.push(...collectIframeElements(child));
    }

    return iframeElements;
  }

  function createComposerElement(
    document: OverlayDocumentLike,
    composerOptions: ReviewCommentComposerOptions | false | undefined
  ) {
    const composerSettings = composerOptions === false ? undefined : composerOptions;
    const root = document.createElement("form");
    const title = document.createElement("strong");
    const textField = document.createElement("textarea");
    const categoryField = document.createElement("select");
    const severityField = document.createElement("select");
    const expectedField = document.createElement("input");
    const actions = document.createElement("div");
    const cancelButton = document.createElement("button");
    const submitButton = document.createElement("button");
    let selection: OverlaySelection | null = null;

    root.setAttribute(overlayComposerAttribute, "true");
    Object.assign(root.style, {
      background: "#ffffff",
      border: "1px solid rgba(2, 132, 199, 0.35)",
      borderRadius: "10px",
      boxShadow: "0 18px 40px rgba(15, 23, 42, 0.22)",
      color: "#0f172a",
      display: "none",
      gap: "10px",
      left: `${defaultComposerOffset}px`,
      maxWidth: `${defaultComposerWidth}px`,
      padding: "14px",
      pointerEvents: "auto",
      position: "fixed",
      top: `${defaultComposerOffset}px`,
      width: `${defaultComposerWidth}px`
    });

    title.textContent = "Add review";
    Object.assign(title.style, {
      display: "block",
      fontSize: "14px"
    });

    configureField(textField, {
      name: "text",
      placeholder: "What is wrong with this UI?",
      rows: "4",
      tag: "textarea",
      value: composerSettings?.defaults?.text
    });
    configureSelect(categoryField, "category", ["bug", "polish", "accessibility", "copy", "ux"]);
    categoryField.value = composerSettings?.defaults?.category ?? "bug";

    configureSelect(severityField, "severity", ["low", "medium", "high", "critical"]);
    severityField.value = composerSettings?.defaults?.severity ?? "medium";

    configureField(expectedField, {
      name: "expected",
      placeholder: "What should happen instead?",
      tag: "input",
      value: composerSettings?.defaults?.expected
    });

    Object.assign(actions.style, {
      display: "flex",
      gap: "8px",
      justifyContent: "flex-end"
    });

    configureButton(cancelButton, "button", "Cancel");
    configureButton(submitButton, "submit", "Save review");
    Object.assign(submitButton.style, {
      background: "#0284c7",
      color: "#ffffff"
    });

    actions.appendChild(cancelButton);
    actions.appendChild(submitButton);
    root.appendChild(title);
    root.appendChild(textField);
    root.appendChild(categoryField);
    root.appendChild(severityField);
    root.appendChild(expectedField);
    root.appendChild(actions);

    cancelButton.addEventListener("click", (event) => {
      event.preventDefault?.();

      if (!selection) {
        return;
      }

      composerSettings?.onCancel?.(selection);
      selectionLocked = false;
      currentSelection = null;
      close();
      updateCurrentTarget(null, null);
    });

    root.addEventListener("submit", (event) => {
      event.preventDefault?.();

      if (!selection) {
        return;
      }

      composerSettings?.onSubmit?.({
        comment: {
          category: (categoryField.value ?? "bug") as ReviewCategory,
          expected: expectedField.value ?? "",
          severity: (severityField.value ?? "medium") as Severity,
          text: textField.value ?? ""
        },
        selection
      });

      selectionLocked = false;
      currentSelection = null;
      close();
      updateCurrentTarget(null, null);
    });

    return {
      close,
      destroy(): void {
        close();
      },
      root,
      open(nextSelection: OverlaySelection): void {
        if (!composerSettings) {
          return;
        }

        selection = nextSelection;
        root.style.display = "grid";
        reposition(nextSelection);
      },
      reposition
    };

    function close(): void {
      selection = null;
      root.style.display = "none";
    }

    function reposition(nextSelection: OverlaySelection | null): void {
      if (!nextSelection || root.style.display === "none") {
        return;
      }

      const viewportWidth = targetWindow.innerWidth ?? 1280;
      const viewportHeight = targetWindow.innerHeight ?? 720;
      const left = clamp(
        nextSelection.boundingBox.x,
        defaultComposerOffset,
        viewportWidth - defaultComposerWidth - defaultComposerOffset
      );
      const belowTop = nextSelection.boundingBox.y + nextSelection.boundingBox.height + defaultComposerOffset;
      const top =
        belowTop + defaultComposerHeight <= viewportHeight - defaultComposerOffset
          ? belowTop
          : clamp(
              nextSelection.boundingBox.y - defaultComposerHeight - defaultComposerOffset,
              defaultComposerOffset,
              viewportHeight - defaultComposerHeight - defaultComposerOffset
            );

      root.style.left = `${left}px`;
      root.style.top = `${top}px`;
    }
  }
}

function isElementLike(candidate: unknown): candidate is Element {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as Element).contains === "function" &&
    typeof (candidate as Element).getBoundingClientRect === "function"
  );
}

function isIframeElementLike(candidate: unknown): candidate is OverlayIframeElementLike {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as OverlayElementLike).appendChild === "function" &&
    typeof (candidate as OverlayElementLike).tagName === "string" &&
    (candidate as OverlayElementLike).tagName?.toLowerCase() === "iframe"
  );
}

function getChildElements(root: OverlayElementLike): OverlayElementLike[] {
  const children = root.children ?? [];
  const childElements: OverlayElementLike[] = [];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];

    if (isOverlayElementLike(child)) {
      childElements.push(child);
    }
  }

  return childElements;
}

function hasOverlayAncestor(element: Element): boolean {
  let current: OverlayNodeLike | null = element as OverlayNodeLike;

  while (current) {
    if (
      isOverlayElementLike(current) &&
      current.getAttribute?.(overlayRootAttribute) === "true"
    ) {
      return true;
    }

    current = current.parentElement ?? null;
  }

  return false;
}

function isWithinOverlayTarget(candidate: unknown): boolean {
  return isElementLike(candidate) && hasOverlayAncestor(candidate);
}

function isOverlayElementLike(candidate: unknown): candidate is OverlayElementLike {
  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof (candidate as OverlayElementLike).appendChild === "function" &&
    typeof (candidate as OverlayElementLike).contains === "function" &&
    typeof (candidate as OverlayElementLike).getBoundingClientRect === "function"
  );
}

function configureField(
  field: OverlayElementLike,
  options: {
    name: string;
    placeholder: string;
    rows?: string;
    tag: "input" | "textarea";
    value?: string | undefined;
  }
): void {
  field.setAttribute("name", options.name);
  field.setAttribute("placeholder", options.placeholder);

  if (options.rows) {
    field.setAttribute("rows", options.rows);
  }

  field.value = options.value ?? "";
  Object.assign(field.style, {
    border: "1px solid rgba(148, 163, 184, 0.8)",
    borderRadius: "8px",
    boxSizing: "border-box",
    font: "inherit",
    minHeight: options.tag === "textarea" ? "96px" : "40px",
    padding: "10px",
    width: "100%"
  });
}

function configureSelect(
  field: OverlayElementLike,
  name: string,
  values: string[]
): void {
  field.setAttribute("name", name);
  Object.assign(field.style, {
    border: "1px solid rgba(148, 163, 184, 0.8)",
    borderRadius: "8px",
    boxSizing: "border-box",
    font: "inherit",
    minHeight: "40px",
    padding: "10px",
    width: "100%"
  });

  for (const value of values) {
    const option = (field as { ownerDocument?: OverlayDocumentLike }).ownerDocument?.createElement("option");

    if (!option) {
      continue;
    }

    option.setAttribute("value", value);
    option.textContent = value;
    field.appendChild(option);
  }
}

function configureButton(field: OverlayElementLike, type: string, label: string): void {
  field.setAttribute("type", type);
  field.textContent = label;
  Object.assign(field.style, {
    border: "none",
    borderRadius: "999px",
    cursor: "pointer",
    font: "inherit",
    minHeight: "36px",
    padding: "0 14px"
  });
}

function clamp(value: number, min: number, max: number): number {
  if (max < min) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}
