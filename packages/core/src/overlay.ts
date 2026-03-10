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

export interface ReviewOverlayOptions {
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
  appendChild(child: OverlayElementLike): unknown;
  contains(node: unknown): boolean;
  getBoundingClientRect(): DOMRect;
  remove(): void;
  setAttribute(name: string, value: string): void;
  style: Record<string, string>;
}

interface OverlayDocumentLike extends EventListenerTargetLike {
  body: OverlayElementLike | null;
  createElement(tagName: string): OverlayElementLike;
  documentElement: OverlayElementLike;
}

interface OverlayNodeLike {
  nodeType?: number;
  parentElement?: Element | null;
}

const overlayRootAttribute = "data-peril-overlay-root";
const overlayHighlightAttribute = "data-peril-overlay-highlight";

export function createReviewOverlay(
  options: ReviewOverlayOptions = {}
): ReviewOverlayController {
  const targetDocument = (options.document ?? globalThis.document) as unknown as OverlayDocumentLike;
  const targetWindow = (options.window ?? globalThis.window) as unknown as EventListenerTargetLike;

  if (!targetDocument) {
    throw new Error("createReviewOverlay requires a document.");
  }

  if (!targetWindow) {
    throw new Error("createReviewOverlay requires a window.");
  }

  const rootElement = targetDocument.createElement("div");
  const highlightElement = targetDocument.createElement("div");
  const mountTarget = targetDocument.body ?? targetDocument.documentElement;
  const zIndex = options.zIndex ?? 2147483647;
  let currentTarget: Element | null = null;
  let enabled = false;
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
    options.onSelect?.(buildSelection(selectedTarget));
  };

  const handleViewportChange = (): void => {
    renderHighlight();
  };

  targetDocument.addEventListener("pointermove", handlePointerMove, true);
  targetDocument.addEventListener("click", handleClick, true);
  targetWindow.addEventListener("scroll", handleViewportChange, true);
  targetWindow.addEventListener("resize", handleViewportChange);

  return {
    clearSelection(): void {
      selectionLocked = false;
      updateCurrentTarget(null);
    },
    destroy(): void {
      targetDocument.removeEventListener("pointermove", handlePointerMove, true);
      targetDocument.removeEventListener("click", handleClick, true);
      targetWindow.removeEventListener("scroll", handleViewportChange, true);
      targetWindow.removeEventListener("resize", handleViewportChange);
      currentTarget = null;
      selectionLocked = false;
      rootElement.remove();
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
        updateCurrentTarget(null);
        return;
      }

      renderHighlight();
    }
  };

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

    if (!selectionLocked) {
      options.onHover?.(currentTarget ? buildSelection(currentTarget) : null);
    }

    renderHighlight();
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
