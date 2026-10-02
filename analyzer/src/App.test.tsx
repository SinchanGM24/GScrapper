import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Analyzer app", () => {
  it("shows the empty overview and navigates to settings", async () => {
    render(<App />);
    expect(screen.getByText("Recommended prospects")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    expect(screen.getByText("Make the signal yours.")).toBeInTheDocument();
  });
});
