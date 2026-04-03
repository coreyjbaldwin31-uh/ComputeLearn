import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StorageSurfaceChip } from "./storage-surface-chip";

afterEach(cleanup);

describe("StorageSurfaceChip", () => {
  it("renders healthy state with save recency", () => {
    render(
      <StorageSurfaceChip
        label="Notes save"
        mode="stable"
        lastSuccessfulSaveLabel="15s ago"
        isSaveStale={false}
        onOpenRecovery={vi.fn()}
      />,
    );

    expect(screen.getByText("Notes save")).toBeInTheDocument();
    expect(screen.getByText("Healthy")).toBeInTheDocument();
    expect(screen.getByText(/Last save: 15s ago/i)).toBeInTheDocument();
  });

  it("exposes recovery action in degraded state", async () => {
    const onOpenRecovery = vi.fn();

    render(
      <StorageSurfaceChip
        label="Profile save"
        mode="degraded"
        lastSuccessfulSaveLabel="2m ago"
        isSaveStale={false}
        onOpenRecovery={onOpenRecovery}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Recovery" }));

    expect(onOpenRecovery).toHaveBeenCalledTimes(1);
  });
});
