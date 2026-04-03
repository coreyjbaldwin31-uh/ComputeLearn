import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StorageRecoveryLog } from "./storage-recovery-log";

afterEach(cleanup);

describe("StorageRecoveryLog", () => {
  it("renders nothing when empty", () => {
    const { container } = render(<StorageRecoveryLog entries={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders recent incident entries with key metadata", () => {
    render(
      <StorageRecoveryLog
        entries={[
          {
            id: "1",
            atLabel: "just now",
            key: "computelearn-notes",
            outcome: "error",
            message: "Quota exceeded",
          },
          {
            id: "2",
            atLabel: "30s ago",
            key: null,
            outcome: "backup-exported",
            message: "Artifact backup exported",
          },
        ]}
      />,
    );

    expect(screen.getByText("Recent storage incidents")).toBeInTheDocument();
    expect(screen.getByText("Write failed")).toBeInTheDocument();
    expect(
      screen.getByText(/just now - computelearn-notes/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Quota exceeded")).toBeInTheDocument();
    expect(screen.getByText("Backup exported")).toBeInTheDocument();
  });
});
