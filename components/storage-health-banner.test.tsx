import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StorageHealthBanner } from "./storage-health-banner";

afterEach(cleanup);

describe("StorageHealthBanner", () => {
  it("renders degraded state details and opens recovery", async () => {
    const onOpenRecovery = vi.fn();

    render(
      <StorageHealthBanner
        mode="degraded"
        failureCount={2}
        lastFailureKey="computelearn-notes"
        onOpenRecovery={onOpenRecovery}
        onDismissRecovered={vi.fn()}
      />,
    );

    expect(screen.getByText("Save reliability is degraded")).toBeInTheDocument();
    expect(
      screen.getByText(/2 save attempts failed for computelearn-notes/i),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Recovery options" }),
    );

    expect(onOpenRecovery).toHaveBeenCalledTimes(1);
  });

  it("renders recovered state and dismisses", async () => {
    const onDismissRecovered = vi.fn();

    render(
      <StorageHealthBanner
        mode="recovered"
        failureCount={0}
        lastFailureKey={null}
        onOpenRecovery={vi.fn()}
        onDismissRecovered={onDismissRecovered}
      />,
    );

    expect(screen.getByText("Save reliability recovered")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));

    expect(onDismissRecovered).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when mode is stable", () => {
    const { container } = render(
      <StorageHealthBanner
        mode="stable"
        failureCount={0}
        lastFailureKey={null}
        onOpenRecovery={vi.fn()}
        onDismissRecovered={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
