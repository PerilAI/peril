import { useState } from "react";
import { ReviewProvider } from "@peril/react";
import { ReviewButton } from "./ReviewButton";

function App() {
  const [count, setCount] = useState(0);

  return (
    <ReviewProvider
      serverUrl="http://localhost:4173/api"
      captureScreenshots={true}
    >
      <div className="app">
        <h1>My App</h1>
        <button onClick={() => setCount((c) => c + 1)}>
          Count: {count}
        </button>
        <ReviewButton />
      </div>
    </ReviewProvider>
  );
}

export default App;
