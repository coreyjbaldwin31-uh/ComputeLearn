import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

/* ---- mock useFocusTrap ---- */
vi.mock("./hooks/use-focus-trap", () => ({
  useFocusTrap: () => ({ current: null }),
}));

import { DataPortabilityDialog } from "./data-portability-dialog";

afterEach(cleanup);

describe("DataPortabilityDialog", () => {
  it("does not render dialog content when isOpen is false", () => {
    render(<DataPortabilityDialog isOpen={false} onClose={vi.fn()} />);

    expect(screen.queryByText("Data Portability")).not.toBeInTheDocument();
    expect(screen.queryByText("Export Backup")).not.toBeInTheDocument();
  });

  it("renders export and import sections when isOpen is true", () => {
    render(<DataPortabilityDialog isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText("Data Portability")).toBeInTheDocument();
    expect(screen.getByText("Export Backup")).toBeInTheDocument();
    expect(screen.getByText("Import Backup")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download Backup" }),
    ).toBeInTheDocument();
  });

  it("export button triggers JSON download", async () => {
    const user = userEvent.setup();
    const fakeUrl = "blob:http://localhost/fake";
    const createObjectURL = vi.fn().mockReturnValue(fakeUrl);
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    render(<DataPortabilityDialog isOpen={true} onClose={vi.fn()} />);

    // Now mock createElement AFTER the dialog has rendered
    const clickSpy = vi.fn();
    const removeSpy = vi.fn();
    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: clickSpy,
          remove: removeSpy,
        } as unknown as HTMLAnchorElement;
      }
      return origCreateElement(tag);
    });
    vi.spyOn(document.body, "appendChild").mockImplementation(
      (node) => node as HTMLElement,
    );

    await user.click(screen.getByRole("button", { name: "Download Backup" }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith(fakeUrl);

    vi.restoreAllMocks();
  });
});
