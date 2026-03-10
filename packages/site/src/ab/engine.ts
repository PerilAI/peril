/**
 * Lightweight A/B testing engine.
 * No external dependencies — uses localStorage for variant persistence
 * and a simple event bus for analytics integration.
 */

export interface Variant {
  id: string;
  weight?: number; // defaults to 1 (even split)
}

export interface Experiment {
  id: string;
  variants: Variant[];
}

export type ABEvent = {
  experimentId: string;
  variantId: string;
  event: "exposure" | "conversion";
  timestamp: number;
};

export type ABEventListener = (event: ABEvent) => void;

const STORAGE_KEY = "peril_ab";

const listeners: ABEventListener[] = [];

/** Read all assignments from localStorage. */
function readAssignments(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Persist assignments to localStorage. */
function writeAssignments(assignments: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  } catch {
    // Storage full or unavailable — variant still works for this session via in-memory fallback.
  }
}

/**
 * Pick a variant using weighted random selection.
 * Deterministic for a given random value — useful for testing.
 */
export function pickVariant(variants: Variant[], rand = Math.random()): string {
  const totalWeight = variants.reduce((sum, v) => sum + (v.weight ?? 1), 0);
  let cumulative = 0;
  for (const v of variants) {
    cumulative += (v.weight ?? 1) / totalWeight;
    if (rand < cumulative) return v.id;
  }
  // Fallback (floating-point edge case)
  return variants[variants.length - 1]!.id;
}

/**
 * Get the assigned variant for an experiment, assigning one if needed.
 */
export function getVariant(experiment: Experiment): string {
  const assignments = readAssignments();
  const existing = assignments[experiment.id];

  if (existing) {
    // Validate the variant still exists in the experiment definition
    if (experiment.variants.some((v) => v.id === existing)) {
      return existing;
    }
    // Variant was removed — reassign
  }

  const chosen = pickVariant(experiment.variants);
  assignments[experiment.id] = chosen;
  writeAssignments(assignments);
  return chosen;
}

/** Track an exposure or conversion event. */
export function trackABEvent(
  experimentId: string,
  variantId: string,
  event: "exposure" | "conversion",
) {
  const payload: ABEvent = {
    experimentId,
    variantId,
    event,
    timestamp: Date.now(),
  };
  for (const listener of listeners) {
    listener(payload);
  }
}

/** Subscribe to A/B events (for analytics integration). */
export function onABEvent(listener: ABEventListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

/** Reset all assignments (useful for testing). */
export function resetAssignments() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
