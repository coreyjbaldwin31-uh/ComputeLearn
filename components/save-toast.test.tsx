import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SaveToast } from "./save-toast";

afterEach(cleanup);

describe("SaveToast", () => {
  it("renders success state by default", () => {
    render(<SaveToast message="Note saved" />);

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("save-toast");
    expect(toast).not.toHaveClass("save-toast--error");
    expect(toast).toHaveTextContent("Note saved");
  });

  it("renders error state with alert semantics", () => {
    render(<SaveToast message="Storage unavailable" variant="error" />);

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("save-toast");
    expect(toast).toHaveClass("save-toast--error");
    expect(toast).toHaveTextContent("Storage unavailable");
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<SaveToast message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders retry action and fires callback in error state", async () => {
    const onAction = vi.fn();

    render(
      <SaveToast
        message="Storage unavailable"
        variant="error"
        actionLabel="Retry save"
        onAction={onAction}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Retry save",
      }),
    );

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
