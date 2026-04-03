import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StorageRecoveryDialog } from "./storage-recovery-dialog";

afterEach(cleanup);

describe("StorageRecoveryDialog", () => {
  it("renders dialog and runs recovery actions", async () => {
    const onClose = vi.fn();
    const onRetry = vi.fn();
    const onExportBackup = vi.fn();
    const onResetLocalData = vi.fn();

    render(
      <StorageRecoveryDialog
        isOpen
        onClose={onClose}
        onRetry={onRetry}
        onExportBackup={onExportBackup}
        onResetLocalData={onResetLocalData}
      />,
    );

    expect(
      screen.getByRole("dialog", { name: "Storage recovery options" }),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Retry save" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Export backup" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Reset local data" }),
    );

    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onExportBackup).toHaveBeenCalledTimes(1);
    expect(onResetLocalData).toHaveBeenCalledTimes(1);
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();

    render(
      <StorageRecoveryDialog
        isOpen
        onClose={onClose}
        onRetry={vi.fn()}
        onExportBackup={vi.fn()}
        onResetLocalData={vi.fn()}
      />,
    );

    await userEvent.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
