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
        isDirty={false}
        failedCount={0}
        lastErrorReason={null}
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
        isDirty={false}
        failedCount={2}
        lastErrorReason="Quota exceeded"
        onOpenRecovery={onOpenRecovery}
      />,
    );

    expect(
      screen.getByText(/Warning - 2 failed attempts - Quota exceeded/i),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Recovery" }));

    expect(onOpenRecovery).toHaveBeenCalledTimes(1);
  });

  it("shows saving state while local edits are pending", () => {
    render(
      <StorageSurfaceChip
        label="Reflection save"
        mode="stable"
        lastSuccessfulSaveLabel="just now"
        isSaveStale={false}
        isDirty
        failedCount={0}
        lastErrorReason={null}
        onOpenRecovery={vi.fn()}
      />,
    );

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("shows critical severity when failures cross threshold", () => {
    render(
      <StorageSurfaceChip
        label="Notes save"
        mode="degraded"
        lastSuccessfulSaveLabel="1m ago"
        isSaveStale={false}
        isDirty={false}
        failedCount={3}
        lastErrorReason="Storage blocked"
        onOpenRecovery={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Critical - 3 failed attempts - Storage blocked/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Browser storage access is blocked/i),
    ).toBeInTheDocument();
  });

  it("shows quota-specific guidance when storage is full", () => {
    render(
      <StorageSurfaceChip
        label="Notes save"
        mode="degraded"
        lastSuccessfulSaveLabel="2m ago"
        isSaveStale={false}
        isDirty={false}
        failedCount={1}
        lastErrorReason="Quota exceeded"
        onOpenRecovery={vi.fn()}
      />,
    );

    expect(
      screen.getByText(/Storage appears full. Export backup and clear old browser data./i),
    ).toBeInTheDocument();
  });
});
