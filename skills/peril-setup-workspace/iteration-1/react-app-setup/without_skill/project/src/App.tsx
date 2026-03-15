import { useState } from "react";
import { ReviewProvider, useReviewMode } from "@peril-ai/react";

function ReviewToggle() {
  const { enabled, setEnabled } = useReviewMode();

  return (
    <button
      onClick={() => setEnabled(!enabled)}
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 2147483646,
        padding: "8px 16px",
        borderRadius: 999,
        border: "none",
        background: enabled ? "#0284c7" : "#334155",
        color: "#ffffff",
        cursor: "pointer",
        fontSize: 14,
      }}
    >
      {enabled ? "Exit Review" : "Review UI"}
    </button>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <ReviewProvider
      serverUrl="http://127.0.0.1:4173"
      reviewerName="Team Reviewer"
    >
      <div className="app">
        <h1>My App</h1>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </div>
      <ReviewToggle />
    </ReviewProvider>
  );
}

export default App;
