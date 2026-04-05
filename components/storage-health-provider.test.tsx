import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./hooks/use-storage-health", () => ({
  useStorageHealth: () => [
    {
      mode: "stable",
      errorFlash: null,
      systemFlash: null,
      errorCount: 0,
      lastFailureKey: null,
      lastSuccessfulSaveLabel: null,
      isSaveStale: false,
      noteDirty: false,
      reflectionDirty: false,
      profileDirty: false,
      surfaceFailures: {},
      recoveryLog: [],
      showRecoveryDialog: false,
    },
    {
      markNoteDirty: vi.fn(),
      markReflectionDirty: vi.fn(),
      markProfileDirty: vi.fn(),
      retryFailedWrite: vi.fn(),
      exportRecoveryBackup: vi.fn(),
      resetAfterFailure: vi.fn(),
      openRecoveryDialog: vi.fn(),
      closeRecoveryDialog: vi.fn(),
      dismissRecovered: vi.fn(),
    },
  ],
}));

import {
  StorageHealthProvider,
  useStorageHealthContext,
} from "./storage-health-provider";

afterEach(cleanup);

describe("StorageHealthProvider", () => {
  it("renders children", () => {
    render(
      <StorageHealthProvider>
        <p>child content</p>
      </StorageHealthProvider>,
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });

  it("provides health and actions via useStorageHealthContext", () => {
    function Consumer() {
      const ctx = useStorageHealthContext();
      return (
        <div>
          <span data-testid="mode">{ctx.health.mode}</span>
          <span data-testid="has-retry">
            {typeof ctx.actions.retryFailedWrite}
          </span>
        </div>
      );
    }

    render(
      <StorageHealthProvider>
        <Consumer />
      </StorageHealthProvider>,
    );

    expect(screen.getByTestId("mode")).toHaveTextContent("stable");
    expect(screen.getByTestId("has-retry")).toHaveTextContent("function");
  });

  it("throws when useStorageHealthContext is used outside provider", () => {
    function Orphan() {
      useStorageHealthContext();
      return null;
    }

    // Suppress React error boundary noise
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Orphan />)).toThrow(
      "useStorageHealthContext must be used within StorageHealthProvider",
    );

    spy.mockRestore();
  });
});
