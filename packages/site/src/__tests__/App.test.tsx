import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { App } from "../App";

describe("App", () => {
  it("renders the hero headline", () => {
    render(<App />);
    expect(screen.getAllByText(/Point at the bug\./i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Your agent fixes it\./i).length).toBeGreaterThan(0);
  });

  it("renders dual CTAs", () => {
    render(<App />);
    expect(screen.getAllByText("Try Peril Free").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("See How It Works").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the skip-to-content link for a11y", () => {
    render(<App />);
    expect(screen.getAllByText("Skip to content").length).toBeGreaterThan(0);
  });

  it("renders the how-it-works section", () => {
    render(<App />);
    expect(screen.getAllByText("Annotate").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Structure").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Execute").length).toBeGreaterThan(0);
  });

  it("renders the theme toggle button", () => {
    render(<App />);
    expect(screen.getAllByLabelText(/Switch to .+ mode/).length).toBeGreaterThan(0);
  });
});
