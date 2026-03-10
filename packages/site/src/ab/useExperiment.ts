import { useEffect, useRef, useState } from "react";
import {
  type Experiment,
  getVariant,
  trackABEvent,
} from "./engine";

/**
 * React hook for A/B testing.
 *
 * Returns the assigned variant ID and a `convert()` callback.
 * Fires an "exposure" event once on mount.
 *
 * @example
 * const { variant, convert } = useExperiment({
 *   id: "hero-headline",
 *   variants: [{ id: "control" }, { id: "short-copy" }],
 * });
 */
export function useExperiment(experiment: Experiment) {
  const [variant] = useState(() => getVariant(experiment));
  const exposed = useRef(false);

  useEffect(() => {
    if (!exposed.current) {
      exposed.current = true;
      trackABEvent(experiment.id, variant, "exposure");
    }
  }, [experiment.id, variant]);

  const convert = () => {
    trackABEvent(experiment.id, variant, "conversion");
  };

  return { variant, convert };
}
