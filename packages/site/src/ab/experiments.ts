import type { Experiment } from "./engine";

/**
 * Central registry of all active experiments.
 * Add new experiments here; remove when concluded.
 */

export const heroHeadline: Experiment = {
  id: "hero-headline",
  variants: [
    { id: "control" },      // "Visual feedback your agents understand"
    { id: "short-copy" },   // "Click. Comment. Ship the fix."
  ],
};

export const ctaLabel: Experiment = {
  id: "cta-label",
  variants: [
    { id: "control" },       // "Try Peril Free"
    { id: "get-started" },   // "Get Started"
  ],
};
