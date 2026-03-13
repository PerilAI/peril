import { useState } from "react";
import { ReviewProvider } from "@peril/react";
import { useReviewMode } from "@peril/react";

function ReviewButton() {
  const { active, toggle } = useReviewMode();
  return (
    <button onClick={toggle}>
      {active ? "Exit Review" : "Review Mode"}
    </button>
  );
}

function App() {
  const [count, setCount] = useState(0);

  return (
    <ReviewProvider serverUrl="http://localhost:4173/api" captureScreenshots={true}>
      <div className="app">
        <ReviewButton />
        <h1>My App</h1>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
      </div>
    </ReviewProvider>
  );
}

export default App;
