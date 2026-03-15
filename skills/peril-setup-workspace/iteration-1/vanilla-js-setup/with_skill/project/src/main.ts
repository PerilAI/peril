import { createReviewOverlay } from "@peril-ai/core";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h1>My Vanilla App</h1>
    <button id="counter" type="button">Count: 0</button>
    <button id="review-toggle" type="button">Review Mode</button>
  </div>
`;

const counter = document.querySelector<HTMLButtonElement>("#counter")!;
let count = 0;
counter.addEventListener("click", () => {
  count++;
  counter.textContent = `Count: ${count}`;
});

// --- Peril Review Overlay ---
const overlay = createReviewOverlay({
  document,
  window,
  commentComposer: {
    categories: ["bug", "polish", "accessibility", "copy", "ux"],
    severities: ["low", "medium", "high", "critical"],
    onSubmit(submission) {
      console.log("Review submitted:", submission);
    },
  },
  onSelect(selection) {
    console.log("Element selected:", selection.locators);
  },
  keyboardShortcut: {
    ctrlKey: true,
    shiftKey: true,
    key: "r",
  },
  zIndex: 999999,
});

// Review mode toggle button
const reviewToggle =
  document.querySelector<HTMLButtonElement>("#review-toggle")!;
reviewToggle.addEventListener("click", () => {
  const next = !overlay.isEnabled();
  overlay.setEnabled(next);
  reviewToggle.textContent = next ? "Exit Review" : "Review Mode";
});
