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
} from "@peril/core";

export { getBestLocatorSummary, getRankedLocators, locatorPriority } from "@peril/core";

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
    ...(serverUrl === undefined ? {} : { serverUrl })
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
          createElement(ReviewOverlayBridge, {
            commentComposer,
            document: targetDocument,
            enabled,
            keyboardShortcut,
            onHover,
            onSelect,
            onReviewCreated,
            onReviewError,
            onToggleRequest: onToggleRequest ?? setEnabled,
            reviewerName,
            serverUrl,
            submitOptions,
            window: targetWindow,
            zIndex
          }),
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
  zIndex: number | undefined;
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

  return /\/api\/reviews\/?$/u.test(serverUrl)
    ? serverUrl
    : `${serverUrl.replace(/\/+$/u, "")}/api/reviews`;
}
