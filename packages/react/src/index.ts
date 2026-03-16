import {
  createContext,
  createElement,
  useEffect,
  useContext,
  useRef,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction
} from "react";
import { createPortal } from "react-dom";

import {
  captureElementScreenshot,
  capturePageScreenshot,
  createReviewOverlay,
  generateLocatorBundle,
  getBestLocatorSummary,
  getRankedLocators,
  locatorPriority,
  type OverlaySelection,
  type Review,
  type ReviewCommentComposerOptions,
  type ReviewCommentSubmission,
  type ReviewKeyboardShortcut,
  type ReviewMetadata,
  type ReviewOverlayController,
  type ReviewOverlayOptions,
  submitReview,
  type SubmitReviewOptions
} from "@peril-ai/core";

export { getBestLocatorSummary, getRankedLocators, locatorPriority } from "@peril-ai/core";

export interface ReviewModeContextValue {
  enabled: boolean;
  serverUrl: string | undefined;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}

export interface ReviewProviderProps {
  children: ReactNode;
  commentComposer?: ReviewCommentComposerOptions | false;
  document?: Document;
  initialEnabled?: boolean;
  keyboardShortcut?: ReviewKeyboardShortcut | false;
  onHover?: (selection: OverlaySelection | null) => void;
  onSelect?: (selection: OverlaySelection) => void;
  onReviewCreated?: (review: Review) => void;
  onReviewError?: (error: unknown, submission: ReviewCommentSubmission) => void;
  onToggleRequest?: (enabled: boolean) => void;
  reviewerName?: string;
  serverUrl?: string;
  showToggle?: boolean;
  submitOptions?: Omit<SubmitReviewOptions, "endpoint">;
  window?: Window;
  zIndex?: number;
}

const ReviewModeContext = createContext<ReviewModeContextValue | null>(null);

export function ReviewProvider({
  children,
  commentComposer,
  document,
  initialEnabled = false,
  keyboardShortcut,
  onHover,
  onSelect,
  onReviewCreated,
  onReviewError,
  onToggleRequest,
  reviewerName,
  serverUrl,
  showToggle = false,
  submitOptions,
  window,
  zIndex
}: ReviewProviderProps): ReactElement {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [portalReady, setPortalReady] = useState(false);
  const targetDocument = document ?? globalThis.document;
  const targetWindow = window ?? globalThis.window;
  const portalTarget = portalReady ? targetDocument?.body ?? targetDocument?.documentElement : null;
  const contextValue: ReviewModeContextValue = {
    enabled,
    setEnabled,
    serverUrl
  };

  const bridgeProps: ReviewOverlayBridgeProps = {
    commentComposer,
    document: targetDocument,
    enabled,
    onHover,
    onReviewCreated,
    onReviewError,
    onSelect,
    onToggleRequest: onToggleRequest ?? setEnabled,
    reviewerName,
    serverUrl,
    submitOptions,
    window: targetWindow,
    ...(keyboardShortcut === undefined ? {} : { keyboardShortcut }),
    ...(zIndex === undefined ? {} : { zIndex })
  };

  useEffect(() => {
    if (targetDocument?.body ?? targetDocument?.documentElement) {
      setPortalReady(true);
    }
  }, [targetDocument]);

  return createElement(
    ReviewModeContext.Provider,
    {
      value: contextValue
    },
    children,
      portalTarget
      ? createPortal(
          createElement(ReviewOverlayBridge, bridgeProps),
          portalTarget
        )
      : null,
      portalTarget && showToggle
      ? createPortal(
          createElement(ReviewToggleButton, { enabled, setEnabled }),
          portalTarget
        )
      : null
  );
}

export function useReviewMode(): ReviewModeContextValue {
  const context = useContext(ReviewModeContext);

  if (!context) {
    throw new Error("useReviewMode must be used within a ReviewProvider.");
  }

  return context;
}

interface ReviewOverlayBridgeProps {
  commentComposer: ReviewCommentComposerOptions | false | undefined;
  document: Document | undefined;
  enabled: boolean;
  keyboardShortcut?: ReviewKeyboardShortcut | false;
  onHover: ((selection: OverlaySelection | null) => void) | undefined;
  onReviewCreated: ((review: Review) => void) | undefined;
  onReviewError: ((error: unknown, submission: ReviewCommentSubmission) => void) | undefined;
  onSelect: ((selection: OverlaySelection) => void) | undefined;
  onToggleRequest?: (enabled: boolean) => void;
  reviewerName: string | undefined;
  serverUrl: string | undefined;
  submitOptions: Omit<SubmitReviewOptions, "endpoint"> | undefined;
  window: Window | undefined;
  zIndex?: number;
}

function ReviewOverlayBridge({
  commentComposer,
  document,
  enabled,
  keyboardShortcut,
  onHover,
  onSelect,
  onReviewCreated,
  onReviewError,
  onToggleRequest,
  reviewerName,
  serverUrl,
  submitOptions,
  window,
  zIndex
}: ReviewOverlayBridgeProps): null {
  const controllerRef = useRef<ReviewOverlayController | null>(null);
  const latestOnHover = useRef<typeof onHover>(onHover);
  const latestOnSelect = useRef<typeof onSelect>(onSelect);
  const latestOnReviewCreated = useRef<typeof onReviewCreated>(onReviewCreated);
  const latestOnReviewError = useRef<typeof onReviewError>(onReviewError);
  const latestReviewerName = useRef(reviewerName);
  const latestServerUrl = useRef(serverUrl);
  const latestSubmitOptions = useRef(submitOptions);

  latestOnHover.current = onHover;
  latestOnSelect.current = onSelect;
  latestOnReviewCreated.current = onReviewCreated;
  latestOnReviewError.current = onReviewError;
  latestReviewerName.current = reviewerName;
  latestServerUrl.current = serverUrl;
  latestSubmitOptions.current = submitOptions;

  useEffect(() => {
    if (!document || !window) {
      return undefined;
    }

    const composerOptions: ReviewCommentComposerOptions | false =
      commentComposer === false
        ? false
        : {
            ...commentComposer,
            onCancel(selection: OverlaySelection) {
              commentComposer?.onCancel?.(selection);
            },
            onSubmit(submission: ReviewCommentSubmission) {
              void submitCapturedReview(submission);
              commentComposer?.onSubmit?.(submission);
            }
          };
    const overlayOptions: ReviewOverlayOptions = {
      commentComposer: composerOptions,
      document,
      onHover(selection: OverlaySelection | null) {
        latestOnHover.current?.(selection);
      },
      onSelect(selection: OverlaySelection) {
        latestOnSelect.current?.(selection);
      },
      window
    };

    if (keyboardShortcut !== undefined) {
      overlayOptions.keyboardShortcut = keyboardShortcut;
    }

    if (onToggleRequest !== undefined) {
      overlayOptions.onToggleRequest = onToggleRequest;
    }

    if (zIndex !== undefined) {
      overlayOptions.zIndex = zIndex;
    }

    const controller = createReviewOverlay(overlayOptions);

    controllerRef.current = controller;
    controller.setEnabled(enabled);

    return () => {
      controllerRef.current = null;
      controller.destroy();
    };
  }, [commentComposer, document, keyboardShortcut, onToggleRequest, window, zIndex]);

  useEffect(() => {
    const controller = controllerRef.current;

    if (!controller) {
      return;
    }

    controller.setEnabled(enabled);

    if (!enabled) {
      controller.clearSelection();
    }
  }, [enabled]);

  return null;

  async function submitCapturedReview(submission: ReviewCommentSubmission): Promise<void> {
    if (!document || !window) {
      return;
    }

    try {
      const [elementScreenshot, pageScreenshot] = await Promise.all([
        captureElementScreenshot(submission.selection.element),
        capturePageScreenshot({
          document,
          window
        })
      ]);

      const metadata: ReviewMetadata = {
        devicePixelRatio: window.devicePixelRatio ?? 1,
        scrollPosition: {
          x: window.scrollX ?? 0,
          y: window.scrollY ?? 0
        },
        userAgent: window.navigator?.userAgent ?? ""
      };

      if (latestReviewerName.current !== undefined) {
        metadata.reviewerName = latestReviewerName.current;
      }

      const transportOptions: SubmitReviewOptions = {
        ...(latestSubmitOptions.current ?? {})
      };
      const endpoint = resolveReviewEndpoint(latestServerUrl.current);

      if (endpoint !== undefined) {
        transportOptions.endpoint = endpoint;
      }

      const review = await submitReview(
        {
          artifacts: {
            elementScreenshot,
            pageScreenshot
          },
          comment: submission.comment,
          metadata,
          selection: {
            boundingBox: {
              ...submission.selection.boundingBox
            },
            domSnippet: getElementOuterHtml(submission.selection.element),
            locators: generateLocatorBundle(submission.selection.element)
          },
          url: window.location?.href ?? "",
          viewport: {
            height: window.innerHeight ?? document.documentElement?.clientHeight ?? 0,
            width: window.innerWidth ?? document.documentElement?.clientWidth ?? 0
          }
        },
        transportOptions
      );

      latestOnReviewCreated.current?.(review);
    } catch (error) {
      console.error("[peril] Failed to submit review:", error);
      latestOnReviewError.current?.(error, submission);
    }
  }
}

function getElementOuterHtml(element: Element): string {
  return "outerHTML" in element && typeof element.outerHTML === "string" ? element.outerHTML : "";
}

function resolveReviewEndpoint(serverUrl: string | undefined): string | undefined {
  if (!serverUrl) {
    return undefined;
  }

  const normalized = serverUrl.replace(/\/+$/u, "");

  if (/\/api\/reviews$/u.test(normalized)) {
    return normalized;
  }

  if (/\/api$/u.test(normalized)) {
    return `${normalized}/reviews`;
  }

  return `${normalized}/api/reviews`;
}

interface ReviewToggleButtonProps {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}

function ReviewToggleButton({ enabled, setEnabled }: ReviewToggleButtonProps): ReactElement {
  const baseStyle: Record<string, string> = {
    position: "fixed",
    bottom: "16px",
    right: "16px",
    zIndex: "2147483646",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 150ms ease, box-shadow 150ms ease",
    boxShadow: enabled
      ? "0 0 0 2px rgba(245,158,11,0.5), 0 2px 8px rgba(0,0,0,0.3)"
      : "0 2px 8px rgba(0,0,0,0.3)",
    background: enabled ? "#f59e0b" : "#1c1917",
    color: enabled ? "#1c1917" : "#a8a29e"
  };

  return createElement(
    "button",
    {
      type: "button",
      "aria-label": enabled ? "Disable Peril review mode" : "Enable Peril review mode",
      "aria-pressed": String(enabled),
      style: baseStyle,
      onClick() {
        setEnabled((prev: boolean) => !prev);
      },
      onMouseEnter(e: { currentTarget: HTMLElement }) {
        e.currentTarget.style.transform = "scale(1.1)";
      },
      onMouseLeave(e: { currentTarget: HTMLElement }) {
        e.currentTarget.style.transform = "scale(1)";
      }
    },
    createElement(
      "svg",
      {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg",
        "aria-hidden": "true"
      },
      createElement("path", {
        d: "M3 3L7 3L7 7L3 7ZM3 10L7 10L3 14ZM10 3L14 3L10 7ZM17 3L17 7M17 3L13 3M17 3L12 8M3 17L3 13M3 17L7 17M3 17L8 12",
        stroke: "currentColor",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
      })
    )
  );
}
