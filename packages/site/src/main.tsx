import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import {
  trackPageView,
  observeScrollDepth,
  observeWebVitals,
  bridgeABToAnalytics,
} from "./analytics";
import "./styles/global.css";

// Initialize analytics observers
trackPageView();
observeScrollDepth();
observeWebVitals();
bridgeABToAnalytics();

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
