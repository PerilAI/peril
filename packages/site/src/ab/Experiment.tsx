import type { ReactNode } from "react";
import type { Experiment as ExperimentDef } from "./engine";
import { useExperiment } from "./useExperiment";

interface ExperimentProps {
  experiment: ExperimentDef;
  children: Record<string, ReactNode>;
  fallback?: ReactNode;
}

/**
 * Declarative A/B test component.
 *
 * @example
 * <Experiment
 *   experiment={{ id: "hero-headline", variants: [{ id: "control" }, { id: "short-copy" }] }}
 * >
 *   {{
 *     control: <h1>Visual feedback your agents understand</h1>,
 *     "short-copy": <h1>Click. Comment. Ship.</h1>,
 *   }}
 * </Experiment>
 */
export function Experiment({ experiment, children, fallback }: ExperimentProps) {
  const { variant } = useExperiment(experiment);
  return <>{children[variant] ?? fallback ?? null}</>;
}
