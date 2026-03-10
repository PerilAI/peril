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
  type ReviewKeyboardShortcut,
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
  keyboardShortcut?: ReviewKeyboardShortcut | false;
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
  keyboardShortcut,
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

  const bridgeProps: ReviewOverlayBridgeProps = {
    document: targetDocument,
    enabled,
    onToggleRequest: setEnabled,
    window: targetWindow,
    ...(commentComposer === undefined ? {} : { commentComposer }),
    ...(keyboardShortcut === undefined ? {} : { keyboardShortcut }),
    ...(onHover === undefined ? {} : { onHover }),
    ...(onSelect === undefined ? {} : { onSelect }),
    ...(zIndex === undefined ? {} : { zIndex })
  };

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
  keyboardShortcut?: ReviewKeyboardShortcut | false;
  onHover?: (selection: OverlaySelection | null) => void;
  onSelect?: (selection: OverlaySelection) => void;
  onToggleRequest?: (enabled: boolean) => void;
  window?: Window;
  zIndex?: number;
}

function ReviewOverlayBridge({
  commentComposer,
  document,
  enabled,
  keyboardShortcut,
  onHover,
  onSelect,
  onToggleRequest,
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

    const handleHover = (selection: OverlaySelection | null): void => {
      latestOnHover.current?.(selection);
    };
    const handleSelect = (selection: OverlaySelection): void => {
      latestOnSelect.current?.(selection);
    };

    const controller = createReviewOverlay({
      document,
      window,
      ...(commentComposer === undefined ? {} : { commentComposer }),
      ...(keyboardShortcut === undefined ? {} : { keyboardShortcut }),
      ...(onToggleRequest === undefined ? {} : { onToggleRequest }),
      ...(zIndex === undefined ? {} : { zIndex }),
      onHover: handleHover,
      onSelect: handleSelect
    });

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
}
