import { useReviewMode } from "@peril-ai/react";

export function ReviewButton() {
  const { active, toggle } = useReviewMode();

  return (
    <button onClick={toggle}>
      {active ? "Exit Review" : "Review Mode"}
    </button>
  );
}
