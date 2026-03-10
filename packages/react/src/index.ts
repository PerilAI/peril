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
  createReviewOverlay,
  getBestLocatorSummary,
  getRankedLocators,
  locatorPriority,
  type OverlaySelection,
  type ReviewCommentComposerOptions,
  type ReviewOverlayController
} from "@peril/core";

export { getBestLocatorSummary, getRankedLocators, locatorPriority } from "@peril/core";

export interface ReviewModeContextValue {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
  serverUrl?: string;
}

export interface ReviewProviderProps {
  children: ReactNode;
  commentComposer?: ReviewCommentComposerOptions | false;
  document?: Document;
  initialEnabled?: boolean;
  onHover?: (selection: OverlaySelection | null) => void;
  onSelect?: (selection: OverlaySelection) => void;
  serverUrl?: string;
  window?: Window;
  zIndex?: number;
}

const ReviewModeContext = createContext<ReviewModeContextValue | null>(null);

export function ReviewProvider({
  children,
  commentComposer,
  document,
  initialEnabled = false,
  onHover,
  onSelect,
  serverUrl,
  window,
  zIndex
}: ReviewProviderProps): ReactElement {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [portalReady, setPortalReady] = useState(false);
  const targetDocument = document ?? globalThis.document;
  const targetWindow = window ?? globalThis.window;
  const portalTarget = portalReady ? targetDocument?.body ?? targetDocument?.documentElement : null;

  useEffect(() => {
    if (targetDocument?.body ?? targetDocument?.documentElement) {
      setPortalReady(true);
    }
  }, [targetDocument]);

  return createElement(
    ReviewModeContext.Provider,
    {
      value: {
        enabled,
        serverUrl,
        setEnabled
      }
    },
    children,
    portalTarget
      ? createPortal(
          createElement(ReviewOverlayBridge, {
            commentComposer,
            document: targetDocument,
            enabled,
            onHover,
            onSelect,
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
  commentComposer?: ReviewCommentComposerOptions | false;
  document?: Document;
  enabled: boolean;
  onHover?: (selection: OverlaySelection | null) => void;
  onSelect?: (selection: OverlaySelection) => void;
  window?: Window;
  zIndex?: number;
}

function ReviewOverlayBridge({
  commentComposer,
  document,
  enabled,
  onHover,
  onSelect,
  window,
  zIndex
}: ReviewOverlayBridgeProps): null {
  const controllerRef = useRef<ReviewOverlayController | null>(null);
  const latestOnHover = useRef<typeof onHover>(onHover);
  const latestOnSelect = useRef<typeof onSelect>(onSelect);

  latestOnHover.current = onHover;
  latestOnSelect.current = onSelect;

  useEffect(() => {
    if (!document || !window) {
      return undefined;
    }

    const controller = createReviewOverlay({
      commentComposer,
      document,
      onHover(selection) {
        latestOnHover.current?.(selection);
      },
      onSelect(selection) {
        latestOnSelect.current?.(selection);
      },
      window,
      zIndex
    });

    controllerRef.current = controller;
    controller.setEnabled(enabled);

    return () => {
      controllerRef.current = null;
      controller.destroy();
    };
  }, [commentComposer, document, window, zIndex]);

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
}
