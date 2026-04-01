import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "./error-boundary";

afterEach(cleanup);

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("Test crash");
  return <p>Content is visible</p>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Content is visible")).toBeInTheDocument();
  });

  it("renders fallback UI when a child throws", () => {
    // Suppress React error boundary console noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.getByText(/Your progress is saved locally/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it("recovers when Try again is clicked", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    let shouldThrow = true;
    function Child() {
      if (shouldThrow) throw new Error("Boom");
      return <p>Recovered!</p>;
    }

    render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Fix the child so it does not throw on re-render
    shouldThrow = false;

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("Recovered!")).toBeInTheDocument();

    spy.mockRestore();
  });
});
