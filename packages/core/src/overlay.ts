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

export interface ReviewKeyboardShortcut {
  altKey?: boolean;
  ctrlKey?: boolean;
  key?: string;
  metaKey?: boolean;
  shiftKey?: boolean;
}

export interface ReviewOverlayOptions {
  commentComposer?: ReviewCommentComposerOptions | false;
  document?: Document;
  keyboardShortcut?: ReviewKeyboardShortcut | false;
  onToggleRequest?: (enabled: boolean) => void;
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
  key?: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  repeat?: boolean;
  shiftKey?: boolean;
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
  contains(node: unknown): boolean;
  getBoundingClientRect(): DOMRect;
  remove(): void;
  setAttribute(name: string, value: string): void;
  style: Record<string, string>;
  textContent?: string | null;
  value?: string;
}

interface OverlayDocumentLike extends EventListenerTargetLike {
  body: OverlayElementLike | null;
  createElement(tagName: string): OverlayElementLike;
  documentElement: OverlayElementLike;
}

interface OverlayWindowLike extends EventListenerTargetLike {
  innerHeight?: number;
  innerWidth?: number;
}

interface OverlayNodeLike {
  nodeType?: number;
  parentElement?: Element | null;
}

const overlayRootAttribute = "data-peril-overlay-root";
const overlayHighlightAttribute = "data-peril-overlay-highlight";
const overlayComposerAttribute = "data-peril-overlay-composer";
const defaultComposerWidth = 320;
const defaultComposerHeight = 260;
const defaultComposerOffset = 12;
const defaultKeyboardShortcut: Required<ReviewKeyboardShortcut> = {
  altKey: false,
  ctrlKey: true,
  key: ".",
  metaKey: false,
  shiftKey: true
};

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

  const rootElement = targetDocument.createElement("div");
  const highlightElement = targetDocument.createElement("div");
  const composerElement = createComposerElement(targetDocument, options.commentComposer);
  const mountTarget = targetDocument.body ?? targetDocument.documentElement;
  const keyboardShortcut = getKeyboardShortcut(options.keyboardShortcut);
  const zIndex = options.zIndex ?? 2147483647;
  let currentTarget: Element | null = null;
  let enabled = false;
  let currentSelection: OverlaySelection | null = null;
  let selectionLocked = false;

  rootElement.setAttribute(overlayRootAttribute, "true");
  Object.assign(rootElement.style, {
    inset: "0",
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
    position: "fixed",
    top: "0px"
  });

  rootElement.appendChild(highlightElement);
  rootElement.appendChild(composerElement.root);
  mountTarget.appendChild(rootElement);

  const handlePointerMove = (event: OverlayEventLike): void => {
    if (!enabled || selectionLocked) {
      return;
    }

    updateCurrentTarget(getSelectableTarget(event.target));
  };

  const handleClick = (event: OverlayEventLike): void => {
    if (!enabled) {
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
    updateCurrentTarget(selectedTarget);
    currentSelection = buildSelection(selectedTarget);
    options.onSelect?.(currentSelection);
    composerElement.open(currentSelection);
  };

  const handleViewportChange = (): void => {
    renderHighlight();
    composerElement.reposition(currentSelection);
  };

  const handleKeyDown = (event: OverlayEventLike): void => {
    if (!keyboardShortcut || event.repeat || !matchesKeyboardShortcut(event, keyboardShortcut)) {
      return;
    }

    event.preventDefault?.();
    const nextEnabled = !enabled;

    if (options.onToggleRequest) {
      options.onToggleRequest(nextEnabled);
      return;
    }

    setEnabledState(nextEnabled);
  };

  targetDocument.addEventListener("pointermove", handlePointerMove, true);
  targetDocument.addEventListener("click", handleClick, true);
  targetDocument.addEventListener("keydown", handleKeyDown, true);
  targetWindow.addEventListener("scroll", handleViewportChange, true);
  targetWindow.addEventListener("resize", handleViewportChange);

  return {
    clearSelection(): void {
      selectionLocked = false;
      currentSelection = null;
      composerElement.close();
      updateCurrentTarget(null);
    },
    destroy(): void {
      targetDocument.removeEventListener("pointermove", handlePointerMove, true);
      targetDocument.removeEventListener("click", handleClick, true);
      targetDocument.removeEventListener("keydown", handleKeyDown, true);
      targetWindow.removeEventListener("scroll", handleViewportChange, true);
      targetWindow.removeEventListener("resize", handleViewportChange);
      currentTarget = null;
      currentSelection = null;
      selectionLocked = false;
      composerElement.destroy();
      rootElement.remove();
    },
    isEnabled(): boolean {
      return enabled;
    },
    setEnabled(nextEnabled: boolean): void {
      setEnabledState(nextEnabled);
    }
  };

  function setEnabledState(nextEnabled: boolean): void {
    if (enabled === nextEnabled) {
      return;
    }

    enabled = nextEnabled;

    if (!enabled) {
      selectionLocked = false;
      currentSelection = null;
      composerElement.close();
      updateCurrentTarget(null);
      return;
    }

    renderHighlight();
  }

  function buildSelection(element: Element): OverlaySelection {
    const rect = element.getBoundingClientRect();

    return {
      element,
      boundingBox: {
        height: rect.height,
        width: rect.width,
        x: rect.left,
        y: rect.top
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

    if (!isElementLike(elementCandidate) || rootElement.contains(elementCandidate)) {
      return null;
    }

    return elementCandidate;
  }

  function hideHighlight(): void {
    highlightElement.style.display = "none";
  }

  function renderHighlight(): void {
    if (!enabled || !currentTarget) {
      hideHighlight();
      return;
    }

    const rect = currentTarget.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      hideHighlight();
      return;
    }

    Object.assign(highlightElement.style, {
      display: "block",
      height: `${rect.height}px`,
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`
    });
  }

  function updateCurrentTarget(nextTarget: Element | null): void {
    if (currentTarget === nextTarget) {
      renderHighlight();
      return;
    }

    currentTarget = nextTarget;
    currentSelection = currentTarget ? buildSelection(currentTarget) : null;

    if (!selectionLocked) {
      options.onHover?.(currentSelection);
    }

    renderHighlight();
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
      updateCurrentTarget(null);
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
      updateCurrentTarget(null);
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

function getKeyboardShortcut(
  shortcut: ReviewKeyboardShortcut | false | undefined
): Required<ReviewKeyboardShortcut> | null {
  if (shortcut === false) {
    return null;
  }

  return {
    altKey: shortcut?.altKey ?? defaultKeyboardShortcut.altKey,
    ctrlKey: shortcut?.ctrlKey ?? defaultKeyboardShortcut.ctrlKey,
    key: normalizeShortcutKey(shortcut?.key ?? defaultKeyboardShortcut.key),
    metaKey: shortcut?.metaKey ?? defaultKeyboardShortcut.metaKey,
    shiftKey: shortcut?.shiftKey ?? defaultKeyboardShortcut.shiftKey
  };
}

function matchesKeyboardShortcut(
  event: OverlayEventLike,
  shortcut: Required<ReviewKeyboardShortcut>
): boolean {
  return (
    normalizeShortcutKey(event.key) === shortcut.key &&
    Boolean(event.altKey) === shortcut.altKey &&
    Boolean(event.ctrlKey) === shortcut.ctrlKey &&
    Boolean(event.metaKey) === shortcut.metaKey &&
    Boolean(event.shiftKey) === shortcut.shiftKey
  );
}

function normalizeShortcutKey(key: string | undefined): string {
  return (key ?? "").toLowerCase();
}
