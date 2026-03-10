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
      value: createContextValue(enabled, setEnabled, serverUrl)
    },
    children,
    portalTarget
      ? createPortal(
          createElement(
            ReviewOverlayBridge,
            createBridgeProps({
              document: targetDocument,
              enabled,
              onHover,
              onSelect,
              window: targetWindow,
              zIndex
            })
          ),
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
  document?: Document;
  enabled: boolean;
  onHover?: (selection: OverlaySelection | null) => void;
  onSelect?: (selection: OverlaySelection) => void;
  window?: Window;
  zIndex?: number;
}

interface ReviewOverlayBridgeInput {
  document: Document | undefined;
  enabled: boolean;
  onHover: ((selection: OverlaySelection | null) => void) | undefined;
  onSelect: ((selection: OverlaySelection) => void) | undefined;
  window: Window | undefined;
  zIndex: number | undefined;
}

interface ReviewOverlayOptionsInput {
  document: Document;
  onHover: (selection: OverlaySelection | null) => void;
  onSelect: (selection: OverlaySelection) => void;
  window: Window;
  zIndex: number | undefined;
}

function ReviewOverlayBridge({
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

    const controller = createReviewOverlay(
      createOverlayOptions({
        document,
        onHover(selection) {
          latestOnHover.current?.(selection);
        },
        onSelect(selection) {
          latestOnSelect.current?.(selection);
        },
        window,
        zIndex
      })
    );

    controllerRef.current = controller;
    controller.setEnabled(enabled);

    return () => {
      controllerRef.current = null;
      controller.destroy();
    };
  }, [document, window, zIndex]);

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

function createContextValue(
  enabled: boolean,
  setEnabled: Dispatch<SetStateAction<boolean>>,
  serverUrl: string | undefined
): ReviewModeContextValue {
  const value: ReviewModeContextValue = {
    enabled,
    setEnabled
  };

  if (serverUrl !== undefined) {
    value.serverUrl = serverUrl;
  }

  return value;
}

function createBridgeProps(props: ReviewOverlayBridgeInput): ReviewOverlayBridgeProps {
  const bridgeProps: ReviewOverlayBridgeProps = {
    enabled: props.enabled
  };

  if (props.document !== undefined) {
    bridgeProps.document = props.document;
  }

  if (props.onHover !== undefined) {
    bridgeProps.onHover = props.onHover;
  }

  if (props.onSelect !== undefined) {
    bridgeProps.onSelect = props.onSelect;
  }

  if (props.window !== undefined) {
    bridgeProps.window = props.window;
  }

  if (props.zIndex !== undefined) {
    bridgeProps.zIndex = props.zIndex;
  }

  return bridgeProps;
}

function createOverlayOptions(
  props: ReviewOverlayOptionsInput
): Parameters<typeof createReviewOverlay>[0] {
  const options: Parameters<typeof createReviewOverlay>[0] = {
    document: props.document,
    window: props.window
  };

  if (props.onHover !== undefined) {
    options.onHover = props.onHover;
  }

  if (props.onSelect !== undefined) {
    options.onSelect = props.onSelect;
  }

  if (props.zIndex !== undefined) {
    options.zIndex = props.zIndex;
  }

  return options;
}
