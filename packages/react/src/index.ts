import {
  createContext,
  createElement,
  useContext,
  useState,
  type Dispatch,
  type ReactElement,
  type ReactNode,
  type SetStateAction
} from "react";

export { getBestLocatorSummary, getRankedLocators, locatorPriority } from "@peril/core";

export interface ReviewModeContextValue {
  enabled: boolean;
  setEnabled: Dispatch<SetStateAction<boolean>>;
}

export interface ReviewProviderProps {
  children: ReactNode;
  initialEnabled?: boolean;
}

const ReviewModeContext = createContext<ReviewModeContextValue | null>(null);

export function ReviewProvider({
  children,
  initialEnabled = false
}: ReviewProviderProps): ReactElement {
  const [enabled, setEnabled] = useState(initialEnabled);

  return createElement(
    ReviewModeContext.Provider,
    {
      value: {
        enabled,
        setEnabled
      }
    },
    children
  );
}

export function useReviewMode(): ReviewModeContextValue {
  const context = useContext(ReviewModeContext);

  if (!context) {
    throw new Error("useReviewMode must be used within a ReviewProvider.");
  }

  return context;
}

